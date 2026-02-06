import { makeAuthController } from "@src/factories/auth.factory";
import { Router } from "express";

const authRouter = Router();
const authController = makeAuthController();

authRouter
  .post("/login", authController.login.bind(authController))
  .post("/refresh", authController.refresh.bind(authController));

export { authRouter };
