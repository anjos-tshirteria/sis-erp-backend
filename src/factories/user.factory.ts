import { UserController } from "@src/controllers/user/user.controller";
import { CreateUserUseCase } from "@src/use-cases/user/create-user/create-user.usecase";
import { GetUserUseCase } from "@src/use-cases/user/get-user/get-user.usecase";
import { ListUsersUseCase } from "@src/use-cases/user/list-users/list-users.usecase";
import { UpdateUserUseCase } from "@src/use-cases/user/update-user/update-user.usecase";
import { DeleteUserUseCase } from "@src/use-cases/user/delete-user/delete-user.usecase";

export function makeUserController(): UserController {
  const createUserUseCase = new CreateUserUseCase();
  const listUsersUseCase = new ListUsersUseCase();
  const getUserUseCase = new GetUserUseCase();
  const updateUserUseCase = new UpdateUserUseCase();
  const deleteUserUseCase = new DeleteUserUseCase();
  return new UserController(
    createUserUseCase,
    listUsersUseCase,
    getUserUseCase,
    updateUserUseCase,
    deleteUserUseCase,
  );
}
