import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { DefaultFailOutput } from "@src/types/errors";
import {
  LoginUseCaseInput,
  LoginUseCaseOutput,
  LoginUseCaseSchema,
} from "../dtos";
import PasswordUtil from "@src/util/password";
import JWT from "@src/util/jwt";
import { ZodType } from "zod";
import { prisma } from "@src/database";
import { UsernameOrPasswordWrongError } from "@src/errors/auth.errors";

type Input = LoginUseCaseInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = LoginUseCaseOutput;

export class LoginUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  constructor() {
    super();
  }

  protected validationRules(): ZodType<Input> {
    return LoginUseCaseSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const user = await prisma.user.findFirst({
      where: { username: input.username },
    });

    if (!user) {
      return wrong(new UsernameOrPasswordWrongError());
    }

    const passwordCheck = await PasswordUtil.comparePasswords(
      input.password,
      user.password,
    );

    if (!passwordCheck) {
      return wrong(new UsernameOrPasswordWrongError());
    }

    const { id: userId, roleId } = user;

    const accessToken = JWT.signToken({ userId, roleId });
    const refreshToken = JWT.signToken({ userId, roleId, refresh: true });

    return right({ accessToken, refreshToken });
  }
}
