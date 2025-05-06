import { Hono } from "hono";
import { prisma } from "../app/index.js";

const roomRoute = new Hono().get("/:roomId", async (c) => {
  const roomId = Number(c.req.param("roomId"));

  const [messages, users] = await Promise.all([
    prisma.message.findMany({
      where: {
        roomId,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.user.findMany({
      where: {
        roomUsers: {
          some: {
            roomId,
          },
        },
      },
    }),
  ]);

  return c.json({ messages, users });
});

export { roomRoute };
