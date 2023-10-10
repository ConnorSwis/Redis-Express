// Import dependencies
import { genSalt, hash } from "bcrypt";

(async () => {
  // Hash the password
  const salt = await genSalt(15);
  console.log(await hash("admin", salt));
})();
