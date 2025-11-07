import { streamText } from 'ai';
import 'dotenv/config';

// Map gateway/env variables to what the AI SDK expects.
if (process.env.THESYSAPI && !process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.THESYSAPI;
}
if (process.env.AI_GATEWAY_BASE && !process.env.OPENAI_API_BASE) {
  process.env.OPENAI_API_BASE = process.env.AI_GATEWAY_BASE;
}

async function main() {
  const result = streamText({
    model: 'openai/gpt-4.1',
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  console.log();
  console.log('Token usage:', await result.usage);
  console.log('Finish reason:', await result.finishReason);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});