import { FloppyDisk, PlusCircleIcon, X } from "@phosphor-icons/react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { CustomizationPanel } from "../components/CustomizationPanel";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useProductCatalog } from "../context/ProductCatalogContext";
import { basePlushProduct } from "../data/basePlush";
import type { Product } from "../data/products";
import { getSlot, hairOptions, slotGroups } from "../data/wearables";
import { fetchSavedPlushDesign, savePlushDesign } from "../lib/backend";

// render order: bottom → dress → top → scarf → tie → hair
const layerOrder = ["bottom", "dress", "top", "scarf", "tie", "hair", "hat", "clip"];
const neckAccessorySlots = new Set(["scarf", "tie"]);
const pendingDesignKey = "soolou-pending-plush-design";

interface CustomizePageProps {
  route: string;
}

function getSortedSlugs(selected: string[]): string[] {
  return [...selected].sort((a, b) => {
    const slotA = getSlot(a);
    const slotB = getSlot(b);
    return layerOrder.indexOf(slotA ?? "") - layerOrder.indexOf(slotB ?? "");
  });
}

function getImageForSlug(slug: string): string {
  const hair = hairOptions.find((h) => h.slug === slug);
  if (hair?.wearable) return hair.wearable;
  if (hair) return hair.image;
  return `/products/wearable/${slug}.png`;
}

