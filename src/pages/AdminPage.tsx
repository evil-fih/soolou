import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ClipboardText,
  Funnel,
  FloppyDisk,
  MagnifyingGlass,
  Package,
  PlusCircle,
  ShieldCheck,
  Trash,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { useProductCatalog } from "../context/ProductCatalogContext";
import type { Product, ProductCategory } from "../data/products";
import {
  archiveAdminProduct,
  createAdminProduct,
  fetchAdminProfiles,
  type AdminRole,
  type ProfileRecord,
  uploadAdminProductImage,
  updateAdminProduct,
  updateProfileRole,
} from "../lib/backend";

type ProductDraft = {
  id?: number;
  slug: string;
  name: string;
  category: ProductCategory | "";
  price: string;
  badge: string;
  description: string;
  detail: string;
  tags: string;
  palette: string;
  extraCategories: string;
  image: string;
};

type ProductSort = "name" | "price-low" | "price-high" | "newest";

const blankDraft: ProductDraft = {
  slug: "",
  name: "",
  category: "",
  price: "",
  badge: "",
  description: "",
  detail: "",
  tags: "",
  palette: "",
  extraCategories: "",
  image: "",
};

const categoryOptions: ProductCategory[] = ["clothes", "hair", "accessories", "limited"];
const roleOptions: AdminRole[] = ["customer", "helper", "admin"];
const categoryLabels: Record<ProductCategory, string> = {
  clothes: "Clothes",
  hair: "Hair",
  accessories: "Accessories",
  limited: "Limited",
};
const roleLabels: Record<AdminRole, string> = {
  customer: "Customer",
  helper: "Helper",
  admin: "Admin",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToText(value: string[] | undefined) {
  return (value ?? []).join(", ");
}

function draftFromProduct(product: Product): ProductDraft {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: String(product.price),
    badge: product.badge,
    description: product.description,
    detail: product.detail,
    tags: listToText(product.tags),
    palette: product.palette,
    extraCategories: listToText(product.extraCategories),
    image: product.image ?? "",
  };
}

function draftToProduct(draft: ProductDraft): Product {
  const palette = draft.palette.trim() || "#7dc7ed";
  const category = draft.category || "clothes";

  return {
    id: draft.id ?? 0,
    slug: slugify(draft.slug || draft.name),
    name: draft.name.trim(),
    category,
    price: Number(draft.price) || 0,
    badge: draft.badge.trim() || "Fresh",
    description: draft.description.trim(),
    detail: draft.detail.trim() || "Hand-drawn Soolou piece made for mix-and-match plush styling.",
    tags: splitList(draft.tags),
    palette,
    extraCategories: splitList(draft.extraCategories).filter((item): item is ProductCategory =>
      categoryOptions.includes(item as ProductCategory),
    ),
    image: draft.image.trim() || undefined,
    look: {
      body: "#f9d8c9",
      belly: "#fff6ef",
      hair: category === "hair" ? palette : "#4c3f4e",
      outfit: palette,
      accent: palette,
      expression: category === "accessories" ? "spark" : "smile",
    },
  };
}

function validateDraft(draft: ProductDraft) {
  if (!draft.name.trim()) return "Product name is required.";
  if (!slugify(draft.slug || draft.name)) return "Slug is required.";
  if (!draft.category) return "Category is required.";
  if (!draft.price.trim()) return "Price is required.";
  if (Number(draft.price) < 0) return "Price needs to be zero or higher.";
  if (!draft.description.trim()) return "Description is required.";
  return "";
}

