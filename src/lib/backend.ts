import type { User } from "@supabase/supabase-js";
import type { CartItem } from "../context/CartContext";
import { normalizeBasePlushProduct } from "../data/basePlush";
import type { Product } from "../data/products";
import { isSupabaseConfigured, supabase } from "./supabase";

export interface CheckoutInput {
  userId?: string;
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryNotes: string;
  giftWrap: boolean;
  giftWrapFee: number;
  subtotal: number;
  total: number;
  items: CartItem[];
}

export interface ContactInput {
  userId?: string;
  name: string;
  email: string;
  message: string;
  company?: string;
}

export interface SoolouChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SoolouChatProductContext {
  name: string;
  category: string;
  price: number;
  badge: string;
  description: string;
}

export interface SoolouWebsiteContext {
  currentPath: string;
  products: SoolouChatProductContext[];
}

export interface OrderSummary {
  id: string;
  status: AdminOrderStatus;
  payment_status: PaymentStatus;
  payment_provider: string | null;
  paid_at: string | null;
  total: number;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
  }>;
}

export type AdminOrderStatus =
  | "studio_review"
  | "confirmed"
  | "making"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded";

export interface AdminOrderItem {
  id: string;
  product_id: number;
  product_slug: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  product_snapshot: Product;
}

export interface AdminOrder {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  delivery_notes: string | null;
  gift_wrap: boolean;
  gift_wrap_fee: number;
  subtotal: number;
  total: number;
  status: AdminOrderStatus;
  payment_status: PaymentStatus;
  payment_provider: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  order_items: AdminOrderItem[];
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
}

export interface PlushDesignSnapshot {
  selectedSlugs: string[];
}

export interface SavedPlushDesign {
  id: string;
  name: string;
  created_at: string;
  design_snapshot: PlushDesignSnapshot;
}

export type AdminRole = "customer" | "helper" | "admin";

export interface ProfileRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  is_admin: boolean;
  admin_role: AdminRole;
}

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  category: Product["category"];
  price: number | string;
  badge: string | null;
  description: string | null;
  detail: string | null;
  tags: string[] | null;
  palette: string | null;
  extra_categories: Product["category"][] | null;
  image: string | null;
  look: Product["look"] | null;
};

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  return supabase;
}

function normalizeProfile(profile: Partial<ProfileRecord> | null): ProfileRecord | null {
  if (!profile?.id) return null;

  const storedRole = profile.admin_role as string | undefined;
  const role: AdminRole =
    profile.is_admin || storedRole === "admin"
      ? "admin"
      : storedRole === "helper" || storedRole === "sub_admin"
        ? "helper"
        : "customer";

  return {
    id: profile.id,
    full_name: profile.full_name ?? null,
    email: profile.email ?? null,
    is_admin: role === "admin",
    admin_role: role,
  };
}

function productFromRow(row: ProductRow): Product {
  return normalizeBasePlushProduct({
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price) || 0,
    badge: row.badge ?? "Fresh",
    description: row.description ?? "",
    detail: row.detail ?? "Hand-drawn Soolou piece made for mix-and-match plush styling.",
    tags: row.tags ?? [],
    palette: row.palette ?? "#7dc7ed",
    extraCategories: row.extra_categories ?? [],
    image: row.image ?? undefined,
    look: row.look ?? {
      body: "#f9d8c9",
      belly: "#fff6ef",
      hair: row.category === "hair" ? row.palette ?? "#4c3f4e" : "#4c3f4e",
      outfit: row.palette ?? "#7dc7ed",
      accent: row.palette ?? "#7dc7ed",
      expression: row.category === "accessories" ? "spark" : "smile",
    },
  });
}

function productSnapshot(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    badge: product.badge,
    description: product.description,
    detail: product.detail,
    tags: product.tags,
    palette: product.palette,
    image: product.image,
    look: product.look,
  };
}

export function canUseBackend() {
  return isSupabaseConfigured && Boolean(supabase);
}

export async function askSoolouHelper(
  messages: SoolouChatMessage[],
  websiteContext: SoolouWebsiteContext,
) {
  try {
    const response = await fetch("/api/soolou-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, websiteContext }),
    });
    const data = await response.json();
    const reply = data?.reply;

    if (!response.ok || typeof reply !== "string" || !reply.trim()) {
      throw new Error(data?.error || "Soolou Helper returned an empty response.");
    }

    return reply.trim();
  } catch (vercelError) {
    if (!supabase) throw vercelError;
  }

  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("soolou-chat", {
    body: { messages, websiteContext },
  });

  if (error) throw error;

  const reply = data?.reply;
  if (typeof reply !== "string" || !reply.trim()) {
    throw new Error("Soolou Helper returned an empty response.");
  }

  return reply.trim();
}

