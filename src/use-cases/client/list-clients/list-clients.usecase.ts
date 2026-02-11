import { AbstractUseCase } from "@src/core/use-case";
import { Either, right } from "@src/util/either";
import {
  ListClientsInput,
  ListClientsOutput,
  ListClientsSchema,
} from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { paginate } from "@src/util/pagination";
import { Client } from "generated/prisma/client";
import { Client as ClientEntity } from "@src/entities/client.entity";

type Input = ListClientsInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = ListClientsOutput;

export class ListClientsUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  constructor() {
    super();
  }

  protected validationRules(): ZodType<Input> {
    return ListClientsSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { page, limit, ...filters } = input;

    const {
      data: clients,
      total,
      totalPages,
    } = await paginate<Client>(prisma.client, filters, page, limit);

    const domainClients = clients.map((client) =>
      ClientEntity.fromPrisma(client),
    );

    return right({
      data: domainClients.map((c) => c.toOutput()),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }
}
