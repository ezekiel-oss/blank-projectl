import type { Tool } from "@/lib/types";

async function geocode(name: string, fetcher: typeof fetch) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name
  )}&count=1`;
  const res = await fetcher(url, { next: { revalidate: 600 } });
  if (!res.ok) return null;
  const data = await res.json();
  const r = data?.results?.[0];
  if (!r) return null;
  return {
    name: `${r.name}${r.country ? ", " + r.country : ""}`,
    lat: r.latitude,
    lon: r.longitude
  };
}

export const weather: Tool = {
  name: "weather",
  description: "Get current weather for a location using Open-Meteo",
  async run(input, ctx) {
    const place = input.replace(/^wx\s+/i, "").trim();
    if (!place) {
      return { text: "Please specify a location, e.g. “weather in Paris” or “wx Tokyo”." };
    }
    const g = await geocode(place, ctx.fetch);
    if (!g) return { text: `Couldn't find the location “${place}”.` };

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${g.lat}&longitude=${g.lon}&current=temperature_2m,wind_speed_10m`;
    const res = await ctx.fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) return { text: "Weather service unavailable." };
    const data = await res.json();
    const temp = data?.current?.temperature_2m;
    const wind = data?.current?.wind_speed_10m;

    return {
      text: `Current weather for ${g.name}: ${temp}°C, wind ${wind} km/h.`,
      ui: [
        {
          type: "weatherCard",
          location: g.name,
          temperatureC: typeof temp === "number" ? temp : NaN,
          windKph: typeof wind === "number" ? wind : undefined,
          description: "Powered by Open‑Meteo"
        }
      ]
    };
  }
};