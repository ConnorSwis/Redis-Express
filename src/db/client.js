import { Client } from "redis-om";

export const client = await new Client().open();
