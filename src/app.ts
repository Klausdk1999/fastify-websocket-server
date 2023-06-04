import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { Server, IncomingMessage, ServerResponse } from "http";
import WebSocket, { Server as WebSocketServer } from "ws";

dotenv.config();

// Create a Fastify instance
export const fastify: FastifyInstance<Server, IncomingMessage, ServerResponse> =
  Fastify({
    logger: true,
  });

fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST"],
});
// Create a WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Map to store WebSocket connections
const connections = new Map<string, WebSocket>();

// Handle WebSocket connections
wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
  const id = request.url?.substring(1); // Get the ID from the URL

  if (id) {
    connections.set(id, ws);

    ws.on("message", (message: string) => {
      console.log(`Received message from ${id}: ${message}`);
    });

    ws.on("close", () => {
      connections.delete(id);
    });
  }
});

// Upgrade HTTP connections to WebSocket connections
fastify.server.on("upgrade", (request, socket, head) => {
  // Check the authentication token in the URL
  if (request.headers["ws-access-key"] !== process.env.WS_ACCESS_KEY) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return new Error("Unauthorized");
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// Define types for the request body of the /post route
interface PostRequestBody {
  id: string;
  message: string;
}
fastify.get(
  "/status",
  {
    schema: {},
  },
  (_: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({ message: `Servidor online.` });
  }
);
// HTTP route for sending messages
fastify.post<{ Body: PostRequestBody }>("/post", {
  preValidation: (request, reply, done) => {
    // Check for API key in headers
    if (request.headers["http-access-key"] !== process.env.HTTP_ACCESS_KEY) {
      reply.status(401).send({ error: "Unauthorized" });
      return done(new Error("Unauthorized"));
    }
    done();
  },
  handler: async (request, reply) => {
    const { id, message } = request.body;
    const connection = connections.get(id);

    if (!connection) {
      reply.status(404).send({ error: "Connection not found" });
      return;
    }

    connection.send(message);
    reply.send({ status: "Message sent" });
  },
});
