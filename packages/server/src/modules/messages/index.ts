import { WSContext, WSEvents } from "hono/ws";
import { prisma } from "../app/index.js";

const wsMap = new Map<number, WSContext>();
const roomUserIdsMap = new Map<number, number[]>();

const onMessage: WSEvents<WebSocket>["onMessage"] = async (event, ws) => {
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
};

export const wsMessagesEvents: WSEvents<WebSocket> = {
  onMessage,
};
