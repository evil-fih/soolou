import {
  ArrowLeft,
  CheckCircle,
  GearSix,
  Heart,
  HouseLine,
  Package,
  SignOut,
  Truck,
  UserCircle,
} from "@phosphor-icons/react";
import { type FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Button } from "./Button";
import {
  fetchOrderHistory,
  fetchSavedPlushDesigns,
  fetchShippingAddress,
  type OrderSummary,
  type SavedPlushDesign,
  type ShippingAddress,
} from "../lib/backend";
import { supabase } from "../lib/supabase";

interface AccountOverviewProps {
  user: User;
  loading?: boolean;
  error?: string;
  onSignOut: () => void;
}

function getDisplayName(user: User) {
  const name = user.user_metadata?.full_name;
  return typeof name === "string" && name.trim() ? name.trim() : "Soolou friend";
}

function getInitials(name: string, email?: string) {
  const source = name === "Soolou friend" ? email ?? name : name;
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatDate(value?: string) {
  if (!value) return "Recently";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getEditableName(user: User) {
  const name = user.user_metadata?.full_name;
  return typeof name === "string" ? name : "";
}

function getSettingsErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login") || normalized.includes("invalid credentials")) {
    return "That old password does not look right.";
  }

  if (normalized.includes("email")) {
    return "That email could not be updated yet. Please check the address and try again.";
  }

  if (normalized.includes("password")) {
    return "That password could not be updated yet. Please try a stronger password.";
  }

  return message || "Something went wrong. Please try again.";
}

const accountTiles = [
  {
    icon: Package,
    title: "My Orders",
    body: "Track your plush orders and check their latest delivery status.",
  },
  {
    icon: Heart,
    title: "Saved Plush Designs",
    body: "Keep custom colorways, outfits, and notes ready for later.",
  },
  {
    icon: Truck,
    title: "Shipping Information",
    body: "Save favorite addresses for faster checkout in a future update.",
  },
  {
    icon: GearSix,
    title: "Account Settings",
    body: "Profile details, email preferences, and security tools will live here.",
  },
] as const;

type AccountTileTitle = (typeof accountTiles)[number]["title"];

