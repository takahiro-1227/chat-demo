import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "TOP | チャット!" },
    { name: "description", content: "チャットアプリです！！" },
  ];
};

export default function Index() {
  return (
    <>
      <h1 className="text-xl">チャット!</h1>

      <ul className="mt-4">
        <li>
          <Link to={`/user/1/room/1`}>ユーザー1</Link>
        </li>
        <li>
          <Link to={`/user/2/room/1`}>ユーザー2</Link>
        </li>
      </ul>
    </>
  );
}
