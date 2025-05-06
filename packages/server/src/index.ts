import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { roomRoute } from "./modules/rooms/index.js";
import { wsMessagesEvents, userRoute, usersRoute } from "./modules/index.js";

export interface ReceivedMessage {
  content: string;
  senderId: number;
  roomId: number;
}

export interface ReceivedSenderId {
  senderId: number;
}

const PORT = 4000;

const app = new Hono()
  .route("/room", roomRoute)
  .route("/users", usersRoute)
  .route("/user", userRoute);

const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });

const route = app.get(
  "/ws-messages",
  upgradeWebSocket(() => wsMessagesEvents),
);

const server = serve({
  fetch: route.fetch,
  port: PORT,
});

injectWebSocket(server);

console.log("Server is ready! Port:", PORT);

export type app = typeof route;

export default app;
