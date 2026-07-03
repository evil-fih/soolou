import { useMemo, useState } from "react";
import { Minus, Plus, Trash } from "@phosphor-icons/react";
import { Button } from "../components/Button";
import { DollPreview } from "../components/DollPreview";
import { products } from "../data/products";

const starterItems = [
  { product: products[0], quantity: 1 },
  { product: products[4], quantity: 1 },
];

export function CartPage() {
  const [items, setItems] = useState(starterItems);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [items],
  );

  function updateQuantity(productId: number, change: number) {
    setItems((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + change) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(productId: number) {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  }

  return (
    <section className="section cart-layout">
      <div className="cart-list">
        <h1>Your cart</h1>
        {items.length > 0 ? (
          items.map((item) => (
            <article className="cart-item" key={item.product.id}>
              <DollPreview look={item.product.look} label={item.product.name} size="sm" />
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
          ))
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
        <div className="summary-row">
          <span>Gift wrap</span>
          <strong>$6</strong>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <strong>At checkout</strong>
        </div>
        <div className="summary-total">
          <span>Total today</span>
          <strong>${items.length ? subtotal + 6 : 0}</strong>
        </div>
        <Button href="#/checkout" size="lg">
          Checkout
        </Button>
        <p>Custom notes and shipping details are collected next.</p>
      </aside>
    </section>
  );
}