export async function upsertProfile(user: User) {
  if (!canUseBackend()) return;

  const fullName = user.user_metadata?.full_name;

  await requireSupabase()
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email,
        full_name: typeof fullName === "string" ? fullName : null,
      },
      { onConflict: "id" },
    );
}

export async function fetchProfile(userId: string) {
  if (!canUseBackend()) return null;

  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("id, full_name, email, is_admin, admin_role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  return normalizeProfile(data as Partial<ProfileRecord> | null);
}

export async function fetchAdminProfiles() {
  if (!canUseBackend()) return [];

  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("id, full_name, email, is_admin, admin_role")
    .order("email", { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .map((profile) => normalizeProfile(profile as Partial<ProfileRecord>))
    .filter((profile): profile is ProfileRecord => Boolean(profile));
}

export async function updateProfileRole(userId: string, adminRole: AdminRole) {
  const { data, error } = await requireSupabase()
    .rpc("set_profile_admin_role", {
      p_user_id: userId,
      p_admin_role: adminRole,
    })
    .single();

  if (error) throw error;

  return normalizeProfile(data as Partial<ProfileRecord>)!;
}

function safeFileName(fileName: string) {
  const [name = "product", extension = "png"] = fileName.split(/\.(?=[^.]+$)/);
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return `${safeName || "product"}-${Date.now()}.${extension.toLowerCase()}`;
}

export async function uploadAdminProductImage(file: File) {
  const client = requireSupabase();
  const filePath = `products/${safeFileName(file.name)}`;

  const { error } = await client.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = client.storage.from("product-images").getPublicUrl(filePath);
  return data.publicUrl;
}

function adminProductRpcColumns(product: Product) {
  return {
    p_slug: product.slug,
    p_name: product.name,
    p_category: product.category,
    p_price: product.price,
    p_badge: product.badge,
    p_description: product.description,
    p_detail: product.detail,
    p_tags: product.tags,
    p_palette: product.palette,
    p_extra_categories: product.extraCategories ?? [],
    p_image: product.image ?? "",
    p_look: product.look,
  };
}

export async function createAdminProduct(product: Product) {
  const { data, error } = await requireSupabase()
    .rpc("create_admin_product", adminProductRpcColumns(product))
    .single();

  if (error) throw error;

  return productFromRow(data as ProductRow);
}

export async function updateAdminProduct(product: Product) {
  const { data, error } = await requireSupabase()
    .rpc("save_admin_product", {
      p_id: product.id,
      ...adminProductRpcColumns(product),
    })
    .single();

  if (error) throw error;

  return productFromRow(data as ProductRow);
}

export async function archiveAdminProduct(productId: number) {
  const { error } = await requireSupabase()
    .rpc("archive_admin_product", {
      p_id: productId,
    });

  if (error) throw error;
}

export async function fetchFavoriteProducts(userId: string) {
  if (!canUseBackend()) return [];

  const { data, error } = await requireSupabase()
    .from("favorites")
    .select("product_snapshot")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => row.product_snapshot as Product);
}

export async function saveFavoriteProduct(userId: string, product: Product) {
  if (!canUseBackend()) return;

  const { error } = await requireSupabase()
    .from("favorites")
    .upsert(
      {
        user_id: userId,
        product_id: product.id,
        product_slug: product.slug,
        product_snapshot: productSnapshot(product),
      },
      { onConflict: "user_id,product_id" },
    );

  if (error) throw error;
}

export async function deleteFavoriteProduct(userId: string, productId: number) {
  if (!canUseBackend()) return;

  const { error } = await requireSupabase()
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) throw error;
}

export async function fetchCartItems(userId: string) {
  if (!canUseBackend()) return [];

  const { data, error } = await requireSupabase()
    .from("cart_items")
    .select("product_id, quantity, product_snapshot")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const seenProducts = new Set<number>();

  return (data ?? []).reduce<CartItem[]>((items, row) => {
    const product = row.product_snapshot as Product;
    const productId = Number(row.product_id ?? product.id);

    if (seenProducts.has(productId)) return items;
    seenProducts.add(productId);

    items.push({
      product,
      quantity: Number(row.quantity) || 1,
    });

    return items;
  }, []);
}

export async function saveCartItem(userId: string, product: Product, quantity: number) {
  if (!canUseBackend()) return;

  if (quantity <= 0) {
    await deleteCartItem(userId, product.id);
    return;
  }

  const { error } = await requireSupabase()
    .from("cart_items")
    .upsert(
      {
        user_id: userId,
        product_id: product.id,
        product_slug: product.slug,
        quantity,
        product_snapshot: productSnapshot(product),
      },
      { onConflict: "user_id,product_id" },
    );

  if (error) throw error;
}

export async function deleteCartItem(userId: string, productId: number) {
  if (!canUseBackend()) return;

  const { error } = await requireSupabase()
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) throw error;
}

