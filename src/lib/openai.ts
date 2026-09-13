import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || 'placeholder-key';
const openai = new OpenAI({
  apiKey,
});

interface GenerateReplyParams {
  systemPrompt: string;
  chatHistory: Array<{ sender: 'ai' | 'lead'; message_text: string }>;
  incomingMessage: string;
}

export async function generateAIAssistantReply({
  systemPrompt,
  chatHistory,
  incomingMessage,
}: GenerateReplyParams): Promise<string> {
  const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  for (const chat of chatHistory) {
    formattedMessages.push({
      role: chat.sender === 'ai' ? 'assistant' : 'user',
      content: chat.message_text,
    });
  }

  formattedMessages.push({ role: 'user', content: incomingMessage });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: formattedMessages,
    temperature: 0.7,
    max_tokens: 150,
  });

  return response.choices[0]?.message?.content || "Hello! Thanks for reaching out. What is your preferred location and budget?";
}