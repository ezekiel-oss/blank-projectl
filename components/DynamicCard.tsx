"use client";

import Image from "next/image";
import type { UIBlock } from "@/lib/types";

export default function DynamicCard({ block }: { block: UIBlock }) {
  if (block.type === "searchResults") {
    return (
      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Search Results</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {block.items.map((it) => (
            <li key={it.url}>
              <a href={it.url} target="_blank" rel="noreferrer">
                {it.title}
              </a>
              {it.snippet ? <div style={{ color: "var(--subtle)" }}>{it.snippet}</div> : null}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.type === "imageGallery") {
    return (
      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Images</div>
        <div className="grid">
          {block.items.map((img, i) => (
            <figure key={i} style={{ margin: 0 }}>
              {/* Using next/image for optimization */}
              <Image
                src={img.src}
                alt={img.alt}
                width={400}
                height={300}
                style={{ width: "100%", height: "auto", borderRadius: 10, border: "1px solid var(--border)" }}
              />
              <figcaption style={{ color: "var(--subtle)", fontSize: 12, marginTop: 6 }}>
                {img.alt} {img.source ? `• ${img.source}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "weatherCard") {
    return (
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Weather</div>
          <div style={{ color: "var(--subtle)" }}>{block.location}</div>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 8 }}>
          <div style={{ fontSize: 42, fontWeight: 800 }}>{Math.round(block.temperatureC)}°C</div>
          {typeof block.windKph === "number" ? (
            <div className="badge">Wind {Math.round(block.windKph)} km/h</div>
          ) : null}
        </div>
        {block.description ? <div style={{ color: "var(--subtle)", marginTop: 8 }}>{block.description}</div> : null}
      </div>
    );
  }

  return null;
}