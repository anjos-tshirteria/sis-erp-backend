import { makeUserController } from "@src/factories/user.factory";
import { Router } from "express";

const userRouter = Router();
const userController = makeUserController();

userRouter
  .post("/", userController.create.bind(userController))
  .get("/", userController.list.bind(userController));

export { userRouter };
