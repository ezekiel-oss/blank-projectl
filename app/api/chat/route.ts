import { NextRequest } from "next/server";
import { tools } from "@/lib/tools";
import type { Message } from "@/lib/types";
import { routeToTool } from "@/lib/ai/router";
import { streamThesysChat } from "@/lib/ai/thesys";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const text: string = String(body?.text ?? "").trim();
  const history: Message[] = Array.isArray(body?.history) ? body.history : [];

  if (!text) {
    return Response.json({ error: "Text is required" }, { status: 400 });
  }

  const toolName = await routeToTool(text);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      const end = () => {
        controller.close();
      };

      try {
        if (!toolName) {
          // Assistant path — stream tokens from Thesys
          const chatHistory = history
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

          const msgs = [
            { role: "system" as const, content: "You are a helpful assistant inside a Next.js app. Be concise and accurate." },
            ...chatHistory.slice(-8),
            { role: "user" as const, content: text }
          ];

          let acc = "";
          for await (const token of streamThesysChat(msgs, { temperature: 0.3 })) {
            acc += token;
            send({ type: "token", content: token });
          }

          const reply: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: acc,
            ui: []
          };
          send({ type: "message", message: reply });
          end();
          return;
        }

        // Tool path — execute tool and send one final message
        const tool = tools[toolName];
        const result = await tool.run(text, { fetch });
        const reply: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.text,
          ui: result.ui
        };
        send({ type: "message", message: reply });
        end();
      } catch (err: any) {
        send({ type: "error", error: err?.message || "Unexpected error" });
        end();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive"
    }
  });
}