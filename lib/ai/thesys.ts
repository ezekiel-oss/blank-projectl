const BASE = process.env.THESYS_API_BASE || "https://api.thesys.ai/v1";
const API_KEY = process.env.THESYS_API_KEY;
const MODEL = process.env.THESYS_MODEL || "thesys-small";

/**
 * Minimal OpenAI-compatible client for Thesys-like chat API.
 * Returns the assistant message text or throws on hard failure.
 */
export async function thesysChat(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>, opts?: { temperature?: number }) {
  if (!API_KEY) {
    throw new Error("THESYS_API_KEY is not set");
  }

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: opts?.temperature ?? 0.2,
      stream: false
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Thesys API error ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json().catch(() => ({}));
  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.delta?.content ??
    "";

  return String(content);
}

/**
 * Utility to safely try Thesys and return null on failure.
 */
export async function tryThesysChat(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>, opts?: { temperature?: number }): Promise<string | null> {
  try {
    return await thesysChat(messages, opts);
  } catch {
    return null;
  }
}