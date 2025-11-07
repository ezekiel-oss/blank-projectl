import { tryThesysChat } from "./thesys";
import { pickToolFromText } from "@/lib/tools";

type RouteDecision = {
  tool: "web_search" | "image_search" | "weather" | "none";
  reason?: string;
};

const SYSTEM = `You are a router. Decide which tool is best for the user's request.
Return ONLY a compact JSON object with the shape:
{"tool":"web_search"|"image_search"|"weather"|"none","reason":"..."}
- web_search: general web lookups, facts, links, news, documentation.
- image_search: user asks for pictures/photos/images.
- weather: user asks current weather for a place (e.g. "weather in Tokyo", "wx Paris").
- none: when the request is general chat or doesn't require tools.`;

export async function decideToolLLM(userText: string): Promise<RouteDecision | null> {
  const content = await tryThesysChat(
    [
      { role: "system", content: SYSTEM },
      { role: "user", content: userText }
    ],
    { temperature: 0.0 }
  );

  if (!content) return null;

  try {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    const jsonText = start >= 0 && end >= start ? content.slice(start, end + 1) : content;
    const parsed = JSON.parse(jsonText);
    if (parsed && typeof parsed.tool === "string") {
      return parsed as RouteDecision;
    }
  } catch {
    // fall through
  }
  return null;
}

export async function routeToTool(userText: string): Promise<"web_search" | "image_search" | "weather" | null> {
  // 1) Try LLM router if available
  const llm = await decideToolLLM(userText);
  if (llm?.tool && llm.tool !== "none") {
    return llm.tool;
  }

  // 2) Heuristic fallback
  const tool = pickToolFromText(userText);
  return tool ? (tool.name as "web_search" | "image_search" | "weather") : null;
}