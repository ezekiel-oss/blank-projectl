const BASE = process.env.THESYS_API_BASE || "https://api.thesys.ai/v1";
const API_KEY = process.env.THESYS_API_KEY;
const MODEL = process.env.THESYS_MODEL || "thesys-small";

/**
 * Minimal OpenAI-compatible client for Thesys-like chat API.
 * Returns the assistant message text or throws on hard failure.
 */
export async function thesysChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  opts?: { temperature?: number }
) {
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
 * Stream tokens from Thesys (OpenAI-compatible SSE).
 * Yields content string chunks. Stops on [DONE].
 */
export async function* streamThesysChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  opts?: { temperature?: number }
): AsyncGenerator<string> {
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
      stream: true
    })
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`Thesys API error ${res.status}: ${text || res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Parse SSE lines
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 2);

      for (const line of chunk.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();

        if (payload === "[DONE]") {
          return;
        }
        try {
          const json = JSON.parse(payload);
          const delta =
            json?.choices?.[0]?.delta?.content ??
            json?.choices?.[0]?.message?.content ??
            "";
          if (delta) {
            yield String(delta);
          }
        } catch {
          // ignore malformed event
        }
      }
    }
  }
}

/**
 * Utility to safely try Thesys and return null on failure.
 */
export async function tryThesysChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  opts?: { temperature?: number }
): Promise<string | null> {
  try {
    return await thesysChat(messages, opts);
  } catch {
    return null;
  }
}