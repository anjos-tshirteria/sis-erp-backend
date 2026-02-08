import { Request, Response } from "express";
import { AbstractController } from "@src/core/controller";
import { DefaultFailOutput } from "@src/types/errors";
import { MeControllerOutput } from "@src/use-cases/me/dtos";
import { GetCurrentUserUseCase } from "@src/use-cases/me/get-current-user/get-current-user.usecase";
import { JwtPayload } from "jsonwebtoken";

type FailOutput = DefaultFailOutput;
type SuccessOutput = MeControllerOutput;

export class MeController extends AbstractController<
  FailOutput,
  SuccessOutput
> {
  constructor(
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {
    super();
  }

  async get(req: Request, res: Response) {
    const userId = (req as JwtPayload).user.id;
    const result = await this.getCurrentUserUseCase.run({ id: userId });
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }
}