export function AdminPage() {
  const { user, loading, profileLoading, isAdmin, isStaff, canManageProducts } = useAuth();
  const { allProducts, refreshProducts } = useProductCatalog();
  const [draft, setDraft] = useState<ProductDraft>(blankDraft);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [roleSavingId, setRoleSavingId] = useState("");
  const [roleMessage, setRoleMessage] = useState("");
  const [roleError, setRoleError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [productCategory, setProductCategory] = useState<ProductCategory | "all">("all");
  const [productSort, setProductSort] = useState<ProductSort>("name");

  const editableProducts = useMemo(
    () => allProducts.filter((product) => product.id !== 9001),
    [allProducts],
  );
  const visibleProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    const products = editableProducts.filter((product) => {
      const matchesCategory =
        productCategory === "all" ||
        product.category === productCategory ||
        product.extraCategories?.includes(productCategory);
      const searchableText = [
        product.name,
        product.slug,
        product.badge,
        product.description,
        product.detail,
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!query || searchableText.includes(query));
    });

    return [...products].sort((first, second) => {
      if (productSort === "price-low") return first.price - second.price;
      if (productSort === "price-high") return second.price - first.price;
      if (productSort === "newest") return second.id - first.id;
      return first.name.localeCompare(second.name);
    });
  }, [editableProducts, productCategory, productQuery, productSort]);
  const hasProductFilters = Boolean(productQuery.trim()) || productCategory !== "all" || productSort !== "name";

  function clearProductFilters() {
    setProductQuery("");
    setProductCategory("all");
    setProductSort("name");
  }

  useEffect(() => {
    if (!isAdmin) return;

    let mounted = true;
    setProfilesLoading(true);
    setRoleError("");

    fetchAdminProfiles()
      .then((nextProfiles) => {
        if (mounted) setProfiles(nextProfiles);
      })
      .catch((profileError) => {
        if (mounted) {
          setRoleError(profileError instanceof Error ? profileError.message : "Profiles could not load.");
        }
      })
      .finally(() => {
        if (mounted) setProfilesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  function updateDraft<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({
      ...current,
      [key]: value,
      ...(key === "name" && !current.id ? { slug: slugify(String(value)) } : {}),
    }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!canManageProducts) {
      setError("Only admins can save product changes.");
      return;
    }

    const draftError = validateDraft(draft);
    if (draftError) {
      setError(draftError);
      return;
    }

    setSaving(true);

    try {
      const product = draftToProduct(draft);
      const savedProduct = draft.id ? await updateAdminProduct(product) : await createAdminProduct(product);
      await refreshProducts();
      setDraft(draftFromProduct(savedProduct));
      setMessage(draft.id ? "Product updated." : "Product added.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Product could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    if (!draft.id) return;

    setMessage("");
    setError("");

    if (!canManageProducts) {
      setError("Only admins can archive products.");
      return;
    }

    setSaving(true);

    try {
      await archiveAdminProduct(draft.id);
      await refreshProducts();
      setDraft(blankDraft);
      setMessage("Product archived.");
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Product could not be archived.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(profile: ProfileRecord, nextRole: AdminRole) {
    setRoleMessage("");
    setRoleError("");
    setRoleSavingId(profile.id);

    try {
      const updatedProfile = await updateProfileRole(profile.id, nextRole);
      setProfiles((current) =>
        current.map((item) => (item.id === updatedProfile.id ? updatedProfile : item)),
      );
      setRoleMessage(`${profile.email ?? "This account"} is now ${roleLabels[nextRole]}.`);
    } catch (profileError) {
      setRoleError(profileError instanceof Error ? profileError.message : "Role could not be updated.");
    } finally {
      setRoleSavingId("");
    }
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) return;

    setMessage("");
    setError("");

    if (!canManageProducts) {
      setError("Only admins can upload product images.");
      return;
    }

    setImageUploading(true);

    try {
      const imageUrl = await uploadAdminProductImage(file);
      updateDraft("image", imageUrl);
      setMessage("Image uploaded.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image could not be uploaded.");
    } finally {
      setImageUploading(false);
    }
  }

  if (loading || profileLoading) {
    return (
      <section className="admin-page section">
        <div className="admin-locked-card">
          <ShieldCheck weight="bold" />
          <h1>Checking Admin Access</h1>
          <p>Please wait while Soolou checks your profile.</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="admin-page section">
        <div className="admin-locked-card">
          <ShieldCheck weight="bold" />
          <h1>Admin Sign-In Required</h1>
          <p>Log in with an admin account to manage products.</p>
          <a className="button button-primary button-md" href="#/login">
            Log In
          </a>
        </div>
      </section>
    );
  }

  if (!isStaff) {
    return (
      <section className="admin-page section">
        <div className="admin-locked-card">
          <ShieldCheck weight="bold" />
          <h1>Staff Only</h1>
          <p>Your account does not have store staff access yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page section" aria-labelledby="admin-heading">
      <div className="admin-heading">
        <span className="auth-kicker">{isAdmin ? "Store Admin" : "Store Helper"}</span>
        <h1 id="admin-heading">Product Configuration</h1>
        <p>{isAdmin ? "Add, update, or archive Soolou products without touching code." : "Browse the product catalog and review product details."}</p>
      </div>

      <nav className="admin-section-nav" aria-label="Admin pages">
        <a className="admin-section-nav-active" href="#/admin" aria-current="page">
          <Package weight="bold" />
          Products
        </a>
        <a href="#/admin/orders">
          <ClipboardText weight="bold" />
          Orders
        </a>
      </nav>

      <div className="admin-layout">
        <aside className="admin-product-list" aria-label="Products">
          <button className="admin-new-button" type="button" onClick={() => setDraft(blankDraft)}>
            <PlusCircle weight="bold" />
            <span>New Product</span>
          </button>

          <div className="admin-product-tools" aria-label="Filter products">
            <label className="admin-product-search">
              <span className="sr-only">Search products</span>
              <MagnifyingGlass weight="bold" />
              <input
                type="search"
                placeholder="Search products..."
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
              />
            </label>
            <div className="admin-product-filter-row">
              <label>
                <span className="sr-only">Filter by category</span>
                <Funnel weight="bold" />
                <select
                  aria-label="Filter by category"
                  value={productCategory}
                  onChange={(event) => setProductCategory(event.target.value as ProductCategory | "all")}
                >
                  <option value="all">All Categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabels[category]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Sort products</span>
                <select
                  aria-label="Sort products"
                  value={productSort}
                  onChange={(event) => setProductSort(event.target.value as ProductSort)}
                >
                  <option value="name">Name A-Z</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price Low-High</option>
                  <option value="price-high">Price High-Low</option>
                </select>
              </label>
            </div>
            <div className="admin-product-results" aria-live="polite">
              <span>{visibleProducts.length} of {editableProducts.length} products</span>
              {hasProductFilters ? (
                <button type="button" onClick={clearProductFilters}>
                  <X weight="bold" />
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="admin-product-results-list">
            {visibleProducts.map((product) => (
              <button
                className={draft.id === product.id ? "admin-product-row admin-product-row-active" : "admin-product-row"}
                type="button"
                key={product.id}
                onClick={() => setDraft(draftFromProduct(product))}
              >
                <Package weight="bold" />
                <span>
                  <strong>{product.name}</strong>
                  <small>
                    {categoryLabels[product.category]} - ${product.price}
                  </small>
                </span>
              </button>
            ))}
            {visibleProducts.length === 0 ? (
              <div className="admin-product-empty">
                <Package weight="bold" />
                <strong>No products found</strong>
                <span>Try another search or clear the filters.</span>
              </div>
            ) : null}
          </div>
        </aside>

        <form className="admin-editor" onSubmit={handleSave}>
          {!canManageProducts ? (
            <div className="admin-read-only-notice" role="status">
              <ShieldCheck weight="bold" />
              <span>Helper access is read only. Only admins can save product changes.</span>
            </div>
          ) : null}
          <div className="admin-editor-title">
            <div>
              <span>{draft.id ? `Editing #${draft.id}` : "New Item"}</span>
              <h2>{draft.id ? draft.name || "Untitled Product" : "Add Product"}</h2>
            </div>
            <button className="button button-primary button-md" type="submit" disabled={saving || !canManageProducts}>
              <span className="button-icon">
                <FloppyDisk weight="bold" />
              </span>
              <span>{saving ? "Saving..." : draft.id ? "Save Changes" : "Add Product"}</span>
            </button>
          </div>

          <fieldset className="admin-editor-fields" disabled={!canManageProducts}>
            <div className="admin-form-grid">
              <label>
              <span>Name</span>
              <input placeholder="White Comfy Shorts" value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} />
              </label>
              <label>
              <span>Slug</span>
              <input placeholder="white-comfy-shorts" value={draft.slug} onChange={(event) => updateDraft("slug", event.target.value)} />
              </label>
              <label>
              <span>Category</span>
              <select value={draft.category} onChange={(event) => updateDraft("category", event.target.value as ProductCategory | "")}>
                <option value="" disabled>
                  Choose a category
                </option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
              </label>
              <label>
              <span>Price</span>
              <input placeholder="16" type="number" min="0" step="1" value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} />
              </label>
              <label>
              <span>Badge</span>
              <input placeholder="Fresh" value={draft.badge} onChange={(event) => updateDraft("badge", event.target.value)} />
              </label>
              <label>
              <span>Palette</span>
              <input placeholder="#7dc7ed" value={draft.palette} onChange={(event) => updateDraft("palette", event.target.value)} />
              </label>
              <label className="admin-field-wide">
              <span>Image Path</span>
              <input placeholder="/products/name.jpg" value={draft.image} onChange={(event) => updateDraft("image", event.target.value)} />
              </label>
              <div className="admin-upload-field admin-field-wide">
                <div>
                  <span>Upload Image</span>
                  <p>PNG, JPG, WEBP, or GIF, up to 5 MB.</p>
                </div>
                <label className="admin-upload-button">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    disabled={imageUploading || !canManageProducts}
                    onChange={(event) => handleImageUpload(event.target.files?.[0])}
                  />
                  <span>{imageUploading ? "Uploading..." : canManageProducts ? "Choose Image" : "Admin Upload Only"}</span>
                </label>
                {draft.image ? (
                  <div className="admin-image-preview">
                    <img src={draft.image} alt="" />
                  </div>
                ) : null}
              </div>
              <label className="admin-field-wide">
              <span>Tags</span>
              <input placeholder="shorts, blue, soft" value={draft.tags} onChange={(event) => updateDraft("tags", event.target.value)} />
              </label>
              <label className="admin-field-wide">
              <span>Extra Categories</span>
              <input placeholder="limited" value={draft.extraCategories} onChange={(event) => updateDraft("extraCategories", event.target.value)} />
              </label>
              <label className="admin-field-wide">
              <span>Description</span>
              <textarea placeholder="Soft white shorts for everyday plush styling." value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} />
              </label>
              <label className="admin-field-wide">
              <span>Detail</span>
              <textarea placeholder="Hand-drawn Soolou piece made for mix-and-match plush styling." value={draft.detail} onChange={(event) => updateDraft("detail", event.target.value)} />
              </label>
            </div>
          </fieldset>

          {error ? <div className="settings-message settings-message-error" role="alert">{error}</div> : null}
          {message ? <div className="settings-message settings-message-success">{message}</div> : null}

          <div className="admin-form-actions">
            <button className="button button-primary button-md" type="submit" disabled={saving || !canManageProducts}>
              <span className="button-icon">
                <FloppyDisk weight="bold" />
              </span>
              <span>{saving ? "Saving..." : draft.id ? "Save Changes" : "Add Product"}</span>
            </button>
          </div>

          {draft.id ? (
            <button className="admin-archive-button" type="button" onClick={handleArchive} disabled={saving || !canManageProducts}>
              <Trash weight="bold" />
              <span>Archive Product</span>
            </button>
          ) : null}
        </form>
      </div>

      {isAdmin ? (
        <section className="admin-people-panel" aria-labelledby="admin-people-heading">
          <div className="admin-editor-title">
            <div>
              <span>People</span>
              <h2 id="admin-people-heading">Staff Roles</h2>
            </div>
            <UsersThree weight="bold" />
          </div>

          {profilesLoading ? <p>Loading accounts...</p> : null}
          {roleError ? <div className="settings-message settings-message-error" role="alert">{roleError}</div> : null}
          {roleMessage ? <div className="settings-message settings-message-success">{roleMessage}</div> : null}

          <div className="admin-people-list">
            {profiles.map((profile) => (
              <article className="admin-person-row" key={profile.id}>
                <div>
                  <strong>{profile.full_name || "Soolou Account"}</strong>
                  <span>{profile.email || profile.id}</span>
                </div>
                <label>
                  <span className="sr-only">Role</span>
                  <select
                    value={profile.admin_role}
                    disabled={roleSavingId === profile.id}
                    onChange={(event) => handleRoleChange(profile, event.target.value as AdminRole)}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
