import type { Tool } from "@/lib/types";

/**
 * Simple image search placeholder using Unsplash source endpoint (no key).
 * Not guaranteed, but useful for demos. For production, wire a proper API.
 */
export const imageSearch: Tool = {
  name: "image_search",
  description: "Fetches representative images for a query",
  async run(input) {
    const q = encodeURIComponent(input.trim() || "scenic");
    const items = Array.from({ length: 6 }).map((_, i) => {
      const src = `https://source.unsplash.com/featured/400x300?${q}&sig=${i}`;
      return { alt: input || "image", src, source: "Unsplash (source endpoint)" };
    });

    return {
      text: `Here are images related to “${input}”.`,
      ui: [
        {
          type: "imageGallery",
          items
        }
      ]
    };
  }
};