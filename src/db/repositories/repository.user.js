import { client } from "../client.js";
import { userSchema } from "../schemas/schema.user.js";
import { Repository } from "redis-om";

/** @type { Repository } */
export const userRepo = client.fetchRepository(userSchema);

await userRepo.createIndex();
