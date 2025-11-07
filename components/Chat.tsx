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
    setMessages((m) => [...m, userMsg]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, history: messages.concat(userMsg) })
    });
    const data = await res.json();
    if (data?.messages) {
      setMessages(data.messages);
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