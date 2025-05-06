import { Hono } from "hono";
import { prisma } from "../app/index.js";

export const usersRoute = new Hono().get("/", async (c) => {
  const users = await prisma.user.findMany();
  return c.json({
    users,
  });
});

export const userRoute = new Hono().get("/:userId", async (c) => {
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
