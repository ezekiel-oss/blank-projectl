import { NextRequest } from "next/server";
import { tools } from "@/lib/tools";
import type { Message } from "@/lib/types";
import { routeToTool } from "@/lib/ai/router";
import { assistantReply } from "@/lib/ai/assistant";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const text: string = String(body?.text ?? "").trim();
  const history: Message[] = Array.isArray(body?.history) ? body.history : [];

  if (!text) {
    return Response.json({ error: "Text is required" }, { status: 400 });
  }

  // Try LLM router; fallback to heuristics
  const toolName = await routeToTool(text);

  if (!toolName) {
    const chatHistory = history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const content = await assistantReply(text, chatHistory);
    const reply: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content,
      ui: []
    };
    return Response.json({ messages: [...history, reply] });
  }

  const tool = tools[toolName];
  const result = await tool.run(text, { fetch });
  const reply: Message = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: result.text,
    ui: result.ui
  };

  return Response.json({ messages: [...history, reply] });
}