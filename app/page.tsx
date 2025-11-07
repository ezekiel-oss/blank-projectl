"use client";

import { useState } from "react";
import Chat from "@/components/Chat";

export default function Page() {
  return (
    <main className="container">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Conversational AI</h1>
        <span className="badge">
          <span>⚛️ Next.js 15 + React 19</span>
        </span>
      </header>
      <p style={{ color: "var(--subtle)", marginTop: 0 }}>
        Ask me to do web search, find an image, or check the weather. I’ll generate UI dynamically when tools are used.
      </p>

      <div className="card">
        <Chat />
      </div>
    </main>
  );
}