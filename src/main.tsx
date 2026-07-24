import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ProductCatalogProvider } from "./context/ProductCatalogContext";
import "./styles.css";

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
