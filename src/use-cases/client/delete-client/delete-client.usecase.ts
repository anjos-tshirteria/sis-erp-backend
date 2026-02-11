import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import {
  DeleteClientInput,
  DeleteClientOutput,
  DeleteClientSchema,
} from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { NotFoundError } from "@src/errors/generic.errors";

type Input = DeleteClientInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = DeleteClientOutput;

export class DeleteClientUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  protected validationRules(): ZodType<Input> {
    return DeleteClientSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { id } = input;

    const existing = await prisma.client.findUnique({ where: { id } });

    if (!existing) {
      return wrong(new NotFoundError("client", "id", id));
    }

    await prisma.client.delete({ where: { id } });

    return right(undefined);
  }
}