export async function clearBackendCart(userId: string) {
  if (!canUseBackend()) return;

  const { error } = await requireSupabase().from("cart_items").delete().eq("user_id", userId);

  if (error) throw error;
}

export async function createOrder(input: CheckoutInput) {
  const client = requireSupabase();
  if (!input.userId) throw new Error("You must be signed in to place an order.");

  const { data, error } = await client.rpc("place_checkout_order", {
    p_full_name: input.fullName,
    p_email: input.email,
    p_address: input.address,
    p_city: input.city,
    p_postal_code: input.postalCode,
    p_delivery_notes: input.deliveryNotes,
    p_gift_wrap: input.giftWrap,
    p_items: input.items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    })),
  });

  if (error) throw error;
  return String(data);
}

export async function completeSandboxPayment(orderId: string) {
  const { data, error } = await requireSupabase()
    .rpc("complete_sandbox_payment", {
      p_order_id: orderId,
    })
    .single();

  if (error) throw error;
  return data;
}

export async function cancelSandboxPayment(orderId: string) {
  const { data, error } = await requireSupabase()
    .rpc("cancel_sandbox_payment", {
      p_order_id: orderId,
    })
    .single();

  if (error) throw error;
  return data;
}

export async function sendContactMessage(input: ContactInput) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result?.sent !== true) {
    throw new Error(result?.error || "Could not email your message. Please try again.");
  }

  if (!canUseBackend()) return;

  await requireSupabase()
    .from("contact_messages")
    .insert({
      user_id: input.userId ?? null,
      name: input.name,
      email: input.email,
      message: input.message,
    });
}

