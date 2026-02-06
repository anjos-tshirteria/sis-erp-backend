import { Router } from "express";
import { userRouter } from "./user.routes";
import { roleRouter } from "./role.routes";
import { authRouter } from "./auth.routes";

const routes = Router();

routes.use(authRouter);
routes.use("/user", userRouter);
routes.use("/role", roleRouter);

export { routes };
