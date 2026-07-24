import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { normalizeBasePlushProduct } from "../data/basePlush";
import type { Product } from "../data/products";
import { products as fallbackProducts } from "../data/products";
import { useAuth } from "./AuthContext";
import { useProductCatalog } from "./ProductCatalogContext";
import {
  clearBackendCart,
  deleteCartItem,
  fetchCartItems,
  saveCartItem,
} from "../lib/backend";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product) => void;
  updateQuantity: (productId: number, change: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const cartStorageKey = "soolou-cart-v1";
type ProductResolver = (product: Product) => Product | undefined;

function normalizeProduct(product: Product, resolveProduct?: ProductResolver): Product {
  const baseProduct = normalizeBasePlushProduct(product);

  if (baseProduct !== product) return baseProduct;

  return (
    resolveProduct?.(baseProduct) ??
    fallbackProducts.find((item) => item.id === product.id || item.slug === product.slug) ??
    product
  );
}

function normalizeCartItem(item: CartItem, resolveProduct?: ProductResolver): CartItem {
  return {
    ...item,
    product: normalizeProduct(item.product, resolveProduct),
    quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
  };
}

function mergeCartItems(itemsToMerge: CartItem[], resolveProduct?: ProductResolver): CartItem[] {
  const merged = new Map<number, CartItem>();

  itemsToMerge.map((item) => normalizeCartItem(item, resolveProduct)).forEach((item) => {
    const existing = merged.get(item.product.id);

    if (existing) {
      merged.set(item.product.id, {
        product: item.product,
        quantity: existing.quantity + item.quantity,
      });
      return;
    }

    merged.set(item.product.id, item);
  });

  return Array.from(merged.values());
}

function readLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const rawCart = window.localStorage.getItem(cartStorageKey);
    if (!rawCart) return [];

    const parsed = JSON.parse(rawCart);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is CartItem => Boolean(item?.product))
      .map((item) => normalizeCartItem(item));
  } catch (error) {
    console.error("Could not read local Soolou cart", error);
    return [];
  }
}

function saveLocalCart(itemsToSave: CartItem[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(itemsToSave.map((item) => normalizeCartItem(item))));
  } catch (error) {
    console.error("Could not save local Soolou cart", error);
  }
}

function clearLocalCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(cartStorageKey);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { findProductByIdOrSlug } = useProductCatalog();
  const [items, setItems] = useState<CartItem[]>(readLocalCart);
  const [toastVisible, setToastVisible] = useState(false);
  const hydratedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    setItems((current) => mergeCartItems(current, findProductByIdOrSlug));
  }, [findProductByIdOrSlug]);

  useEffect(() => {
    if (user) return;
    saveLocalCart(items);
  }, [items, user]);

  useEffect(() => {
    if (!user) {
      hydratedUserIdRef.current = null;
      return;
    }

    let mounted = true;
    const shouldMergeGuestCart = hydratedUserIdRef.current !== user.id;
    hydratedUserIdRef.current = user.id;

    fetchCartItems(user.id)
      .then((backendItems) => {
        if (!mounted) return;

        const guestItems = shouldMergeGuestCart ? readLocalCart() : [];
        const mergedItems = shouldMergeGuestCart
          ? mergeCartItems([...backendItems, ...guestItems], findProductByIdOrSlug)
          : backendItems.map((item) => normalizeCartItem(item, findProductByIdOrSlug));

        setItems(mergedItems);
        if (shouldMergeGuestCart) clearLocalCart();

        // Hydration should only read cart state. Writes happen from explicit cart actions.
      })
      .catch((error) => {
        console.error("Could not load Soolou cart", error);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!toastVisible) return;

    const timeoutId = window.setTimeout(() => {
      setToastVisible(false);
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [toastVisible]);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem: (product) => {
        const cartProduct = normalizeProduct(product, findProductByIdOrSlug);

        setToastVisible(true);
        setItems((current) => {
          const existing = current.find((item) => item.product.id === cartProduct.id);

          if (existing) {
            const nextQuantity = existing.quantity + 1;
            const next = current.map((item) =>
              item.product.id === cartProduct.id
                ? { ...item, product: cartProduct, quantity: nextQuantity }
                : item,
            );

            if (user) {
              saveCartItem(user.id, cartProduct, nextQuantity).catch((error) => {
                console.error("Could not save cart item", error);
              });
            }

            return next;
          }

          if (user) {
            saveCartItem(user.id, cartProduct, 1).catch((error) => {
              console.error("Could not save cart item", error);
            });
          }

          return [...current, { product: cartProduct, quantity: 1 }];
        });
      },
      updateQuantity: (productId, change) => {
        setItems((current) => {
          const next = current
            .map((item) =>
              item.product.id === productId
                ? { ...item, quantity: item.quantity + change }
                : item,
            )
            .filter((item) => item.quantity > 0);
          const nextItem = next.find((item) => item.product.id === productId);

          if (user && nextItem) {
            saveCartItem(user.id, nextItem.product, nextItem.quantity).catch((error) => {
              console.error("Could not update cart item", error);
            });
          }

          if (user && !nextItem) {
            deleteCartItem(user.id, productId).catch((error) => {
              console.error("Could not remove cart item", error);
            });
          }

          return next;
        });
      },
      removeItem: (productId) => {
        if (user) {
          deleteCartItem(user.id, productId).catch((error) => {
            console.error("Could not remove cart item", error);
          });
        }

        setItems((current) => current.filter((item) => item.product.id !== productId));
      },
      clearCart: () => {
        if (user) {
          clearBackendCart(user.id).catch((error) => {
            console.error("Could not clear cart", error);
          });
        }

        clearLocalCart();
        setItems([]);
      },
    }),
    [findProductByIdOrSlug, itemCount, items, subtotal, user],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className={toastVisible ? "cart-toast cart-toast-visible" : "cart-toast"} role="status">
        Added to cart!
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
