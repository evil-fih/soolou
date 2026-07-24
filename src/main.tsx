import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ProductCatalogProvider } from "./context/ProductCatalogContext";
import "./styles.css";

console.log("<evil fish> Why are you in Console lol")
console.log("<evil fish> Just close DevTools and buy stuff bruh")
console.log("<evil fish> I'm serious please close DevTools")
console.log("")
console.log("<evil fish> uhhhhhhhhhhhh idk")

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ProductCatalogProvider>
        <CartProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </CartProvider>
      </ProductCatalogProvider>
    </AuthProvider>
  </React.StrictMode>,
);
