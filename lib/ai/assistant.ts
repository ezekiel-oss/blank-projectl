import { tryThesysChat } from "./thesys";

const SYSTEM = `You are a helpful assistant inside a Next.js app. Be concise and accurate. If the user asks for actions that require tools, you can suggest what to type (e.g., "search ...", "image ...", "weather ...").`;

export async function assistantReply(userText: string, chatHistory: Array<{ role: "user" | "assistant"; content: string }>): Promise<string> {
  const messages = [
    { role: "system" as const, content: SYSTEM },
    ...chatHistory.slice(-8), // keep it short
    { role: "user" as const, content: userText }
  ];

  const text = await tryThesysChat(messages, { temperature: 0.3 });
  return (
    text ||
    "I can search the web, find images, and check weather. Try: “search latest Next.js features”, “image aurora borealis”, or “weather in Tokyo”."
  );
}