import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import clsx from "clsx";
import { hc } from "hono/client";
import { app, ReceivedMessage } from "../../../server";
import { useState, ChangeEventHandler, useEffect } from "react";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

interface DisplayedMessage {
  content: string;
  senderId: number;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const userId = params.userId;
  const roomId = params.roomId;

  if (!userId || !roomId) {
    throw new Error("パスパラメータが不正です。");
  }

  const client = hc<app>("http://localhost:4000");

  const [{ messages }, { user }] = await Promise.all([
    client.room[":roomId"]
      .$get({
        param: {
          roomId,
        },
      })
      .then((res) => res.json()),
    client.user[":userId"]
      .$get({
        param: {
          userId,
        },
      })
      .then(async (res) => {
        const { user } = await res.json();
        if (!user) {
          throw new Error("該当のユーザーが存在しません。");
        }

        return { user };
      }),
  ]);

  return {
    messages,
    user,
    roomId: Number(roomId),
  };
};

export default function Index() {
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<DisplayedMessage[]>([]);

  const {
    messages: initialMessages,
    user,
    roomId,
  } = useLoaderData<typeof loader>();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const client = hc<app>("http://localhost:4000");
    const socket = client["ws-messages"].$ws(0);

    setWs(socket);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          senderId: user.id,
        }),
      );
    };
    socket.onmessage = (event) => {
      const messageObj = JSON.parse(event.data) as DisplayedMessage;
      setMessages((prev) => [...prev, messageObj]);
    };

    return () => socket.close();
  }, [user.id]);

  const inputMsg: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setInput(target.value);
  };

  const sendMsg = () => {
    if (!ws || !input) {
      return;
    }
    const messageObj: ReceivedMessage = {
      senderId: user.id,
      roomId,
      content: input,
    };

    ws.send(JSON.stringify(messageObj));
    setMessages((prev) => [
      ...prev,
      {
        senderId: user.id,
        content: input,
      },
    ]);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-lg w-full flex flex-col">
        <h1>チャット from {user.name}</h1>
        <div className="mt-4 w-full flex flex-col gap-2">
          {messages.map(({ content, senderId }, i) => {
            return (
              <div
                key={`${content}-${i}`}
                className={clsx({
                  ["flex"]: true,
                  ["text-left justify-start"]: senderId !== user.id,
                  ["text-right justify-end"]: senderId === user.id,
                })}
              >
                <p
                  key={`${content}-${i}`}
                  className={clsx({
                    ["border p-4 max-w-[50%] rounded-xl"]: true,
                  })}
                >
                  {content}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 w-full flex gap-2">
          <input
            className="border w-full p-4 rounded-xl"
            value={input}
            onChange={inputMsg}
          />
          <button
            className="text-nowrap border py-4 px-5 rounded-xl"
            onClick={sendMsg}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
