import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { DeleteRoleInput, DeleteRoleOutput, DeleteRoleSchema } from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { NotFoundError } from "@src/errors/generic.errors";

type Input = DeleteRoleInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = DeleteRoleOutput;

export class DeleteRoleUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  protected validationRules(): ZodType<Input> {
    return DeleteRoleSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { id } = input;

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) return wrong(new NotFoundError("Role", "ID", id));

    await prisma.role.delete({ where: { id } });

    return right(undefined);
  }
}
