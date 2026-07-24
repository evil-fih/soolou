import { FormEvent, useState } from "react";
import { Envelope, EnvelopeSimple, Heart, MapPin } from "@phosphor-icons/react";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { canUseBackend, sendContactMessage } from "../lib/backend";

export function ContactPage() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const fullName = user?.user_metadata?.full_name;
  const defaultName = typeof fullName === "string" ? fullName : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canUseBackend()) {
      setError("Supabase is not configured yet, so Soolou cannot save this message.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    setError("");
    setSending(true);

    try {
      await sendContactMessage({
        userId: user?.id,
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        message: String(formData.get("message") ?? ""),
      });

      setSent(true);
      form.reset();
    } catch (messageError) {
      setError(
        messageError instanceof Error
          ? messageError.message
          : "Could not send your message. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="section contact-page">
      <div className="contact-copy stitch-frame">
        <span className="auth-kicker">Contact Soolou</span>
        <h1>Tell us about your plush idea.</h1>
        <p>
          Questions, gifting plans, custom details, or order help can all start here.
          We will keep it warm, clear, and easy.
        </p>

        <div className="contact-detail-list" aria-label="Contact details">
          <a href="mailto:soolouofficial@gmail.com">
            <Envelope weight="bold" />
            <span>soolouofficial@gmail.com</span>
          </a>
          <span>
            <MapPin weight="bold" />
            Soolou studio, made online
          </span>
        </div>
      </div>

      <form className="contact-form stitch-frame" onSubmit={handleSubmit}>
        <div className="contact-form-heading">
          <Heart weight="fill" />
          <div>
            <h2>Send a message</h2>
            <p>Share the tiny details. Those are usually the best part.</p>
          </div>
        </div>

        <label className="field-group">
          <span>Name</span>
          <input name="name" required autoComplete="name" placeholder="Your name" defaultValue={defaultName} />
        </label>

        <label className="field-group">
          <span>Email</span>
          <input name="email" required autoComplete="email" type="email" placeholder="you@example.com" defaultValue={user?.email ?? ""} />
        </label>

        <label className="field-group">
          <span>Message</span>
          <textarea name="message" required placeholder="Tell us what you need help with" />
        </label>

        {sent ? <p className="success-message">Thanks. Your message is ready for Soolou.</p> : null}
        {error ? <p className="error-message">{error}</p> : null}

        <Button type="submit" size="lg" icon={<EnvelopeSimple weight="bold" />} disabled={sending}>
          {sending ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </section>
  );
}
