"use client";

import type { Message } from "@/lib/types";

export default function MessageView({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`msg ${isUser ? "user" : ""}`}>
      <div className="bubble">
        {!isUser ? <div style={{ fontWeight: 600, marginBottom: 6 }}>Assistant</div> : null}
        <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
      </div>
    </div>
  );
}