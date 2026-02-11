import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import {
  UpdateClientInput,
  UpdateClientOutput,
  UpdateClientSchema,
} from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { Client } from "@src/entities/client.entity";
import { NotFoundError } from "@src/errors/generic.errors";

type Input = UpdateClientInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = UpdateClientOutput;

export class UpdateClientUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  protected validationRules(): ZodType<Input> {
    return UpdateClientSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { id, ...data } = input;

    const existing = await prisma.client.findUnique({
      where: { id },
    });

    if (!existing) {
      return wrong(new NotFoundError("client", "id", id));
    }

    const updated = await prisma.client.update({
      where: { id },
      data,
    });

    const domainClient = Client.fromPrisma(updated);

    return right(domainClient.toOutput());
  }
}
