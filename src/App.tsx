import { lazy, Suspense, useEffect, useState } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ChatbotWidget } from "./components/ChatbotWidget";
import { HomePage } from "./pages/HomePage";

const AboutPage = lazy(() => import("./pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const AdminPage = lazy(() => import("./pages/AdminPage").then((module) => ({ default: module.AdminPage })));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrdersPage").then((module) => ({ default: module.AdminOrdersPage })));
const AuthPage = lazy(() => import("./pages/AuthPage").then((module) => ({ default: module.AuthPage })));
const CartPage = lazy(() => import("./pages/CartPage").then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage").then((module) => ({ default: module.CheckoutPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then((module) => ({ default: module.ContactPage })));
const CustomizePage = lazy(() => import("./pages/CustomizePage").then((module) => ({ default: module.CustomizePage })));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage").then((module) => ({ default: module.FavoritesPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage").then((module) => ({ default: module.PrivacyPage })));
const ProductPage = lazy(() => import("./pages/ProductPage").then((module) => ({ default: module.ProductPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const ShopPage = lazy(() => import("./pages/ShopPage").then((module) => ({ default: module.ShopPage })));

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

  let page = path === "/" ? <HomePage /> : <NotFoundPage />;
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
      <main>
        <Suspense
          fallback={
            <section className="section route-loading" aria-live="polite">
              Loading Soolou...
            </section>
          }
        >
          {page}
        </Suspense>
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
