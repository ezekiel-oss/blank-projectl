import { NextRequest } from "next/server";
import { pickToolFromText } from "@/lib/tools";
import type { Message } from "@/lib/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const text: string = String(body?.text ?? "").trim();
  const history: Message[] = Array.isArray(body?.history) ? body.history : [];

  if (!text) {
    return Response.json({ error: "Text is required" }, { status: 400 });
  }

  const tool = pickToolFromText(text);
  if (!tool) {
    const reply: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "I can search the web, find images, and check weather. Try: “search latest Next.js features”, “image aurora borealis”, or “weather in Tokyo”.",
      ui: []
    };
    return Response.json({ messages: [...history, reply] });
  }

  const result = await tool.run(text, { fetch });
  const reply: Message = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: result.text,
    ui: result.ui
  };

  return Response.json({ messages: [...history, reply] });
}