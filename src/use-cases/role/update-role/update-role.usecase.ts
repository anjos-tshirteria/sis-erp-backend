import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { UpdateRoleInput, UpdateRoleOutput, UpdateRoleSchema } from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { Role } from "@src/entities/role.entity";
import { NotFoundError } from "@src/errors/generic.errors";

type Input = UpdateRoleInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = UpdateRoleOutput;

export class UpdateRoleUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  protected validationRules(): ZodType<Input> {
    return UpdateRoleSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { id, ...data } = input;

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) return wrong(new NotFoundError("Role", "ID", id));

    const updated = await prisma.role.update({ where: { id }, data });

    return right(Role.fromPrisma(updated));
  }
}
