import { makeRoleController } from "@src/factories/role.factory";
import { Router } from "express";
import { authMiddleware } from "@src/middleware/auth.middleware";
import { authorize } from "@src/middleware/permission.middleware";
import { PermissionCode } from "generated/prisma/enums";

const roleRouter = Router();
const roleController = makeRoleController();

roleRouter.use(authMiddleware);
roleRouter.use(authorize(PermissionCode.MANAGE_USERS));

roleRouter
  .post("/", roleController.create.bind(roleController))
  .get("/", roleController.list.bind(roleController))
  .get("/:id", roleController.get.bind(roleController))
  .put("/:id", roleController.update.bind(roleController))
  .delete("/:id", roleController.delete.bind(roleController));

export { roleRouter };
