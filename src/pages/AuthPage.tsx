import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  LockKey,
  Sparkle,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import { BrandLogo } from "../components/BrandLogo";
import { AccountOverview } from "../components/AccountOverview";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured } from "../lib/supabase";

type AuthMode = "login" | "register";
type FormErrors = Partial<Record<"fullName" | "email" | "password" | "confirmPassword", string>>;

interface AuthPageProps {
  mode: AuthMode;
  route: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getQueryMessage(route: string) {
  const query = route.split("?")[1];
  if (!query) return "";

  const params = new URLSearchParams(query);
  if (params.get("registered") === "1") {
    return "Check your email to verify your Soolou account, then sign in here.";
  }

  if (params.get("verified") === "1") {
    return "Your email is verified. Sign in to continue.";
  }

  return "";
}

function getFriendlyAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "That email and password do not match. Please try again.";
  }

  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "An account already exists for this email. Try logging in instead.";
  }

  if (normalized.includes("password")) {
    return message;
  }

  if (normalized.includes("email")) {
    return message;
  }

  return message || "Something went wrong. Please try again.";
}

export function AuthPage({ mode, route }: AuthPageProps) {
  const isRegister = mode === "register";
  const { user, loading: authLoading, signIn, signOut, signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState(getQueryMessage(route));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);

  useEffect(() => {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setError("");
    setStatus(getQueryMessage(route));
    setLoading(false);
  }, [mode, route]);

  const copy = useMemo(
    () =>
      isRegister
        ? {
            title: "Start your soft little collection",
            body: "Create an account for saved plush designs, order updates, and tiny gift notes.",
            button: "Create account",
            switchLead: "Already have an account?",
            switchLabel: "Log in",
            switchHref: "#/login",
          }
        : {
            title: "Welcome back to Soolou",
            body: "Log in to keep your custom plushes, favorites, and checkout details close.",
            button: "Log in",
            switchLead: "New to Soolou?",
            switchLabel: "Create account",
            switchHref: "#/register",
          },
    [isRegister],
  );

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (isRegister && fullName.trim().length < 2) {
      nextErrors.fullName = "Please enter your full name.";
    }

    if (!emailPattern.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (isRegister && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    setError("");

    if (!validate()) return;

    if (!isSupabaseConfigured) {
      setError("Supabase is not configured yet. Add the public Vite variables and restart the app.");
      return;
    }

    setLoading(true);

    try {
      const result = isRegister
        ? await signUp({
            fullName: fullName.trim(),
            email: email.trim(),
            password,
            emailRedirectTo: `${window.location.origin}${window.location.pathname}#/login?verified=1`,
          })
        : await signIn(email.trim(), password);

      setLoading(false);

      if (result.error) {
        setError(getFriendlyAuthError(result.error.message));
        return;
      }

      if (isRegister) {
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setStatus("Verification email sent. Check your inbox, then come back to log in.");
        if (result.data.session) {
          await signOut();
        }
        return;
      }

      setStatus("You are signed in. Taking you to your account.");
      window.setTimeout(() => {
        window.location.hash = "/profile";
      }, 650);
    } catch (authError) {
      setLoading(false);
      setError(authError instanceof Error ? authError.message : "Something went wrong. Please try again.");
    }
  };

  const handleAccountSignOut = async () => {
    setAccountLoading(true);
    setError("");

    try {
      const result = await signOut();
      if (result.error) {
        setError(getFriendlyAuthError(result.error.message));
        setAccountLoading(false);
        return;
      }

      window.location.hash = "/";
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to log out. Please try again.");
      setAccountLoading(false);
    }
  };

  if (authLoading) {
    return (
      <section className="auth-page section" aria-label="Checking account session">
        <div className="auth-session-loading">
          <div className="profile-avatar profile-avatar-loading" aria-hidden="true" />
          <h1>Checking your Soolou account</h1>
          <p>One moment while we see whether you are already signed in.</p>
        </div>
      </section>
    );
  }

  if (user) {
    return (
      <AccountOverview
        user={user}
        loading={accountLoading}
        error={error}
        onSignOut={handleAccountSignOut}
      />
    );
  }

  return (
    <section className="auth-page section" aria-labelledby="auth-heading">
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-copy">
          <BrandLogo compact />
          <p>Gift-ready plush friends with saved designs and a smoother checkout.</p>
        </div>
        <div className="auth-plush">
          <span className="auth-ear auth-ear-left" />
          <span className="auth-ear auth-ear-right" />
          <span className="auth-face">
            <span />
            <span />
          </span>
          <span className="auth-smile" />
        </div>
        <div className="auth-note-card">
          <Sparkle weight="fill" />
          <span>New drops, cozy edits, and order notes saved in one place.</span>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-panel-heading">
          <span className="auth-kicker">{isRegister ? "Join the cuddle club" : "Your plush shelf awaits"}</span>
          <h1 id="auth-heading">{copy.title}</h1>
          <p>{copy.body}</p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="auth-message auth-message-error" role="status">
            <WarningCircle weight="fill" />
            <span>Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to connect auth.</span>
          </div>
        ) : null}

        {status ? (
          <div className="auth-message auth-message-success" role="status">
            <CheckCircle weight="fill" />
            <span>{status}</span>
          </div>
        ) : null}

        {error ? (
          <div className="auth-message auth-message-error" role="alert">
            <WarningCircle weight="fill" />
            <span>{error}</span>
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isRegister ? (
            <label className="field-group auth-field">
              <span>Full name</span>
              <div className={errors.fullName ? "auth-input auth-input-error" : "auth-input"}>
                <User weight="bold" />
                <input
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Mina Chen"
                />
              </div>
              {errors.fullName ? <small>{errors.fullName}</small> : null}
            </label>
          ) : null}

          <label className="field-group auth-field">
            <span>Email</span>
            <div className={errors.email ? "auth-input auth-input-error" : "auth-input"}>
              <EnvelopeSimple weight="bold" />
              <input
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
            {errors.email ? <small>{errors.email}</small> : null}
          </label>

          <label className="field-group auth-field">
            <span>Password</span>
            <div className={errors.password ? "auth-input auth-input-error" : "auth-input"}>
              <LockKey weight="bold" />
              <input
                autoComplete={isRegister ? "new-password" : "current-password"}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeSlash weight="bold" /> : <Eye weight="bold" />}
              </button>
            </div>
            {errors.password ? <small>{errors.password}</small> : null}
          </label>

          {isRegister ? (
            <label className="field-group auth-field">
              <span>Confirm password</span>
              <div className={errors.confirmPassword ? "auth-input auth-input-error" : "auth-input"}>
                <LockKey weight="bold" />
                <input
                  autoComplete="new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? <EyeSlash weight="bold" /> : <Eye weight="bold" />}
                </button>
              </div>
              {errors.confirmPassword ? <small>{errors.confirmPassword}</small> : null}
            </label>
          ) : null}

          <button className="button button-primary button-lg auth-submit" type="submit" disabled={loading}>
            <span>{loading ? (isRegister ? "Sending email..." : "Working...") : copy.button}</span>
            <ArrowRight weight="bold" />
          </button>
        </form>

        <p className="auth-switch">
          {copy.switchLead} <a href={copy.switchHref}>{copy.switchLabel}</a>
        </p>
      </div>
    </section>
  );
}
