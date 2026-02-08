import { makeMeController } from "@src/factories/me.factory";
import { authMiddleware } from "@src/middleware/auth.middleware";
import { Router } from "express";

const meRouter = Router();
const meController = makeMeController();

meRouter.use(authMiddleware);

meRouter.get("/", meController.get.bind(meController));

export { meRouter };