const orderStatusLabels: Record<OrderSummary["status"], string> = {
  studio_review: "Studio Review",
  confirmed: "Confirmed",
  making: "Being Made",
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

export function AccountOverview({ user, loading = false, error = "", onSignOut }: AccountOverviewProps) {
  const [selectedSection, setSelectedSection] = useState<AccountTileTitle | null>(null);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [designs, setDesigns] = useState<SavedPlushDesign[]>([]);
  const [selectedDesignId, setSelectedDesignId] = useState("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [settingsName, setSettingsName] = useState(getEditableName(user));
  const [settingsEmail, setSettingsEmail] = useState(user.email ?? "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const displayName = getDisplayName(user);
  const initials = getInitials(displayName, user.email);
  const createdAt = formatDate(user.created_at);
  const verified = user.email_confirmed_at ? "Verified email" : "Email verification pending";
  const selectedTile = accountTiles.find((tile) => tile.title === selectedSection);
  const SelectedIcon = selectedTile?.icon;

  useEffect(() => {
    setSettingsName(getEditableName(user));
    setSettingsEmail(user.email ?? "");
  }, [user.email, user.id, user.user_metadata?.full_name]);

  useEffect(() => {
    if (!selectedSection) return;
    if (selectedSection === "Account Settings") {
      setSectionLoading(false);
      setSectionError("");
      return;
    }

    let mounted = true;

    setSectionLoading(true);
    setSectionError("");

    const loadSection = async () => {
      if (selectedSection === "My Orders") {
        setOrders(await fetchOrderHistory(user.id));
      }

      if (selectedSection === "Saved Plush Designs") {
        const savedDesigns = await fetchSavedPlushDesigns(user.id);
        setDesigns(savedDesigns);
        setSelectedDesignId("");
      }

      if (selectedSection === "Shipping Information") {
        setShippingAddress(await fetchShippingAddress(user.id));
      }
    };

    loadSection()
      .catch((loadError) => {
        if (!mounted) return;

        setSectionError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load this account section yet.",
        );
      })
      .finally(() => {
        if (mounted) setSectionLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedSection, user.id]);

  async function handleProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");

    if (!supabase) {
      setProfileError("Supabase is not configured yet.");
      return;
    }

    const nextName = settingsName.trim();
    const nextEmail = settingsEmail.trim();
    const currentName = getEditableName(user).trim();
    const currentEmail = user.email ?? "";
    const emailChanged = nextEmail.toLowerCase() !== currentEmail.toLowerCase();
    const nameChanged = nextName !== currentName;

    if (!nextName) {
      setProfileError("Please add a name for your account.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    if (!nameChanged && !emailChanged) {
      setProfileError("Change your name or email before saving.");
      return;
    }

    setProfileLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      ...(emailChanged ? { email: nextEmail } : {}),
      data: {
        ...user.user_metadata,
        full_name: nextName,
      },
    });

    setProfileLoading(false);

    if (updateError) {
      setProfileError(getSettingsErrorMessage(updateError.message));
      return;
    }

    setProfileMessage(
      emailChanged
        ? "Profile saved. Please check your inbox to verify the new email address."
        : "Profile saved.",
    );
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (!supabase) {
      setPasswordError("Supabase is not configured yet.");
      return;
    }

    if (!user.email) {
      setPasswordError("Your account does not have an email password login to verify.");
      return;
    }

    if (!oldPassword) {
      setPasswordError("Please enter your old password.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password needs at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (oldPassword === newPassword) {
      setPasswordError("New password needs to be different from the old password.");
      return;
    }

    setPasswordLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      setPasswordLoading(false);
      setPasswordError(getSettingsErrorMessage(signInError.message));
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPasswordLoading(false);

    if (updateError) {
      setPasswordError(getSettingsErrorMessage(updateError.message));
      return;
    }

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password updated.");
  }

  function renderSelectedSection() {
    if (sectionLoading) return <p>Loading your Soolou details...</p>;
    if (sectionError) return <p className="error-message">{sectionError}</p>;

    if (selectedSection === "My Orders") {
      if (!orders.length) return <p>No orders yet. Your next checkout will appear here.</p>;

      return (
        <div className="account-order-list">
          {orders.map((order) => {
            const itemCount = order.order_items.reduce((total, item) => total + item.quantity, 0);
            const visibleItems = order.order_items.slice(0, 3);
            const hiddenItemCount = Math.max(order.order_items.length - visibleItems.length, 0);

            return (
              <article className="account-order-card" key={order.id}>
                <header className="account-order-card-header">
                  <div>
                    <strong>Order #{order.id.slice(0, 8).toUpperCase()}</strong>
                    <span>Placed {formatDate(order.created_at)}</span>
                  </div>
                  <div className="account-order-statuses">
                    <span className={`account-order-status account-order-status-${order.status}`}>
                      {orderStatusLabels[order.status] ?? order.status}
                    </span>
                    <span className={`account-order-status account-payment-status-${order.payment_status}`}>
                      {order.payment_status === "paid" ? "Test Paid" : `Payment ${order.payment_status}`}
                    </span>
                  </div>
                </header>

                <div className="account-order-items" aria-label="Order items">
                  {visibleItems.length ? (
                    visibleItems.map((item) => (
                      <span key={item.id}>
                        {item.quantity} x {item.product_name}
                      </span>
                    ))
                  ) : (
                    <span>Order item details are unavailable.</span>
                  )}
                  {hiddenItemCount ? <span>And {hiddenItemCount} more item{hiddenItemCount === 1 ? "" : "s"}</span> : null}
                </div>

                <footer className="account-order-card-footer">
                  <span>{itemCount} Item{itemCount === 1 ? "" : "s"}</span>
                  <b>{formatMoney(order.total)}</b>
                </footer>
              </article>
            );
          })}
        </div>
      );
    }

    if (selectedSection === "Saved Plush Designs") {
      if (!designs.length) return <p>No saved plush designs yet. Create a look in the plush builder and save it here.</p>;

      return (
        <div className="saved-design-browser">
          <div className="saved-design-list" aria-label="Saved plush designs">
            {designs.map((design) => {
              const selected = selectedDesignId === design.id;

              return (
                <button
                  className={selected ? "saved-design-card saved-design-card-selected" : "saved-design-card"}
                  key={design.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedDesignId(design.id)}
                >
                  <span className="saved-design-card-icon" aria-hidden="true">
                    <Heart weight={selected ? "fill" : "bold"} />
                  </span>
                  <span>
                    <strong>{design.name}</strong>
                    <small>Saved {formatDate(design.created_at)}</small>
                  </span>
                  {selected ? <CheckCircle weight="fill" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>

          {selectedDesignId ? (
            <Button
              size="lg"
              icon={<CheckCircle weight="bold" />}
              onClick={() => {
                window.location.hash = `/customize?design=${encodeURIComponent(selectedDesignId)}`;
              }}
            >
              Use This Design
            </Button>
          ) : (
            <p className="saved-design-hint">Select a saved design to use it in the plush builder.</p>
          )}
        </div>
      );
    }

    if (selectedSection === "Shipping Information") {
      if (!shippingAddress) return <p>No saved shipping info yet. Your next logged-in checkout will save it here.</p>;

      return (
        <div className="account-section-list">
          <article>
            <strong>{shippingAddress.full_name}</strong>
            <span>{shippingAddress.address}</span>
            <span>
              {shippingAddress.city}, {shippingAddress.postal_code}
            </span>
            <span>{shippingAddress.email}</span>
          </article>
        </div>
      );
    }

    if (selectedSection === "Account Settings") {
      return (
        <div className="account-settings-grid">
          <form className="account-settings-card" onSubmit={handleProfileUpdate}>
            <h3>Profile and email</h3>
            <label>
              <span>Full name</span>
              <input
                type="text"
                value={settingsName}
                onChange={(event) => setSettingsName(event.target.value)}
                autoComplete="name"
                disabled={profileLoading}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={settingsEmail}
                onChange={(event) => setSettingsEmail(event.target.value)}
                autoComplete="email"
                disabled={profileLoading}
              />
            </label>
            {profileError ? (
              <div className="settings-message settings-message-error" role="alert">
                {profileError}
              </div>
            ) : null}
            {profileMessage ? <div className="settings-message settings-message-success">{profileMessage}</div> : null}
            <button className="button button-primary button-md" type="submit" disabled={profileLoading}>
              <span>{profileLoading ? "Saving..." : "Save profile"}</span>
            </button>
          </form>

          <form className="account-settings-card" onSubmit={handlePasswordUpdate}>
            <h3>Password</h3>
            <label>
              <span>Old password</span>
              <input
                type="password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                autoComplete="current-password"
                disabled={passwordLoading}
              />
            </label>
            <label>
              <span>New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                disabled={passwordLoading}
              />
            </label>
            <label>
              <span>Confirm new password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                disabled={passwordLoading}
              />
            </label>
            {passwordError ? (
              <div className="settings-message settings-message-error" role="alert">
                {passwordError}
              </div>
            ) : null}
            {passwordMessage ? <div className="settings-message settings-message-success">{passwordMessage}</div> : null}
            <button className="button button-primary button-md" type="submit" disabled={passwordLoading}>
              <span>{passwordLoading ? "Updating..." : "Update password"}</span>
            </button>
          </form>
        </div>
      );
    }

    return <p>This account section is coming soon.</p>;
  }

  return (
    <section className="profile-page section" aria-labelledby="profile-heading">
      <div className="profile-hero">
        <div className="profile-card profile-card-main">
          <div className="profile-avatar" aria-hidden="true">
            {initials || <UserCircle weight="fill" />}
          </div>
          <div className="profile-identity">
            <span className="auth-kicker">My Account</span>
            <h1 id="profile-heading">Hi, {displayName}</h1>
            <p>Welcome back to your Soolou shelf. Your plush plans and checkout details can stay cozy here.</p>
          </div>
          <div className="profile-actions">
            <Button href="#/" variant="ghost" icon={<HouseLine weight="bold" />}>
              Home
            </Button>
            <button className="button button-primary button-md" type="button" onClick={onSignOut} disabled={loading}>
              <span className="button-icon">
                <SignOut weight="bold" />
              </span>
              <span>{loading ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
          {error ? (
            <div className="auth-message auth-message-error" role="alert">
              <span>{error}</span>
            </div>
          ) : null}
        </div>

        <div className="profile-card profile-details-card">
          <h2>Account Details</h2>
          <dl className="profile-details">
            <div>
              <dt>Full name</dt>
              <dd>{displayName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <CheckCircle weight="fill" />
                {verified}
              </dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{createdAt}</dd>
            </div>
          </dl>
        </div>
      </div>

      {selectedTile ? (
        <section className="account-section-panel" aria-labelledby="account-section-heading">
          <button className="account-back-button" type="button" onClick={() => setSelectedSection(null)}>
            <ArrowLeft weight="bold" />
            <span>Back</span>
          </button>
          <div className="account-section-content">
            {SelectedIcon ? <SelectedIcon weight="bold" /> : null}
            <h2 id="account-section-heading">{selectedTile.title}</h2>
            {renderSelectedSection()}
          </div>
        </section>
      ) : (
        <div className="account-tile-grid">
          {accountTiles.map(({ icon: Icon, title, body }) => (
            <button
              className="account-tile"
              key={title}
              type="button"
              onClick={() => setSelectedSection(title)}
              aria-label={`Open ${title}`}
            >
              <Icon weight="bold" />
              <h2>{title}</h2>
              <p>{body}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
