import { Request, Response } from "express";
import { AbstractController } from "@src/core/controller";
import { CreateUserUseCase } from "@src/use-cases/user/create-user/create-user.usecase";
import { DefaultFailOutput } from "@src/types/errors";
import { UserControllerOutput } from "@src/use-cases/user/dtos";

type FailOutput = DefaultFailOutput;
type SuccessOutput = UserControllerOutput;

export class UserController extends AbstractController<
  FailOutput,
  SuccessOutput
> {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {
    super();
  }

  async create(req: Request, res: Response) {
    const result = await this.createUserUseCase.run(req.body);
    return result.isRight()
      ? this.created(req, res, result)
      : this.handleError(req, res, result);
  }
}
