import { Request, Response } from "express";
import { AbstractController } from "@src/core/controller";
import { CreateUserUseCase } from "@src/use-cases/user/create-user/create-user.usecase";
import { DefaultFailOutput } from "@src/types/errors";
import { ListUsersInput, UserControllerOutput } from "@src/use-cases/user/dtos";
import { ListUsersUseCase } from "@src/use-cases/user/list-users/list-users.usecase";
import { GetUserUseCase } from "@src/use-cases/user/get-user/get-user.usecase";
import { UpdateUserUseCase } from "@src/use-cases/user/update-user/update-user.usecase";
import { DeleteUserUseCase } from "@src/use-cases/user/delete-user/delete-user.usecase";

type FailOutput = DefaultFailOutput;
type SuccessOutput = UserControllerOutput;

export class UserController extends AbstractController<
  FailOutput,
  SuccessOutput
> {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {
    super();
  }

  async create(req: Request, res: Response) {
    const result = await this.createUserUseCase.run(req.body);
    return result.isRight()
      ? this.created(req, res, result)
      : this.handleError(req, res, result);
  }

  async list(req: Request, res: Response) {
    const result = await this.listUsersUseCase.run(
      req.query as unknown as ListUsersInput,
    );
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async get(req: Request, res: Response) {
    const userId = req.params.id;
    const result = await this.getUserUseCase.run({ id: userId as string });
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async update(req: Request, res: Response) {
    const result = await this.updateUserUseCase.run({
      id: req.params.id as string,
      ...req.body,
    });
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async delete(req: Request, res: Response) {
    const result = await this.deleteUserUseCase.run({
      id: req.params.id as string,
    });
    return result.isRight()
      ? this.noContent(req, res, result)
      : this.handleError(req, res, result);
  }
}
