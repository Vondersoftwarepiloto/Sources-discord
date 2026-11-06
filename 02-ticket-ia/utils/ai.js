const OpenAI = require('openai');

let client = null;

function getClient() {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  // Suporta OpenAI oficial ou Groq (compatível)
  const baseURL = process.env.AI_PROVIDER === 'groq'
    ? 'https://api.groq.com/openai/v1'
    : undefined;

  client = new OpenAI({ apiKey, baseURL });
  return client;
}

async function generateResponse(userMessage, systemPrompt) {
  const openai = getClient();
  if (!openai) {
    return '⚠️ IA não configurada. Adicione OPENAI_API_KEY no arquivo .env';
  }

  try {
    const model = process.env.AI_PROVIDER === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return completion.choices[0]?.message?.content || 'Não consegui gerar uma resposta.';
  } catch (error) {
    console.error('Erro na IA:', error.message);
    return '❌ Erro ao consultar a IA. A staff foi notificada.';
  }
}

module.exports = { generateResponse };
