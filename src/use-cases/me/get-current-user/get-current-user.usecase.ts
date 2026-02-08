import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import {
  GetCurrentUserInput,
  GetCurrentUserOutput,
  GetCurrentUserSchema,
} from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { NotFoundError } from "@src/errors/generic.errors";
import { User } from "@src/entities/user.entity";

type Input = GetCurrentUserInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = GetCurrentUserOutput;

export class GetCurrentUserUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  constructor() {
    super();
  }

  protected validationRules(): ZodType<Input> {
    return GetCurrentUserSchema;
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

    return right({
      id: domainUser.id,
      name: domainUser.name,
      username: domainUser.username,
      email: domainUser.email,
      active: domainUser.active,
      role: {
        id: domainUser.role.id,
        name: domainUser.role.name,
        description: domainUser.role.description ?? null,
        permissions: domainUser.role.permissions,
      },
      createdAt: domainUser.createdAt,
      updatedAt: domainUser.updatedAt,
    });
  }
}
