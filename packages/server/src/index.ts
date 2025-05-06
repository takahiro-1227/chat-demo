import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { WSContext } from "hono/ws";

export interface ReceivedMessage {
  content: string;
  senderId: number;
  roomId: number;
}

export interface ReceivedSenderId {
  senderId: number;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  roomId: number;
}

const PORT = 4000;

const prisma = new PrismaClient();

const app = new Hono()
  .get("/room/:roomId", async (c) => {
    const roomId = Number(c.req.param("roomId"));

    const messages: Message[] = await prisma.message.findMany({
      where: {
        roomId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return c.json({ messages });
  })
  .get("/user/:userId", async (c) => {
    const userId = Number(c.req.param("userId"));

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return c.json({
      user,
    });
  });

const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });

const wsMap = new Map<number, WSContext>();
const roomUserIdsMap = new Map<number, number[]>();

const route = app.get(
  "/ws-messages",
  upgradeWebSocket(() => {
    return {
      async onMessage(event, ws) {
        const data = await JSON.parse(event.data.toString());

        if (data.senderId && !data?.content) {
          wsMap.set(data.senderId, ws);
          return;
        }

        let roomMemberIds: number[] = [];

        const roomMemberIdsFromMap = roomUserIdsMap.get(data.roomId);

        if (roomMemberIdsFromMap) {
          roomMemberIds = roomMemberIdsFromMap;
        } else {
          const roomUsers = await prisma.roomUser.findMany({
            where: {
              roomId: data.roomId,
            },
          });

          roomMemberIds = roomUsers.map(({ userId }) => userId);
          roomUserIdsMap.set(data.roomId, roomMemberIds);
        }

        const targetRoomMemberIds = roomMemberIds.filter(
          (id) => id !== data.senderId,
        );

        targetRoomMemberIds.forEach((id) => {
          const memberWs = wsMap.get(id);
          if (memberWs) {
            memberWs.send(JSON.stringify(data));
          }
        });

        await prisma.message.create({
          data,
        });
      },
    };
  }),
);

const server = serve({
  fetch: route.fetch,
  port: PORT,
});

injectWebSocket(server);

console.log("Server is ready! Port:", PORT);

export type app = typeof route;

export default app;
