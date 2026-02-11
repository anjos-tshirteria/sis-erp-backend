import { makeSupplierController } from "@src/factories/supplier.factory";
import { authMiddleware } from "@src/middleware/auth.middleware";
import { authorize } from "@src/middleware/permission.middleware";
import { Router } from "express";
import { PermissionCode } from "generated/prisma/enums";

const supplierRouter = Router();
const supplierController = makeSupplierController();

supplierRouter.use(authMiddleware);
supplierRouter.use(authorize(PermissionCode.MANAGE_SUPPLIERS));

supplierRouter
  .post("/", supplierController.create.bind(supplierController))
  .get("/", supplierController.list.bind(supplierController))
  .get("/:id", supplierController.get.bind(supplierController))
  .put("/:id", supplierController.update.bind(supplierController))
  .delete("/:id", supplierController.delete.bind(supplierController));

export { supplierRouter };
