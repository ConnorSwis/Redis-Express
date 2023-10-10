// Import dependencie
import express, { json } from "express";
import { authRouter } from "./routes/routes.auth.js";
import "dotenv/config";

const app = express();
const port = process.env.port || 3000;

app.use(json({ limit: "100mb" }));
app.use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
