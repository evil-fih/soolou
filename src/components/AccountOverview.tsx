import {
  CheckCircle,
  GearSix,
  Heart,
  HouseLine,
  Package,
  SignOut,
  Sparkle,
  Truck,
  UserCircle,
} from "@phosphor-icons/react";
import type { User } from "@supabase/supabase-js";
import { Button } from "./Button";

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

const accountTiles = [
  {
    icon: Package,
    title: "My Orders",
    body: "Track plush orders and gift delivery updates here soon.",
  },
  {
    icon: Heart,
    title: "Saved Doll Designs",
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
];

export function AccountOverview({ user, loading = false, error = "", onSignOut }: AccountOverviewProps) {
  const displayName = getDisplayName(user);
  const initials = getInitials(displayName, user.email);
  const createdAt = formatDate(user.created_at);
  const verified = user.email_confirmed_at ? "Verified email" : "Email verification pending";

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

      <div className="profile-feature-strip">
        <Sparkle weight="fill" />
        <span>Next up for Soolou accounts: saved plush drafts, order history, and faster gifting.</span>
      </div>

      <div className="account-tile-grid">
        {accountTiles.map(({ icon: Icon, title, body }) => (
          <article className="account-tile" key={title}>
            <Icon weight="bold" />
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
