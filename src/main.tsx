import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ProductCatalogProvider } from "./context/ProductCatalogContext";
import "./styles.css";

console.warn("What you are about to see is a simulation of our normal conversation.")
console.warn("@evil fih is our tech guy, @Alex is our CEO, and @Aurora Mina is our product manager")
console.warn("Be ready for cringe")

console.log("<evil fish> Hey whats for lunch guys")
console.log("<Alex> @evil fih shut the fuck up gng ts is not the place for this")
console.log("<evil fish> son im crine")
console.log("<Aurora Mina> what u guys talking about")
console.log("<evil fish> nvm")

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
