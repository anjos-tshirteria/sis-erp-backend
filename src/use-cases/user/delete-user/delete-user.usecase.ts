import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { DeleteUserInput, DeleteUserOutput, DeleteUserSchema } from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { NotFoundError } from "@src/errors/generic.errors";

type Input = DeleteUserInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = DeleteUserOutput;

export class DeleteUserUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  protected validationRules(): ZodType<Input> {
    return DeleteUserSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { id } = input;

    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      return wrong(new NotFoundError("usuário", "id", id));
    }

    await prisma.user.delete({ where: { id } });

    return right(undefined);
  }
}
