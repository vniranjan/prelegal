"use client";

import { useState } from "react";
import { NdaFormData } from "@/lib/types";
import {
  ChatMessage,
  KnownTermFields,
  mergeWireData,
  sendChatMessage,
} from "@/lib/api";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'll help you fill out your Mutual NDA. What's the purpose of this agreement, and who are the two parties involved?",
};

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[80%] rounded-lg bg-blue-primary px-3 py-2 text-sm text-white"
            : "max-w-[80%] rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        }
      >
        {message.content}
      </div>
    </div>
  );
}

export default function ChatPanel({
  data,
  onChange,
}: {
  data: NdaFormData;
  onChange: (updater: (current: NdaFormData) => NdaFormData) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Tracks which discriminated-union term fields the AI has actually
  // established through conversation. Until then we withhold their form
  // defaults from the "known so far" context sent to the model, otherwise
  // it would treat the defaults as already-answered and never ask about them.
  const [knownTermFields, setKnownTermFields] = useState<KnownTermFields>({
    mndaTerm: false,
    confidentialityTerm: false,
  });

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const result = await sendChatMessage(nextMessages, data, knownTermFields);
      setMessages([
        ...nextMessages,
        { role: "assistant", content: result.reply },
      ]);
      if (result.wireData.mnda_term_type) {
        setKnownTermFields((prev) => ({ ...prev, mndaTerm: true }));
      }
      if (result.wireData.confidentiality_term_type) {
        setKnownTermFields((prev) => ({ ...prev, confidentialityTerm: true }));
      }
      onChange((current) => mergeWireData(result.wireData, current));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Chat
      </h2>

      <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-zinc-100 px-3 py-2 text-sm text-gray-text dark:bg-zinc-800">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Tell me about your NDA..."
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-md bg-purple-secondary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </section>
  );
}
