import { AbstractUseCase } from "@src/core/use-case";
import { Either, right } from "@src/util/either";
import { ListUsersInput, ListUsersOutput, ListUsersSchema } from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { paginate } from "@src/util/pagination";
import { User, Role } from "generated/prisma/client";
import { User as UserEntity } from "@src/entities/user.entity";

type Input = ListUsersInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = ListUsersOutput;

export class ListUsersUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  constructor() {
    super();
  }

  protected validationRules(): ZodType<Input> {
    return ListUsersSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { page, limit, ...filters } = input;

    const {
      data: users,
      total,
      totalPages,
    } = await paginate<User & { role: Role }>(
      prisma.user,
      filters,
      page,
      limit,
      {
        role: true,
      },
    );

    const domainUsers = users.map((user) => UserEntity.fromPrisma(user));

    return right({
      data: domainUsers.map((u) => u.toOutput()),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }
}