export async function fetchOrderHistory(userId: string) {
  if (!canUseBackend()) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("orders")
    .select(`
      id,
      status,
      payment_status,
      payment_provider,
      paid_at,
      total,
      created_at,
      order_items (
        id,
        product_name,
        quantity
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  let orderData = data;

  if (error) {
    const paymentColumnsMissing = error.code === "42703" || error.code === "PGRST204";
    if (!paymentColumnsMissing) throw error;

    const { data: legacyData, error: legacyError } = await client
      .from("orders")
      .select(`
        id,
        status,
        total,
        created_at,
        order_items (
          id,
          product_name,
          quantity
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (legacyError) throw legacyError;
    orderData = legacyData?.map((order) => ({
      ...order,
      payment_status: "pending",
      payment_provider: null,
      paid_at: null,
    })) ?? [];
  }

  return (orderData ?? []).map((order) => ({
    id: String(order.id),
    status: String(order.status) as AdminOrderStatus,
    payment_status: String(order.payment_status ?? "pending") as PaymentStatus,
    payment_provider: order.payment_provider ? String(order.payment_provider) : null,
    paid_at: order.paid_at ? String(order.paid_at) : null,
    total: Number(order.total) || 0,
    created_at: String(order.created_at),
    order_items: (order.order_items ?? []).map((item) => ({
      id: String(item.id),
      product_name: String(item.product_name),
      quantity: Number(item.quantity) || 1,
    })),
  })) satisfies OrderSummary[];
}

export async function fetchAdminOrders() {
  if (!canUseBackend()) return [];

  const client = requireSupabase();
  const { data, error } = await client.rpc("get_admin_orders");

  let orderData = data;

  if (error) {
    const { data: fallbackData, error: fallbackError } = await client
      .from("orders")
      .select(`
        id,
        user_id,
        customer_name,
        customer_email,
        shipping_address,
        shipping_city,
        shipping_postal_code,
        delivery_notes,
        gift_wrap,
        gift_wrap_fee,
        subtotal,
        total,
        status,
        payment_status,
        payment_provider,
        payment_reference,
        paid_at,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          product_slug,
          product_name,
          unit_price,
          quantity,
          product_snapshot
        )
      `)
      .order("created_at", { ascending: false });

    if (fallbackError) {
      throw new Error(fallbackError.message || error.message || "Orders could not load.");
    }
    orderData = fallbackData;
  }

  const orders = (Array.isArray(orderData) ? orderData : []) as AdminOrder[];

  return orders.map((order) => ({
    id: String(order.id),
    user_id: order.user_id ? String(order.user_id) : null,
    customer_name: String(order.customer_name),
    customer_email: String(order.customer_email),
    shipping_address: String(order.shipping_address),
    shipping_city: String(order.shipping_city),
    shipping_postal_code: String(order.shipping_postal_code),
    delivery_notes: order.delivery_notes ? String(order.delivery_notes) : null,
    gift_wrap: Boolean(order.gift_wrap),
    gift_wrap_fee: Number(order.gift_wrap_fee) || 0,
    subtotal: Number(order.subtotal) || 0,
    total: Number(order.total) || 0,
    status: String(order.status) as AdminOrderStatus,
    payment_status: String(order.payment_status ?? "pending") as PaymentStatus,
    payment_provider: order.payment_provider ? String(order.payment_provider) : null,
    payment_reference: order.payment_reference ? String(order.payment_reference) : null,
    paid_at: order.paid_at ? String(order.paid_at) : null,
    created_at: String(order.created_at),
    updated_at: String(order.updated_at),
    order_items: (order.order_items ?? []).map((item) => ({
      id: String(item.id),
      product_id: Number(item.product_id),
      product_slug: String(item.product_slug),
      product_name: String(item.product_name),
      unit_price: Number(item.unit_price) || 0,
      quantity: Number(item.quantity) || 1,
      product_snapshot: item.product_snapshot as Product,
    })),
  })) satisfies AdminOrder[];
}

export async function updateAdminOrderStatus(orderId: string, status: AdminOrderStatus) {
  const { data, error } = await requireSupabase()
    .rpc("update_order_status", {
      p_order_id: orderId,
      p_status: status,
    })
    .single();

  if (error) throw error;

  const updatedOrder = data as {
    id: string;
    status: AdminOrderStatus;
    updated_at: string;
  };

  return {
    id: String(updatedOrder.id),
    status: String(updatedOrder.status) as AdminOrderStatus,
    updated_at: String(updatedOrder.updated_at),
  };
}

export async function fetchShippingAddress(userId: string) {
  if (!canUseBackend()) return null;

  const { data, error } = await requireSupabase()
    .from("shipping_addresses")
    .select("full_name, email, address, city, postal_code")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data as ShippingAddress | null;
}

function normalizePlushDesignSnapshot(snapshot: unknown): PlushDesignSnapshot {
  if (!snapshot || typeof snapshot !== "object") return { selectedSlugs: [] };

  const selectedSlugs = (snapshot as { selectedSlugs?: unknown }).selectedSlugs;

  return {
    selectedSlugs: Array.isArray(selectedSlugs)
      ? selectedSlugs.filter((slug): slug is string => typeof slug === "string")
      : [],
  };
}

export async function fetchSavedPlushDesigns(userId: string) {
  if (!canUseBackend()) return [];

  const { data, error } = await requireSupabase()
    .from("saved_doll_designs")
    .select("id, name, created_at, design_snapshot")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((design) => ({
    id: String(design.id),
    name: String(design.name),
    created_at: String(design.created_at),
    design_snapshot: normalizePlushDesignSnapshot(design.design_snapshot),
  })) satisfies SavedPlushDesign[];
}

export async function fetchSavedPlushDesign(userId: string, designId: string) {
  if (!canUseBackend()) return null;

  const { data, error } = await requireSupabase()
    .from("saved_doll_designs")
    .select("id, name, created_at, design_snapshot")
    .eq("user_id", userId)
    .eq("id", designId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: String(data.id),
    name: String(data.name),
    created_at: String(data.created_at),
    design_snapshot: normalizePlushDesignSnapshot(data.design_snapshot),
  } satisfies SavedPlushDesign;
}

export async function savePlushDesign(userId: string, name: string, selectedSlugs: string[]) {
  const { data, error } = await requireSupabase()
    .from("saved_doll_designs")
    .insert({
      user_id: userId,
      name: name.trim() || "Untitled Plush Design",
      design_snapshot: {
        selectedSlugs: [...new Set(selectedSlugs)],
      } satisfies PlushDesignSnapshot,
    })
    .select("id, name, created_at, design_snapshot")
    .single();

  if (error) throw error;

  return {
    id: String(data.id),
    name: String(data.name),
    created_at: String(data.created_at),
    design_snapshot: normalizePlushDesignSnapshot(data.design_snapshot),
  } satisfies SavedPlushDesign;
}
