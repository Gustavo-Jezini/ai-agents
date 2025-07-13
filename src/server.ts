import { fastifyCors } from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './env.ts';
import { uploadAudioRoute } from './http/routes/audio/upload-audio.ts';
import { createRoomsRoute } from './http/routes/create-rooms.ts';
import { getRoomsRoute } from './http/routes/get-rooms.ts';
import { createQuestionRoomRoute } from './http/routes/questions/create-question-room.ts';
import { getRoomsQuestions } from './http/routes/questions/get-room-questions.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: 'http://localhost:5173', // endereço do front end
});

app.register(fastifyMultipart);

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get('/health', () => {
  return 'OK';
});

app.register(getRoomsRoute);
app.register(getRoomsQuestions);
app.register(createQuestionRoomRoute);
app.register(createRoomsRoute);
app.register(uploadAudioRoute);

app.listen({ port: env.PORT });
