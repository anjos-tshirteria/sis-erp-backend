import { makeClientController } from "@src/factories/client.factory";
import { authMiddleware } from "@src/middleware/auth.middleware";
import { authorize } from "@src/middleware/permission.middleware";
import { Router } from "express";
import { PermissionCode } from "generated/prisma/enums";

const clientRouter = Router();
const clientController = makeClientController();

clientRouter.use(authMiddleware);
clientRouter.use(authorize(PermissionCode.MANAGE_CLIENTS));

clientRouter
  .post("/", clientController.create.bind(clientController))
  .get("/", clientController.list.bind(clientController))
  .get("/:id", clientController.get.bind(clientController))
  .put("/:id", clientController.update.bind(clientController))
  .delete("/:id", clientController.delete.bind(clientController));

export { clientRouter };
