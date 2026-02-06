import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { GetUserInput, GetUserOutput, GetUserSchema } from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { NotFoundError } from "@src/errors/generic.errors";
import { User } from "@src/entities/user.entity";

type Input = GetUserInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = GetUserOutput;

export class GetUserUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  constructor() {
    super();
  }

  protected validationRules(): ZodType<Input> {
    return GetUserSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const user = await prisma.user.findUnique({
      where: { id: input.id },
      include: { role: true },
    });

    if (!user) {
      return wrong(new NotFoundError("usuário", "id", input.id));
    }

    const domainUser = User.fromPrisma(user);

    return right(domainUser.toOutput());
  }
}
