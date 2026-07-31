import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowClockwise,
  ClipboardText,
  CreditCard,
  Gift,
  MagnifyingGlass,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBagOpen,
  Truck,
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import {
  fetchAdminOrders,
  type AdminOrder,
  type AdminOrderStatus,
  updateAdminOrderStatus,
} from "../lib/backend";

const statusOptions: AdminOrderStatus[] = [
  "studio_review",
  "confirmed",
  "making",
  "ready_to_ship",
  "shipped",
  "delivered",
  "cancelled",
];

const statusLabels: Record<AdminOrderStatus, string> = {
  studio_review: "Studio Review",
  confirmed: "Confirmed",
  making: "Making",
  ready_to_ship: "Ready to Ship",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function orderReference(orderId: string) {
  return orderId.slice(0, 8).toUpperCase();
}

export function AdminOrdersPage() {
  const { user, loading: authLoading, profileLoading, isAdmin, isStaff } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | "all">("all");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [statusDraft, setStatusDraft] = useState<AdminOrderStatus>("studio_review");
  const [savingStatus, setSavingStatus] = useState(false);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setError("");

    try {
      const nextOrders = await fetchAdminOrders();
      setOrders(nextOrders);
      setSelectedOrderId((current) => current || nextOrders[0]?.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Orders could not load.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isStaff) return;
    void loadOrders();
  }, [isStaff, loadOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        order.id.toLowerCase().includes(normalizedQuery) ||
        order.customer_name.toLowerCase().includes(normalizedQuery) ||
        order.customer_email.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ?? filteredOrders[0] ?? null;

  useEffect(() => {
    if (selectedOrder) setStatusDraft(selectedOrder.status);
  }, [selectedOrder?.id, selectedOrder?.status]);

  async function handleStatusSave() {
    if (!selectedOrder || statusDraft === selectedOrder.status) return;

    setSavingStatus(true);
    setError("");
    setMessage("");

    try {
      const updated = await updateAdminOrderStatus(selectedOrder.id, statusDraft);
      setOrders((current) =>
        current.map((order) =>
          order.id === updated.id
            ? { ...order, status: updated.status, updated_at: updated.updated_at }
            : order,
        ),
      );
      setMessage(`Order ${orderReference(selectedOrder.id)} is now ${statusLabels[updated.status]}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The order status could not be updated.");
    } finally {
      setSavingStatus(false);
    }
  }

  if (authLoading || profileLoading) {
    return (
      <section className="admin-page section">
        <div className="admin-locked-card">
          <ShieldCheck weight="bold" />
          <h1>Checking Admin Access</h1>
          <p>Please wait while Soolou checks your profile.</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="admin-page section">
        <div className="admin-locked-card">
          <ShieldCheck weight="bold" />
          <h1>Admin Sign-In Required</h1>
          <p>Log in with an admin or helper account to manage customer orders.</p>
          <a className="button button-primary button-md" href="#/login?redirect=/admin/orders">
            Log In
          </a>
        </div>
      </section>
    );
  }

  if (!isStaff) {
    return (
      <section className="admin-page section">
        <div className="admin-locked-card">
          <ShieldCheck weight="bold" />
          <h1>Store Manager Access Only</h1>
          <p>This page is available to Soolou admins and helpers.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page admin-orders-page section" aria-labelledby="admin-orders-heading">
      <div className="admin-heading admin-orders-heading">
        <span className="auth-kicker">{isAdmin ? "Store Admin" : "Store Helper"}</span>
        <h1 id="admin-orders-heading">Customer Orders</h1>
        <p>Review customer details, check purchased items, and update fulfillment progress.</p>
      </div>

      <nav className="admin-section-nav" aria-label="Admin pages">
        <a href="#/admin">
          <Package weight="bold" />
          Products
        </a>
        <a className="admin-section-nav-active" href="#/admin/orders" aria-current="page">
          <ClipboardText weight="bold" />
          Orders
        </a>
      </nav>

      <div className="admin-order-toolbar">
        <label className="admin-order-search">
          <span className="sr-only">Search orders</span>
          <MagnifyingGlass weight="bold" />
          <input
            type="search"
            placeholder="Search by customer, email, or order number"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="admin-order-filter">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as AdminOrderStatus | "all")}
          >
            <option value="all">All Orders ({orders.length})</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <button className="admin-refresh-button" type="button" onClick={() => void loadOrders()} disabled={ordersLoading}>
          <ArrowClockwise weight="bold" />
          <span>{ordersLoading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {error ? <div className="settings-message settings-message-error" role="alert">{error}</div> : null}
      {message ? <div className="settings-message settings-message-success" role="status">{message}</div> : null}

      <div className="admin-orders-layout">
        <aside className="admin-order-list" aria-label="Customer orders">
          {ordersLoading && !orders.length ? (
            <div className="admin-order-list-loading" aria-live="polite">
              <span />
              <span />
              <span />
              <p>Loading Orders...</p>
            </div>
          ) : null}

          {!ordersLoading && !filteredOrders.length ? (
            <div className="admin-order-empty">
              <ShoppingBagOpen weight="bold" />
              <h2>No Orders Found</h2>
              <p>{orders.length ? "Try a different search or status filter." : "New customer orders will appear here."}</p>
            </div>
          ) : null}

          {filteredOrders.map((order) => (
            <button
              className={selectedOrder?.id === order.id ? "admin-order-row admin-order-row-active" : "admin-order-row"}
              type="button"
              key={order.id}
              onClick={() => {
                setSelectedOrderId(order.id);
                setMessage("");
              }}
            >
              <span className="admin-order-row-main">
                <strong>#{orderReference(order.id)}</strong>
                <small>{order.customer_name}</small>
              </span>
              <span className={`admin-order-status admin-order-status-${order.status}`}>
                {statusLabels[order.status] ?? order.status}
              </span>
              <span className="admin-order-row-meta">
                <small>{formatDate(order.created_at)}</small>
                <strong>{formatMoney(order.total)}</strong>
              </span>
            </button>
          ))}
        </aside>

        {selectedOrder ? (
          <article className="admin-order-detail" aria-labelledby="selected-order-heading">
            <header className="admin-order-detail-header">
              <div>
                <span>Order #{orderReference(selectedOrder.id)}</span>
                <h2 id="selected-order-heading">{selectedOrder.customer_name}</h2>
                <p>Placed {formatDate(selectedOrder.created_at)}</p>
              </div>
              <div className="admin-order-status-editor">
                <label>
                  <span>Order Status</span>
                  <select value={statusDraft} onChange={(event) => setStatusDraft(event.target.value as AdminOrderStatus)}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="button button-primary button-md"
                  type="button"
                  onClick={() => void handleStatusSave()}
                  disabled={savingStatus || statusDraft === selectedOrder.status}
                >
                  {savingStatus ? "Saving..." : "Save Status"}
                </button>
              </div>
            </header>

            <div className="admin-order-info-grid">
              <section>
                <MapPin weight="bold" />
                <div>
                  <h3>Shipping Information</h3>
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code}</p>
                  <a href={`mailto:${selectedOrder.customer_email}`}>{selectedOrder.customer_email}</a>
                </div>
              </section>
              <section>
                <Gift weight="bold" />
                <div>
                  <h3>Order Notes</h3>
                  <p>{selectedOrder.delivery_notes || "No delivery notes were added."}</p>
                  <p>{selectedOrder.gift_wrap ? `Gift wrap added (${formatMoney(selectedOrder.gift_wrap_fee)})` : "No gift wrap"}</p>
                </div>
              </section>
              <section>
                <CreditCard weight="bold" />
                <div>
                  <h3>Payment</h3>
                  <p className={`admin-payment-status admin-payment-status-${selectedOrder.payment_status}`}>
                    {selectedOrder.payment_status === "paid" ? "Test payment complete" : `Payment ${selectedOrder.payment_status}`}
                  </p>
                  <p>{selectedOrder.payment_provider === "sandbox" ? "Sandbox provider. No real money moved." : "No payment provider recorded."}</p>
                  {selectedOrder.payment_reference ? <p>Reference: {selectedOrder.payment_reference}</p> : null}
                </div>
              </section>
            </div>

            <section className="admin-order-items" aria-labelledby="order-items-heading">
              <div className="admin-order-subheading">
                <div>
                  <Truck weight="bold" />
                  <h3 id="order-items-heading">Order Items</h3>
                </div>
                <span>{selectedOrder.order_items.reduce((total, item) => total + item.quantity, 0)} Items</span>
              </div>

              <div className="admin-order-item-list">
                {selectedOrder.order_items.map((item) => (
                  <article className="admin-order-item" key={item.id}>
                    <div className="admin-order-item-image">
                      {item.product_snapshot?.image ? (
                        <img src={item.product_snapshot.image} alt="" />
                      ) : (
                        <Package weight="bold" />
                      )}
                    </div>
                    <div>
                      <strong>{item.product_name}</strong>
                      <span>{formatMoney(item.unit_price)} each</span>
                    </div>
                    <span>Qty {item.quantity}</span>
                    <strong>{formatMoney(item.unit_price * item.quantity)}</strong>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-order-totals" aria-label="Order totals">
              <div><span>Subtotal</span><strong>{formatMoney(selectedOrder.subtotal)}</strong></div>
              {selectedOrder.gift_wrap ? <div><span>Gift Wrap</span><strong>{formatMoney(selectedOrder.gift_wrap_fee)}</strong></div> : null}
              <div className="admin-order-total"><span>Total</span><strong>{formatMoney(selectedOrder.total)}</strong></div>
            </section>
          </article>
        ) : (
          <div className="admin-order-detail admin-order-detail-empty">
            <ClipboardText weight="bold" />
            <h2>Select an Order</h2>
            <p>Choose an order from the list to view customer and fulfillment details.</p>
          </div>
        )}
      </div>
    </section>
  );
}
