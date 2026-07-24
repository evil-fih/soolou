import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Product } from "../data/products";
import {
  deleteFavoriteProduct,
  fetchFavoriteProducts,
  saveFavoriteProduct,
} from "../lib/backend";
import { useAuth } from "./AuthContext";

interface FavoritesContextValue {
  favorites: Product[];
  favoriteCount: number;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);
const favoritesStorageKey = "soolou-favorites-v1";

function mergeFavorites(products: Product[]) {
  const unique = new Map<number, Product>();
  products.forEach((product) => unique.set(product.id, product));
  return Array.from(unique.values());
}

function readLocalFavorites(): Product[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(favoritesStorageKey);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? mergeFavorites(parsed.filter((product) => product?.id)) : [];
  } catch (error) {
    console.error("Could not read local Soolou favorites", error);
    return [];
  }
}

function saveLocalFavorites(products: Product[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(favoritesStorageKey, JSON.stringify(mergeFavorites(products)));
  } catch (error) {
    console.error("Could not save local Soolou favorites", error);
  }
}

function clearLocalFavorites() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(favoritesStorageKey);
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>(readLocalFavorites);
  const hydratedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      hydratedUserIdRef.current = null;
      return;
    }

    let mounted = true;
    const shouldMergeGuestFavorites = hydratedUserIdRef.current !== user.id;
    hydratedUserIdRef.current = user.id;

    fetchFavoriteProducts(user.id)
      .then((backendFavorites) => {
        if (!mounted) return;
        const guestFavorites = shouldMergeGuestFavorites ? readLocalFavorites() : [];
        const mergedFavorites = mergeFavorites([...backendFavorites, ...guestFavorites]);
        setFavorites(mergedFavorites);

        if (shouldMergeGuestFavorites) {
          guestFavorites.forEach((product) => {
            saveFavoriteProduct(user.id, product).catch((error) => {
              console.error("Could not sync favorite", error);
            });
          });
          clearLocalFavorites();
        }
      })
      .catch((error) => {
        console.error("Could not load Soolou favorites", error);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) saveLocalFavorites(favorites);
  }, [favorites, user]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      favoriteCount: favorites.length,
      isFavorite: (productId) => favorites.some((product) => product.id === productId),
      toggleFavorite: (product) => {
        setFavorites((current) => {
          const saved = current.some((item) => item.id === product.id);

          if (user && saved) {
            deleteFavoriteProduct(user.id, product.id).catch((error) => {
              console.error("Could not remove favorite", error);
            });
          }

          if (user && !saved) {
            saveFavoriteProduct(user.id, product).catch((error) => {
              console.error("Could not save favorite", error);
            });
          }

          return saved
            ? current.filter((item) => item.id !== product.id)
            : [...current, product];
        });
      },
      removeFavorite: (productId) => {
        if (user) {
          deleteFavoriteProduct(user.id, productId).catch((error) => {
            console.error("Could not remove favorite", error);
          });
        }

        setFavorites((current) => current.filter((product) => product.id !== productId));
      },
    }),
    [favorites, user],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider.");
  }

  return context;
}
