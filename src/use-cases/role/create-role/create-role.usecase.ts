import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { CreateRoleInput, CreateRoleOutput, CreateRoleSchema } from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { Role } from "@src/entities/role.entity";
import { AlreadyExistsError } from "@src/errors/generic.errors";

type Input = CreateRoleInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = CreateRoleOutput;

export class CreateRoleUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  protected validationRules(): ZodType<Input> {
    return CreateRoleSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { name, description, permissions } = input;

    const role = await prisma.role.findUnique({
      where: { name },
    });

    if (role) {
      return wrong(new AlreadyExistsError("Role", "name"));
    }

    const created = await prisma.role.create({
      data: {
        name,
        description,
        permissions,
      },
    });

    return right(Role.fromPrisma(created));
  }
}
