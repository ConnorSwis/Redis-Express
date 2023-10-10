import { Router } from "express";
import { authController } from "../controllers/controller.auth.js";
import { authorizedRoute } from "../middleware/middleware.auth.js";

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.put("", authController.update);
authRouter.delete("", authController.delete);
authRouter.get("/authorized", authController.isAuthorized);
authRouter.get("/user", authorizedRoute(["user"]), authController.getUser);
authRouter.post("/roles/set/:id", authController.setRoles);
