import Anthropic from '@anthropic-ai/sdk';

const defaultModel = process.env.CHAT_MODEL || 'claude-3-5-haiku-latest';

export async function chat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  model = defaultModel,
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');
  const client = new Anthropic({ apiKey });

  // Convert to Anthropic format: system + single user content
  const system = messages.find(m => m.role === 'system')?.content;
  const userParts = messages
    .filter(m => m.role !== 'system')
    .map(m => `(${m.role})\n${m.content}`)
    .join('\n\n');

  const resp = await client.messages.create({
    model,
    max_tokens: 600,
    temperature: 0.2,
    system,
    messages: [
      { role: 'user', content: userParts },
    ],
  });

  const text = resp.content
    .map(block => (block.type === 'text' ? block.text : ''))
    .join('')
    .trim();

  return { responseText: text };
}
