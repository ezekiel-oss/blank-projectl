import type { Tool } from "@/lib/types";
import { webSearch } from "./webSearch";
import { imageSearch } from "./imageSearch";
import { weather } from "./weather";

export const tools: Record<string, Tool> = {
  web_search: webSearch,
  image_search: imageSearch,
  weather: weather
};

export type ToolName = keyof typeof tools;

export function pickToolFromText(text: string): Tool | null {
  const q = text.toLowerCase();
  if (q.includes("weather") || q.startsWith("wx ")) return tools.weather;
  if (q.includes("image") || q.startsWith("img ")) return tools.image_search;
  if (q.includes("search") || q.includes("lookup") || q.includes("find")) return tools.web_search;
  return null;
}