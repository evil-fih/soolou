import { useEffect, useState } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { AboutPage } from "./pages/AboutPage";
import { AuthPage } from "./pages/AuthPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { CustomizePage } from "./pages/CustomizePage";
import { HomePage } from "./pages/HomePage";
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
  if (path === "/customize") page = <CustomizePage />;
  if (path === "/cart") page = <CartPage />;
  if (path === "/checkout") page = <CheckoutPage />;
  if (path === "/about") page = <AboutPage />;
  if (path === "/login") page = <AuthPage mode="login" route={route} />;
  if (path === "/register") page = <AuthPage mode="register" route={route} />;
  if (path === "/profile" || path === "/account") page = <ProfilePage />;
  if (path.startsWith("/product/")) page = <ProductPage slug={productSlug} />;

  return (
    <div className="app-shell">
      <Navbar />
      <main>{page}</main>
      <Footer />
    </div>
  );
}
