import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { User } from "@src/entities/user.entity";
import { ZodType } from "zod";
import { CreateUserInput, CreateUserOutput, CreateUserSchema } from "../dtos";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database/index";
import { AlreadyExistsError, NotFoundError } from "@src/errors/generic.errors";
import PasswordUtil from "@src/util/password";
import { Role } from "@src/entities/role.entity";

type Input = CreateUserInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = CreateUserOutput;

export class CreateUserUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  constructor() {
    super();
  }

  protected validationRules(): ZodType<Input> {
    return CreateUserSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: input.email,
      },
    });

    if (existingUser) {
      return wrong(new AlreadyExistsError("usuário", "email"));
    }

    const role = await prisma.role.findFirst({ where: { id: input.roleId } });

    if (!role) {
      return wrong(new NotFoundError("cargo", "id", input.roleId));
    }

    const hashedPassword = await PasswordUtil.hashPassword(input.password);
    const user = new User({
      ...input,
      password: hashedPassword,
      role: new Role(role),
      roleId: role.id,
    });

    await prisma.user.create({ data: user.toPrisma() });

    return right(user.toOutput());
  }
}
