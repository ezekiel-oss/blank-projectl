import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Conversational AI",
  description: "Chat with tools: web search, images, and weather"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}