import { User } from "@src/entities/user.entity";
import { Role as RoleEntity } from "@src/entities/role.entity";
import { AbstractUseCase } from "@src/core/use-case";
import { Either, right } from "@src/util/either";
import { ListUsersInput, ListUsersOutput, ListUsersSchema } from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { paginate } from "@src/util/pagination";
import {
  User as PrismaUser,
  Role as PrismaRole,
} from "generated/prisma/client";

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
    } = await paginate<PrismaUser & { role: PrismaRole }>(
      prisma.user,
      filters,
      page,
      limit,
      {
        role: true,
      },
    );

    const domainUsers = users.map((user) => this.mapPrismaToDomain(user));

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

  private mapPrismaToDomain(user: PrismaUser & { role: PrismaRole }): User {
    const role = new RoleEntity({
      id: user.role.id,
      name: user.role.name,
      description: user.role.description ?? null,
      createdAt: user.role.createdAt,
      updatedAt: user.role.updatedAt,
    });

    return new User({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email ?? null,
      password: user.password,
      active: user.active ?? true,
      roleId: user.roleId,
      role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
