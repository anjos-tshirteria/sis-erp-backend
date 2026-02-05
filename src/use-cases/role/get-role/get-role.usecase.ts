import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { GetRoleInput, GetRoleOutput, GetRoleSchema } from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { Role } from "@src/entities/role.entity";
import { NotFoundError } from "@src/errors/generic.errors";

type Input = GetRoleInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = GetRoleOutput;

export class GetRoleUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  protected validationRules(): ZodType<Input> {
    return GetRoleSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const role = await prisma.role.findUnique({ where: { id: input.id } });

    if (!role) return wrong(new NotFoundError("Role", "ID", input.id));

    return right(Role.fromPrisma(role));
  }
}
