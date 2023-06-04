import { FastifyRequest , FastifyReply } from "fastify";

export async function serverStatus(
  _: FastifyRequest,
  reply: FastifyReply
) {
  return reply.status(200).send({ message: `Servidor online.` });
}
