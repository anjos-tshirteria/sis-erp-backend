import { makeUserController } from "@src/factories/user.factory";
import { authMiddleware } from "@src/middleware/auth.middleware";
import { authorize } from "@src/middleware/permission.middleware";
import { Router } from "express";
import { PermissionCode } from "generated/prisma/enums";

const userRouter = Router();
const userController = makeUserController();

userRouter.use(authMiddleware);
userRouter.use(authorize(PermissionCode.MANAGE_USERS));

userRouter
  .post("/", userController.create.bind(userController))
  .get("/", userController.list.bind(userController))
  .get("/:id", userController.get.bind(userController))
  .put("/:id", userController.update.bind(userController))
  .delete("/:id", userController.delete.bind(userController));

export { userRouter };
