export type Role = "user" | "assistant" | "tool";

export interface Message {
  id: string;
  role: Role;
  content: string;
  toolCall?: {
    name: string;
    args?: Record<string, unknown>;
  } | null;
  ui?: UIBlock[];
}

export type UIBlock =
  | {
      type: "searchResults";
      items: { title: string; url: string; snippet?: string }[];
    }
  | {
      type: "imageGallery";
      items: { alt: string; src: string; source?: string }[];
    }
  | {
      type: "weatherCard";
      location: string;
      temperatureC: number;
      windKph?: number;
      description?: string;
    };

export interface ToolContext {
  fetch: typeof fetch;
}

export interface ToolResult {
  text: string;
  ui?: UIBlock[];
}

export interface Tool {
  name: string;
  description: string;
  run: (input: string, ctx: ToolContext) => Promise<ToolResult>;
}