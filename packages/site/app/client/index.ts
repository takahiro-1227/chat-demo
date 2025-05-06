import { app } from "../../../server";
import { hc } from "hono/client";

export const client = hc<app>("http://localhost:4000");