export function CustomizePage({ route }: CustomizePageProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [savePanelOpen, setSavePanelOpen] = useState(false);
  const [designName, setDesignName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [designLoading, setDesignLoading] = useState(false);
  const [designMessage, setDesignMessage] = useState("");
  const [designError, setDesignError] = useState("");
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const { products } = useProductCatalog();
  const routeParams = useMemo(() => new URLSearchParams(route.split("?")[1] ?? ""), [route]);
  const savedDesignId = routeParams.get("design");
  const hasHairSelected = selectedSlugs.some((slug) => getSlot(slug) === "hair");

  useEffect(() => {
    if (authLoading || !user || routeParams.get("resume") !== "1") return;

    const pendingDesign = window.sessionStorage.getItem(pendingDesignKey);
    if (!pendingDesign) return;

    try {
      const parsedDesign = JSON.parse(pendingDesign) as { selectedSlugs?: unknown };
      const restoredSlugs = Array.isArray(parsedDesign.selectedSlugs)
        ? parsedDesign.selectedSlugs.filter((slug): slug is string => typeof slug === "string" && Boolean(getSlot(slug)))
        : [];

      setSelectedSlugs(restoredSlugs);
      setDesignMessage("Your design is ready to save.");
      setSavePanelOpen(true);
    } catch {
      setDesignError("Your previous design could not be restored.");
    } finally {
      window.sessionStorage.removeItem(pendingDesignKey);
    }
  }, [authLoading, routeParams, user]);

  useEffect(() => {
    if (!savedDesignId || authLoading) return;

    if (!user) {
      setDesignError("Log in to use this saved design.");
      return;
    }

    let mounted = true;
    setDesignLoading(true);
    setDesignError("");
    setDesignMessage("");

    fetchSavedPlushDesign(user.id, savedDesignId)
      .then((design) => {
        if (!mounted) return;

        if (!design) {
          setDesignError("That saved design could not be found.");
          return;
        }

        setSelectedSlugs(design.design_snapshot.selectedSlugs.filter((slug) => Boolean(getSlot(slug))));
        setDesignName(design.name);
        setDesignMessage(`${design.name} is ready to customize.`);
      })
      .catch((loadError) => {
        if (!mounted) return;
        setDesignError(loadError instanceof Error ? loadError.message : "That saved design could not be loaded.");
      })
      .finally(() => {
        if (mounted) setDesignLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authLoading, savedDesignId, user]);

  function toggleItem(slug: string) {
    setSelectedSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);

      const slot = getSlot(slug);
      let next = [...prev];

      if (slot === "dress") {
        next = next.filter(
          (s) => !slotGroups.top.includes(s) && !slotGroups.bottom.includes(s) && !slotGroups.dress.includes(s),
        );
      } else if (slot === "top" || slot === "bottom") {
        next = next.filter((s) => !slotGroups.dress.includes(s));
        next = next.filter((s) => !(slotGroups[slot] ?? []).includes(s));
      } else if (slot && neckAccessorySlots.has(slot)) {
        next = next.filter((s) => {
          const selectedSlot = getSlot(s);
          return !selectedSlot || !neckAccessorySlots.has(selectedSlot);
        });
      } else if (slot) {
        next = next.filter((s) => !(slotGroups[slot] ?? []).includes(s));
      }

      return [...next, slug];
    });
  }

  const selectedCartProducts = getSortedSlugs(selectedSlugs)
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));

  const total = selectedCartProducts.reduce((sum, product) => sum + product.price, 0);

  function addCustomPlushToCart() {
    addItem(basePlushProduct);
    selectedCartProducts.forEach((product) => addItem(product));
    window.location.hash = "/cart";
  }

  function openSavePanel() {
    setSaveMessage("");
    setSaveError("");

    if (!user) {
      window.sessionStorage.setItem(pendingDesignKey, JSON.stringify({ selectedSlugs }));
      window.location.hash = `/login?redirect=${encodeURIComponent("/customize?resume=1")}`;
      return;
    }

    setSavePanelOpen(true);
  }

  async function handleSaveDesign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage("");
    setSaveError("");

    if (!user) {
      setSaveError("Log in to save this design.");
      return;
    }

    if (designName.trim().length < 2) {
      setSaveError("Please give your design a name.");
      return;
    }

    setSaveLoading(true);

    try {
      const savedDesign = await savePlushDesign(user.id, designName, getSortedSlugs(selectedSlugs));
      setDesignName(savedDesign.name);
      setSaveMessage("Design saved to your account.");
    } catch (saveDesignError) {
      setSaveError(saveDesignError instanceof Error ? saveDesignError.message : "Your design could not be saved.");
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <section className="section customize-layout">
      <div className="customize-preview stitch-frame">
        <div className="customize-copy">
          <h1>Create your own plush</h1>
          <p>Pick the pieces and dress your plush.</p>
          {designLoading ? <span className="customize-design-status">Loading saved design...</span> : null}
          {designMessage ? <span className="customize-design-status" role="status">{designMessage}</span> : null}
          {designError ? <span className="customize-design-status customize-design-status-error" role="alert">{designError}</span> : null}
        </div>
        <div className="plush-canvas">
          <img src="/base-doll-nobg.png" alt="Base plush doll" className="plush-base" />
          {getSortedSlugs(selectedSlugs).map((slug) => (
            <img
              key={slug}
              src={getImageForSlug(slug)}
              alt={slug}
              className={`plush-layer plush-layer-${slug}${
                slug === "cocoa-beret" && hasHairSelected ? " plush-layer-cocoa-beret-with-hair" : ""
              }`}
            />
          ))}
        </div>
      </div>
      <div className="customize-controls">
        <CustomizationPanel products={products} selectedSlugs={selectedSlugs} onToggle={toggleItem} />
        <div className="builder-summary">
          <div className="builder-summary-main">
            <div>
              <span>Estimated total</span>
              <strong>{"$" + (52 + total)}</strong>
            </div>
            <div className="builder-summary-actions">
              <Button
                size="lg"
                variant="secondary"
                icon={<FloppyDisk weight="bold" />}
                onClick={openSavePanel}
              >
                {user ? "Save Design" : "Log In to Save"}
              </Button>
              <Button size="lg" icon={<PlusCircleIcon weight="bold" />} onClick={addCustomPlushToCart}>
                Add To Cart
              </Button>
            </div>
          </div>

          {savePanelOpen && user ? (
            <form className="design-save-form" onSubmit={handleSaveDesign}>
              <div className="design-save-form-heading">
                <div>
                  <strong>Save Plush Design</strong>
                  <span>Keep this outfit ready in your account.</span>
                </div>
                <button type="button" onClick={() => setSavePanelOpen(false)} aria-label="Close save design form">
                  <X weight="bold" />
                </button>
              </div>
              <label>
                <span>Design Name</span>
                <input
                  type="text"
                  value={designName}
                  onChange={(event) => setDesignName(event.target.value)}
                  placeholder="Weekend Cloud Look"
                  maxLength={80}
                  disabled={saveLoading}
                  autoFocus
                />
              </label>
              {saveError ? <div className="settings-message settings-message-error" role="alert">{saveError}</div> : null}
              {saveMessage ? <div className="settings-message settings-message-success" role="status">{saveMessage}</div> : null}
              <Button type="submit" icon={<FloppyDisk weight="bold" />} disabled={saveLoading}>
                {saveLoading ? "Saving..." : "Save to My Account"}
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}
