import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { UpdateUserInput, UpdateUserOutput, UpdateUserSchema } from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { User } from "@src/entities/user.entity";
import { NotFoundError } from "@src/errors/generic.errors";

type Input = UpdateUserInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = UpdateUserOutput;

export class UpdateUserUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  protected validationRules(): ZodType<Input> {
    return UpdateUserSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { id, ...data } = input;

    const existing = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!existing) {
      return wrong(new NotFoundError("usuário", "id", id));
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    const domainUser = User.fromPrisma(updated);

    return right(domainUser.toOutput());
  }
}
