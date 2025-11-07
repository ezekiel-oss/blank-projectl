import 'dotenv/config';

const BASE =
  process.env.AI_GATEWAY_BASE ||
  process.env.THESYS_API_BASE ||
  'https://api.thesys.ai/v1';

const KEY =
  process.env.THESYSAPI ||
  process.env.AI_GATEWAY_API_KEY ||
  process.env.THESYS_API_KEY;

const MODEL = process.env.THESYS_MODEL || 'gpt-4.1';

async function main() {
  if (!KEY) {
    console.error('Missing THESYSAPI (or AI_GATEWAY_API_KEY / THESYS_API_KEY) in environment');
    process.exit(1);
  }

  const prompt =
    process.argv.slice(2).join(' ') ||
    'Invent a new holiday and describe its traditions.';

  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a concise assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gateway error ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.delta?.content ??
    '';

  console.log(content || '(empty response)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});