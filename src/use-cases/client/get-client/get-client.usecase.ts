import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { GetClientInput, GetClientOutput, GetClientSchema } from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { NotFoundError } from "@src/errors/generic.errors";
import { Client } from "@src/entities/client.entity";

type Input = GetClientInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = GetClientOutput;

export class GetClientUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  constructor() {
    super();
  }

  protected validationRules(): ZodType<Input> {
    return GetClientSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const client = await prisma.client.findUnique({
      where: { id: input.id },
    });

    if (!client) {
      return wrong(new NotFoundError("client", "id", input.id));
    }

    const domainClient = Client.fromPrisma(client);

    return right(domainClient.toOutput());
  }
}
