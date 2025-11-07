import 'dotenv/config';

const BASE = process.env.THESYS_API_BASE || 'https://api.thesys.ai/v1';
const API_KEY = process.env.THESYS_API_KEY;
const MODEL = process.env.THESYS_MODEL || 'thesys-small';

async function main() {
  if (!API_KEY) {
    console.error('Missing THESYS_API_KEY in .env');
    process.exit(1);
  }

  const messages = [
    { role: 'system', content: 'You are a concise assistant.' },
    { role: 'user', content: 'Say hello in one sentence.' }
  ];

  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Thesys API error ${res.status}: ${text || res.statusText}`);
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