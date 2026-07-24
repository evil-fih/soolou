import {
  ChatCircleDots,
  PaperPlaneRight,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { askSoolouHelper, type SoolouChatMessage } from "../lib/backend";

interface ChatMessage {
  id: number;
  sender: "bot" | "user";
  text: string;
  href?: string;
  linkLabel?: string;
}

const quickPrompts = ["Track my order", "Create a plush", "Contact support"];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I am the Soolou quick helper. What can I help you find?",
    },
  ]);
  const nextMessageId = useRef(2);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  async function sendMessage(text: string) {
    const trimmedMessage = text.trim();
    if (!trimmedMessage || typing) return;

    const userMessage: ChatMessage = {
      id: nextMessageId.current++,
      sender: "user",
      text: trimmedMessage,
    };
    const conversation = [...messages, userMessage];

    setMessages(conversation);
    setInput("");
    setTyping(true);

    try {
      const chatHistory: SoolouChatMessage[] = conversation.slice(-10).map((message) => ({
        role: message.sender === "bot" ? "assistant" : "user",
        content: message.text,
      }));
      const reply = await askSoolouHelper(chatHistory);

      setMessages((current) => [
        ...current,
        {
          id: nextMessageId.current++,
          sender: "bot",
          text: reply,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId.current++,
          sender: "bot",
          text: "I could not reach Gemini right now. Please try again in a moment or contact the Soolou team.",
          href: "#/contact",
          linkLabel: "Contact Soolou",
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <aside className="support-chat" aria-label="Soolou support chat">
      {open ? (
        <section className="support-chat-panel" role="dialog" aria-labelledby="support-chat-title">
          <header className="support-chat-header">
            <span className="support-chat-avatar" aria-hidden="true">
              <Sparkle weight="fill" />
            </span>
            <div>
              <h2 id="support-chat-title">Soolou Helper</h2>
              <span>Powered by Gemini 3.5 Flash</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close support chat" title="Close chat">
              <X weight="bold" />
            </button>
          </header>

          <div className="support-chat-messages" aria-live="polite">
            {messages.map((message) => (
              <div
                className={message.sender === "bot" ? "support-chat-message support-chat-message-bot" : "support-chat-message support-chat-message-user"}
                key={message.id}
              >
                <p>{message.text}</p>
                {message.href && message.linkLabel ? (
                  <a href={message.href} onClick={() => setOpen(false)}>
                    {message.linkLabel}
                  </a>
                ) : null}
              </div>
            ))}
            {typing ? (
              <div className="support-chat-typing" aria-label="Soolou Helper is typing">
                <span />
                <span />
                <span />
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="support-chat-prompts" aria-label="Suggested questions">
            {quickPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={typing}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="support-chat-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="support-chat-input">Ask Soolou Helper</label>
            <input
              id="support-chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a question..."
              maxLength={240}
              autoComplete="off"
            />
            <button type="submit" aria-label="Send message" title="Send message" disabled={!input.trim() || typing}>
              <PaperPlaneRight weight="fill" />
            </button>
          </form>
        </section>
      ) : null}

      <button
        className="support-chat-toggle"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        aria-expanded={open}
        title={open ? "Close chat" : "Chat with Soolou"}
      >
        {open ? <X weight="bold" /> : <ChatCircleDots weight="fill" />}
      </button>
    </aside>
  );
}
