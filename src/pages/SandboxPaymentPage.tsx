import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Flask,
  LockKey,
  XCircle,
} from "@phosphor-icons/react";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { cancelSandboxPayment, completeSandboxPayment } from "../lib/backend";

interface SandboxPaymentPageProps {
  route: string;
}

function getOrderId(route: string) {
  const query = route.split("?")[1] ?? "";
  return new URLSearchParams(query).get("order")?.trim() ?? "";
}

function getOrderTotal(route: string) {
  const query = route.split("?")[1] ?? "";
  const total = Number(new URLSearchParams(query).get("total"));
  return Number.isFinite(total) && total >= 0 ? total : null;
}

export function SandboxPaymentPage({ route }: SandboxPaymentPageProps) {
  const { user, loading: authLoading } = useAuth();
  const { clearCart, subtotal } = useCart();
  const orderId = useMemo(() => getOrderId(route), [route]);
  const routedTotal = useMemo(() => getOrderTotal(route), [route]);
  const displayTotal = routedTotal ?? subtotal;
  const [processing, setProcessing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [complete, setComplete] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!orderId) return;

    const formData = new FormData(event.currentTarget);
    const cardNumber = String(formData.get("cardNumber") ?? "").replace(/\D/g, "");
    const expiry = String(formData.get("expiry") ?? "").trim();
    const cvc = String(formData.get("cvc") ?? "").trim();

    if (cardNumber !== "4242424242424242") {
      setError("Use the sandbox card number 4242 4242 4242 4242.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry) || !/^\d{3,4}$/.test(cvc)) {
      setError("Use a test expiry in MM/YY format and any 3 digit CVC.");
      return;
    }

    setError("");
    setProcessing(true);

    try {
      await completeSandboxPayment(orderId);
      clearCart();
      setComplete(true);
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "The sandbox payment could not be completed.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleCancel() {
    if (!orderId) return;

    setError("");
    setCancelling(true);

    try {
      await cancelSandboxPayment(orderId);
      setCancelled(true);
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "The sandbox payment could not be cancelled.",
      );
    } finally {
      setCancelling(false);
    }
  }

  if (authLoading) {
    return (
      <section className="section checkout-success-page" aria-live="polite">
        <div className="checkout-success-card stitch-frame">
          <LockKey weight="fill" />
          <h1>Checking Checkout</h1>
          <p>Please wait while Soolou checks your account.</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="section checkout-success-page">
        <div className="checkout-success-card stitch-frame">
          <LockKey weight="fill" />
          <h1>Log In to Pay</h1>
          <p>Your test order is connected to the account that created it.</p>
          <Button href={`#/login?redirect=${encodeURIComponent(`/payment-test?order=${orderId}`)}`}>
            Log In
          </Button>
        </div>
      </section>
    );
  }

  if (!orderId) {
    return (
      <section className="section checkout-success-page">
        <div className="checkout-success-card stitch-frame">
          <XCircle weight="fill" />
          <h1>Order Not Found</h1>
          <p>Return to your cart and start the test checkout again.</p>
          <Button href="#/cart">Back to Cart</Button>
        </div>
      </section>
    );
  }

  if (complete) {
    return (
      <section className="section checkout-success-page">
        <div className="checkout-success-card sandbox-result-card stitch-frame">
          <CheckCircle weight="fill" />
          <span className="sandbox-mode-badge"><Flask weight="bold" /> Test Mode</span>
          <h1>Test Payment Complete</h1>
          <p>No money was charged. The order now appears as paid in the Soolou sandbox.</p>
          <p className="success-message">Order reference: {orderId.slice(0, 8).toUpperCase()}</p>
          <Button href="#/profile">View My Account</Button>
          <Button href="#/shop" variant="secondary">Keep Shopping</Button>
        </div>
      </section>
    );
  }

  if (cancelled) {
    return (
      <section className="section checkout-success-page">
        <div className="checkout-success-card sandbox-result-card stitch-frame">
          <XCircle weight="fill" />
          <span className="sandbox-mode-badge"><Flask weight="bold" /> Test Mode</span>
          <h1>Test Payment Cancelled</h1>
          <p>No money was charged and your cart is still saved.</p>
          <Button href="#/cart">Return to Cart</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="section sandbox-payment-page" aria-labelledby="sandbox-payment-heading">
      <div className="sandbox-payment-shell stitch-frame">
        <header className="sandbox-payment-header">
          <span className="sandbox-mode-badge"><Flask weight="bold" /> Test Mode</span>
          <h1 id="sandbox-payment-heading">Sandbox Payment</h1>
          <p>This checkout is for testing only. No real card details or money are used.</p>
        </header>

        <div className="sandbox-payment-order">
          <span>Order</span>
          <strong>#{orderId.slice(0, 8).toUpperCase()}</strong>
          <span>Test total</span>
          <strong>${displayTotal.toFixed(2)}</strong>
        </div>

        <form className="sandbox-payment-form" onSubmit={handlePayment}>
          <label className="field-group">
            <span>Cardholder name</span>
            <input name="cardholder" required autoComplete="off" placeholder="Test Customer" />
          </label>

          <label className="field-group">
            <span>Test card number</span>
            <div className="sandbox-card-input">
              <CreditCard weight="bold" />
              <input
                name="cardNumber"
                required
                inputMode="numeric"
                autoComplete="off"
                placeholder="4242 4242 4242 4242"
              />
            </div>
          </label>

          <div className="sandbox-payment-row">
            <label className="field-group">
              <span>Expiry</span>
              <input name="expiry" required inputMode="numeric" autoComplete="off" placeholder="12/34" />
            </label>
            <label className="field-group">
              <span>CVC</span>
              <input name="cvc" required inputMode="numeric" autoComplete="off" placeholder="123" />
            </label>
          </div>

          <p className="sandbox-test-hint">
            Use card 4242 4242 4242 4242 with expiry 12/34 and any 3 digit CVC.
          </p>

          {error ? <p className="error-message" role="alert">{error}</p> : null}

          <button className="button button-primary button-lg" type="submit" disabled={processing || cancelling}>
            <LockKey weight="bold" />
            {processing ? "Processing Test Payment..." : "Complete Test Payment"}
          </button>
          <button
            className="sandbox-cancel-button"
            type="button"
            disabled={processing || cancelling}
            onClick={() => void handleCancel()}
          >
            <ArrowLeft weight="bold" />
            {cancelling ? "Cancelling..." : "Cancel Test Payment"}
          </button>
        </form>
      </div>
    </section>
  );
}
