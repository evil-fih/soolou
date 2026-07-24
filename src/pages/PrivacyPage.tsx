import { LockKey, ShieldCheck, Sparkle } from "@phosphor-icons/react";

const policySections = [
  {
    title: "Information We Collect",
    copy: "We collect the details needed to create your account, prepare your order, and respond to messages, such as your name, email, shipping details, and selected plush designs.",
  },
  {
    title: "How We Use Information",
    copy: "We use your information to manage accounts, save carts, process orders, personalize your Soolou experience, and send important updates about your plush.",
  },
  {
    title: "Payments And Orders",
    copy: "Payment collection may be handled by trusted payment providers. Soolou does not ask you to send passwords or secret payment details through normal messages.",
  },
  {
    title: "Supabase Auth",
    copy: "Account login and registration are powered by Supabase Auth. Supabase manages secure sessions so you can stay signed in while your session is valid.",
  },
  {
    title: "Cookies And Local Storage",
    copy: "The site may use browser storage for cart, favorites, and session behavior. This helps the shop remember what you picked without storing passwords manually.",
  },
  {
    title: "Your Choices",
    copy: "You can log out, contact us about account questions, and request updates or deletion of personal information where applicable.",
  },
];

export function PrivacyPage() {
  return (
    <section className="section privacy-page" aria-labelledby="privacy-heading">
      <div className="privacy-hero stitch-frame">
        <div>
          <span className="auth-kicker">Privacy Policy</span>
          <h1 id="privacy-heading">Your details stay handled with care.</h1>
          <p>
            This page explains how Soolou uses basic account, cart, and order information to run the
            shop and create custom plush orders.
          </p>
        </div>
        <div className="privacy-badge" aria-hidden="true">
          <ShieldCheck weight="fill" />
        </div>
      </div>

      <div className="privacy-grid">
        {policySections.map((section, index) => (
          <article className="privacy-card" key={section.title}>
            {index % 2 === 0 ? <LockKey weight="bold" /> : <Sparkle weight="fill" />}
            <h2>{section.title}</h2>
            <p>{section.copy}</p>
          </article>
        ))}
      </div>

      <div className="privacy-note stitch-frame">
        <h2>Questions?</h2>
        <p>
          Email us at soolouofficial@gmail.com if you want help with account data, order information, or
          privacy requests.
        </p>
      </div>
    </section>
  );
}
