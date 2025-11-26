"use client";

import { useState } from "react";
import type { Message } from "@/lib/types";
import MessageView from "./Message";
import DynamicCard from "./DynamicCard";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  async function send() {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();
    const assistantPlaceholder: Message = { id: assistantId, role: "assistant", content: "", ui: [] };

    setMessages((m) => [...m, userMsg, assistantPlaceholder]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, history: messages.concat(userMsg) })
    });

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    const updateAssistant = (update: Partial<Message>) => {
      setMessages((m) =>
        m.map((msg) => (msg.id === assistantId ? { ...msg, ...update, ui: update.ui ?? msg.ui } : msg))
      );
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const chunk = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 2);

        for (const line of chunk.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;

          try {
            const evt = JSON.parse(payload);
            if (evt.type === "token" && typeof evt.content === "string") {
              updateAssistant({ content: (messages.find((m) => m.id === assistantId)?.content || "") + evt.content });
              // After the first token, subsequent tokens need latest state; re-read via functional update:
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId ? { ...msg, content: (msg.content || "") + evt.content } : msg
                )
              );
            } else if (evt.type === "message" && evt.message) {
              updateAssistant(evt.message);
            } else if (evt.type === "error") {
              updateAssistant({ content: "Error: " + (evt.error || "unknown") });
            }
          } catch {
            // ignore malformed event
          }
        }
      }
    }
  }

  return (
    <div>
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id}>
            <MessageView message={m} />
            {/* Generative UI */}
            {m.ui ? (
              <div className="grid">
                {m.ui.map((block, i) => (
                  <DynamicCard key={i} block={block} />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="inputRow">
        <input
          type="text"
          value={input}
          placeholder="Ask me anything… e.g. search React Server Actions"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
        />
        <button className="button" onClick={send}>Send</button>
      </div>
    </div>
  );
}