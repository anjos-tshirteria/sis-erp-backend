import { makeRoleController } from "@src/factories/role.factory";
import { Router } from "express";

const roleRouter = Router();
const roleController = makeRoleController();

roleRouter
  .post("/", roleController.create.bind(roleController))
  .get("/", roleController.list.bind(roleController))
  .get("/:id", roleController.get.bind(roleController))
  .put("/:id", roleController.update.bind(roleController))
  .delete("/:id", roleController.delete.bind(roleController));

export { roleRouter };
