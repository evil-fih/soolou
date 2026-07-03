import { useState } from "react";
import { AccountOverview } from "../components/AccountOverview";
import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    setSignOutLoading(true);
    setError("");

    try {
      const result = await signOut();
      if (result.error) {
        setError(result.error.message);
        setSignOutLoading(false);
        return;
      }

      window.location.hash = "/";
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to log out. Please try again.");
      setSignOutLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="auth-page section" aria-label="Loading account">
        <div className="auth-session-loading">
          <div className="profile-avatar profile-avatar-loading" aria-hidden="true" />
          <h1>Loading your account</h1>
          <p>Your Soolou profile is getting its soft landing.</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="profile-page section" aria-labelledby="profile-signed-out-heading">
        <div className="profile-card profile-empty-card">
          <span className="auth-kicker">Account</span>
          <h1 id="profile-signed-out-heading">Sign in to see your account</h1>
          <p>Log in to view saved designs, future orders, and your Soolou checkout details.</p>
          <a className="button button-primary button-lg" href="#/login">
            Log in
          </a>
        </div>
      </section>
    );
  }

  return <AccountOverview user={user} loading={signOutLoading} error={error} onSignOut={handleSignOut} />;
}
