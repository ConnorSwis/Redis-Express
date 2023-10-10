import { Schema } from "redis-om";

export const userSchema = new Schema("user", {
  email: { type: "string" },
  password: { type: "string", caseSensitive: true, indexed: false },
  role: { type: "string" },
});
