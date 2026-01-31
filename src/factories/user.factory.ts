import { UserController } from "@src/controllers/user/user.controller";
import { CreateUserUseCase } from "@src/use-cases/user/create-user/create-user.usecase";

export function makeUserController(): UserController {
  const createUserUseCase = new CreateUserUseCase();
  return new UserController(createUserUseCase);
}
