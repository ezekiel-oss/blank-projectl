import type { Tool } from "@/lib/types";

export const webSearch: Tool = {
  name: "web_search",
  description: "General web search using DuckDuckGo Instant Answer API",
  async run(input, ctx) {
    const q = encodeURIComponent(input.trim());
    const url = `https://api.duckduckgo.com/?q=${q}&format=json&no_redirect=1&no_html=1`;
    const res = await ctx.fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      return { text: `Search failed (${res.status}).` };
    }
    const data = await res.json();
    const items: { title: string; url: string; snippet?: string }[] = [];

    if (Array.isArray(data?.RelatedTopics)) {
      for (const t of data.RelatedTopics.slice(0, 5)) {
        if (t?.Text && t?.FirstURL) {
          items.push({ title: t.Text, url: t.FirstURL });
        } else if (t?.Topics) {
          for (const sub of t.Topics.slice(0, 5)) {
            if (sub?.Text && sub?.FirstURL) {
              items.push({ title: sub.Text, url: sub.FirstURL });
            }
          }
        }
      }
    }

    const text =
      items.length > 0
        ? `Here are some results for “${input}”.`
        : `I couldn't find results via the instant answer API for “${input}”. Try a different query.`;

    return {
      text,
      ui: items.length
        ? [
            {
              type: "searchResults",
              items
            }
          ]
        : undefined
    };
  }
};