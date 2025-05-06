import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { client } from "../client";

export const meta: MetaFunction = () => {
  return [
    { title: "TOP | チャット!" },
    { name: "description", content: "チャットアプリです！！" },
  ];
};

export const loader = async () => {
  const { users } = await client.users.$get().then((res) => res.json());

  return users;
};

export default function Index() {
  const users = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="text-3xl font-bold">チャット!</h1>

      <div className="mt-4">
        <h2 className="text-lg">ユーザー</h2>
        <ul className="mt-2">
          {users.map(({ id, name }) => (
            <li key={id}>
              <Link className="underline" to={`/user/${id}/room/1`}>
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
