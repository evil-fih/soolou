import { useState } from "react";
import { Minus, Plus, Trash } from "@phosphor-icons/react";
import { Button } from "../components/Button";
import { ProductThumbnail } from "../components/ProductThumbnail";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export function CartPage() {
  const { user } = useAuth();
  const { clearCart, items, removeItem, subtotal, updateQuantity } = useCart();
  const [giftWrap, setGiftWrap] = useState(false);
  const giftWrapTotal = items.length && giftWrap ? 6 : 0;
  const total = items.length ? subtotal + giftWrapTotal : 0;

  return (
    <section className="section cart-layout">
      <div className="cart-list">
        <div className="cart-list-heading">
          <h1>Your cart</h1>
          {items.length > 0 ? (
            <div className="cart-list-tools">
              <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
              <button type="button" onClick={clearCart}>
                Clear cart
              </button>
            </div>
          ) : null}
        </div>
        {items.length > 0 ? (
          <div className="cart-scroll-panel" role="region" aria-label="Cart items" tabIndex={0}>
            <div className="cart-scroll-stack">
              {items.map((item) => (
                <article className="cart-item" key={item.product.id}>
                  <ProductThumbnail product={item.product} />
                  <div>
                    <h2>{item.product.name}</h2>
                    <p>{item.product.tags.join(", ")}</p>
                  </div>
                  <div className="quantity-control" aria-label={`Quantity for ${item.product.name}`}>
                    <button type="button" onClick={() => updateQuantity(item.product.id, -1)}>
                      <Minus weight="bold" />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.product.id, 1)}>
                      <Plus weight="bold" />
                    </button>
                  </div>
                  <strong>${item.product.price * item.quantity}</strong>
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    aria-label={`Remove ${item.product.name}`}
                  >
                    <Trash weight="bold" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state stitch-frame">
            <h2>Your cart is soft and empty</h2>
            <p>Pick a plush, outfit, or hair kit to start your order.</p>
            <Button href="#/shop">Shop Plush</Button>
          </div>
        )}
      </div>
      <aside className="order-summary stitch-frame">
        <h2>Order summary</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>${subtotal}</strong>
        </div>
        <label className="gift-wrap-option">
          <input
            type="checkbox"
            checked={giftWrap}
            disabled={!items.length}
            onChange={(event) => setGiftWrap(event.target.checked)}
          />
          <span>
            <strong>Gift wrap</strong>
            <small>Add soft wrap and a note card</small>
          </span>
          <b>$6</b>
        </label>
        <div className="summary-row">
          <span>Shipping</span>
          <strong>At checkout</strong>
        </div>
        <div className="summary-total">
          <span>Total today</span>
          <strong>${total}</strong>
        </div>
        <Button href={user ? "#/checkout" : "#/login?checkout=1&redirect=%2Fcheckout"} size="lg">
          {user ? "Checkout" : "Log in to checkout"}
        </Button>
        <p>Custom notes and shipping details are collected next.</p>
      </aside>
    </section>
  );
}
