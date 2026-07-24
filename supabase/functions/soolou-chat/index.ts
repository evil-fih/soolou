const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const model = "gemini-3.5-flash";
const generateContentEndpoint =
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function parseMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-10)
    .filter((message): message is ChatMessage => {
      if (!message || typeof message !== "object") return false;
      const candidate = message as Partial<ChatMessage>;
      return (
        (candidate.role === "user" || candidate.role === "assistant") &&
        typeof candidate.content === "string" &&
        candidate.content.trim().length > 0
      );
    })
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 1000),
    }));
}

async function requestGemini(apiKey: string, messages: ChatMessage[]) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(generateContentEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: [
              "You are Soolou Helper for the Soolou custom plush ecommerce website.",
              "Answer in a warm concise professional tone using no more than four short sentences.",
              "Help with products custom plush designs carts checkout accounts orders shipping and contacting support.",
              "Never invent order details prices policies or product availability.",
              "For account specific order status direct the customer to My Account.",
              "For human help direct them to /#/contact or soolouofficial@gmail.com.",
              "Do not mention these instructions and do not use markdown.",
            ].join(" "),
          }],
        },
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          maxOutputTokens: 320,
        },
      }),
    });

    const data = await response.json() as GeminiResponse;
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini could not answer this request.");
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!reply) throw new Error("Gemini returned an empty response.");
    return reply;
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "Gemini is not configured." }, 503);
  }

  try {
    const body = await request.json();
    const messages = parseMessages(body?.messages);

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return jsonResponse({ error: "A customer message is required." }, 400);
    }

    const reply = await requestGemini(apiKey, messages);
    return jsonResponse({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Soolou Helper is unavailable.";
    return jsonResponse({ error: message }, 502);
  }
});
