import { UserController } from "@src/controllers/user/user.controller";
import { CreateUserUseCase } from "@src/use-cases/user/create-user/create-user.usecase";
import { GetUserUseCase } from "@src/use-cases/user/get-user/get-user.usecase";
import { ListUsersUseCase } from "@src/use-cases/user/list-users/list-users.usecase";

export function makeUserController(): UserController {
  const createUserUseCase = new CreateUserUseCase();
  const listUsersUseCase = new ListUsersUseCase();
  const getUserUseCase = new GetUserUseCase();
  return new UserController(
    createUserUseCase,
    listUsersUseCase,
    getUserUseCase,
  );
}
