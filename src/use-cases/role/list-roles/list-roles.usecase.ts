import { AbstractUseCase } from "@src/core/use-case";
import { Either, right } from "@src/util/either";
import { ListRolesInput, ListRolesOutput, ListRolesSchema } from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { paginate } from "@src/util/pagination";
import { Role } from "@src/entities/role.entity";

type Input = ListRolesInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = ListRolesOutput;

export class ListRolesUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  protected validationRules(): ZodType<Input> {
    return ListRolesSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { page, limit, ...filters } = input;

    const {
      data: roles,
      total,
      totalPages,
    } = await paginate(prisma.role, filters, page, limit);

    const mapped = roles.map((r: any) => {
      return Role.fromPrisma(r);
    });

    return right({
      data: mapped,
      pagination: { page, limit, total, totalPages },
    });
  }
}
