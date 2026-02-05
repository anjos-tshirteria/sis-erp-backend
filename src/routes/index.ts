import { Router } from "express";
import { userRouter } from "./user.routes";
import { roleRouter } from "./role.routes";

const routes = Router();

routes.use("/user", userRouter);
routes.use("/role", roleRouter);

export { routes };
