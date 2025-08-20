import { and, eq, sql } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { db } from '../../../db/connection.ts';
import { schema } from '../../../db/schema/index.ts';
import {
  generateAnswer,
  generateEmbeddings,
} from '../../../services/gemini.ts';

export const createQuestionRoomRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { question } = request.body;
      const { roomId } = request.params;

      const embeddings = await generateEmbeddings(question); // gerar para comparar com a explicação
      const embeddingsAsString = `[${embeddings.join(',')}]`;

      const similarity = 0.7; // Grau de similidade entre embeddings / vetores

      // Para comparar proximidade de vetores usa-se <=>
      const chunks = await db
        .select({
          id: schema.audioChunks.id,
          transcription: schema.audioChunks.transcription,
          similarity: sql<number>`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector)`,
        })
        .from(schema.audioChunks)
        .where(
          and(
            eq(schema.audioChunks.roomId, roomId),
            sql`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector) > ${similarity}`
          )
        )
        .orderBy(
          sql`${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector`
        )
        .limit(3);

      let answer: string | null = null;

      if (chunks.length > 0) {
        const transcription = chunks.map((chunk) => chunk.transcription);

        answer = await generateAnswer(question, transcription);
      }

      const result = await db
        .insert(schema.questions)
        .values({
          roomId,
          question,
          answer,
        })
        .returning();

      const insertedQuestion = result[0];

      if (!insertedQuestion) {
        throw new Error('Failed to create new question.');
      }

      return reply
        .status(201)
        .send({ questionId: insertedQuestion.id, answer });
    }
  );
};
