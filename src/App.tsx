import { useEffect, useState } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ChatbotWidget } from "./components/ChatbotWidget";
import { AboutPage } from "./pages/AboutPage";
import { AdminPage } from "./pages/AdminPage";
import { AdminOrdersPage } from "./pages/AdminOrdersPage";
import { AuthPage } from "./pages/AuthPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ContactPage } from "./pages/ContactPage";
import { CustomizePage } from "./pages/CustomizePage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HomePage } from "./pages/HomePage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ProductPage } from "./pages/ProductPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ShopPage } from "./pages/ShopPage";

function getRoute() {
  return window.location.hash.replace(/^#/, "") || "/";
}

export function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const path = route.split("?")[0];
  const productSlug = path.startsWith("/product/") ? path.replace("/product/", "") : undefined;

  let page = <HomePage />;
  if (path === "/shop") page = <ShopPage route={route} />;
  if (path === "/customize") page = <CustomizePage route={route} />;
  if (path === "/cart") page = <CartPage />;
  if (path === "/checkout") page = <CheckoutPage />;
  if (path === "/contact") page = <ContactPage />;
  if (path === "/about") page = <AboutPage />;
  if (path === "/admin") page = <AdminPage />;
  if (path === "/admin/orders") page = <AdminOrdersPage />;
  if (path === "/privacy") page = <PrivacyPage />;
  if (path === "/favorites") page = <FavoritesPage />;
  if (path === "/login") page = <AuthPage mode="login" route={route} />;
  if (path === "/register") page = <AuthPage mode="register" route={route} />;
  if (path === "/profile" || path === "/account") page = <ProfilePage />;
  if (path.startsWith("/product/")) page = <ProductPage slug={productSlug} />;

  return (
    <div className="app-shell">
      <Navbar />
      <main>{page}</main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
