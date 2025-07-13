import { GoogleGenAI } from '@google/genai';

const gemini = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const model = 'gemini-2.5-flash';

export async function transcribeAudio(
  audioAsBase64: string,
  mimeType: string
): Promise<string> {
  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        // Prompt
        text: 'Transcreva o áudio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado',
      },
      {
        inlineData: {
          mimeType,
          data: audioAsBase64,
        },
      },
    ],
  });

  if (!response.text) {
    throw new Error('Não foi possível converter o audio');
  }

  return response.text;
}

export async function generateEmbeddings(text: string) {
  const response = await gemini.models.embedContent({
    model: 'text-embedding-004',
    contents: [{ text }],
    config: {
      taskType: 'RETRIEVAL_DOCUMENT', // Vai ser usado para realizar buscas semânticas e depois utilizado em outros prompts
    },
  });

  if (!response.embeddings?.[0].values) {
    throw new Error('Não foi possível gerar embeddings.');
  }

  return response.embeddings[0].values;
}
