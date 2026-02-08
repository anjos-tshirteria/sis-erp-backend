import { Router } from "express";
import { userRouter } from "./user.routes";
import { roleRouter } from "./role.routes";
import { authRouter } from "./auth.routes";
import { meRouter } from "./me.routes";

const routes = Router();

routes.use(authRouter);
routes.use("/me", meRouter);
routes.use("/user", userRouter);
routes.use("/role", roleRouter);

export { routes };
