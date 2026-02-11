import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { Client } from "@src/entities/client.entity";
import { ZodType } from "zod";
import {
  CreateClientInput,
  CreateClientOutput,
  CreateClientSchema,
} from "../dtos";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database/index";
import { AlreadyExistsError } from "@src/errors/generic.errors";

type Input = CreateClientInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = CreateClientOutput;

export class CreateClientUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  constructor() {
    super();
  }

  protected validationRules(): ZodType<Input> {
    return CreateClientSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const existingClient = await prisma.client.findFirst({
      where: { name: input.name },
    });

    if (existingClient) {
      return wrong(new AlreadyExistsError("client", "name"));
    }

    const client = new Client(input);

    await prisma.client.create({ data: client.toPrisma() });

    return right(client.toOutput());
  }
}
