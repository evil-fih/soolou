declare const process: {
  env: Record<string, string | undefined>;
};

const contactRecipient = "soolouofficial@gmail.com";
const resendEndpoint = "https://api.resend.com/emails";
const requestWindowMs = 10 * 60 * 1000;
const requestLimit = 5;
const requestLog = new Map<string, number[]>();

interface ContactRequest {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function requestAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(address: string) {
  const now = Date.now();
  const recent = (requestLog.get(address) ?? []).filter(
    (timestamp) => now - timestamp < requestWindowMs,
  );

  if (recent.length >= requestLimit) {
    requestLog.set(address, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(address, recent);
  return false;
}

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed." }, { status: 405 });
    }

    if (isRateLimited(requestAddress(request))) {
      return Response.json(
        { error: "Too many messages were sent. Please wait a few minutes and try again." },
        { status: 429 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Contact email is not configured yet." },
        { status: 503 },
      );
    }

    try {
      const body = await request.json() as ContactRequest;
      const name = cleanText(body.name, 120);
      const email = cleanText(body.email, 254).toLowerCase();
      const message = cleanText(body.message, 4000);
      const company = cleanText(body.company, 120);

      // Bots commonly fill hidden fields. Return success without sending mail.
      if (company) {
        return Response.json({ sent: true });
      }

      if (name.length < 2 || !isEmail(email) || message.length < 10) {
        return Response.json(
          { error: "Please enter a valid name email and message." },
          { status: 400 },
        );
      }

      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
      const from = process.env.CONTACT_FROM_EMAIL
        || "Soolou Contact <onboarding@resend.dev>";

      const response = await fetch(resendEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [contactRecipient],
          reply_to: email,
          subject: `New Soolou message from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
          html: [
            "<h2>New message from the Soolou website</h2>",
            `<p><strong>Name:</strong> ${safeName}</p>`,
            `<p><strong>Email:</strong> ${safeEmail}</p>`,
            `<p><strong>Message:</strong><br />${safeMessage}</p>`,
          ].join(""),
        }),
      });

      const result = await response.json().catch(() => ({})) as {
        message?: string;
      };

      if (!response.ok) {
        return Response.json(
          { error: result.message || "The contact email could not be sent." },
          { status: 502 },
        );
      }

      return Response.json({ sent: true });
    } catch {
      return Response.json(
        { error: "The contact email could not be sent." },
        { status: 500 },
      );
    }
  },
};
