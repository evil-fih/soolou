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

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const favoritesRef = useRef<Product[]>([]);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    fetchFavoriteProducts(user.id)
      .then((backendFavorites) => {
        if (!mounted) return;

        if (backendFavorites.length) {
          setFavorites(backendFavorites);
          return;
        }

        favoritesRef.current.forEach((product) => {
          saveFavoriteProduct(user.id, product).catch((error) => {
            console.error("Could not sync favorite", error);
          });
        });
      })
      .catch((error) => {
        console.error("Could not load Soolou favorites", error);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

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
