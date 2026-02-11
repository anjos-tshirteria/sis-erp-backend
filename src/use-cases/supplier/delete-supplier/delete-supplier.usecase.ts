import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import {
  DeleteSupplierInput,
  DeleteSupplierOutput,
  DeleteSupplierSchema,
} from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { NotFoundError } from "@src/errors/generic.errors";

type Input = DeleteSupplierInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = DeleteSupplierOutput;

export class DeleteSupplierUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  protected validationRules(): ZodType<Input> {
    return DeleteSupplierSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { id } = input;

    const existing = await prisma.supplier.findUnique({ where: { id } });

    if (!existing) {
      return wrong(new NotFoundError("fornecedor", "id", id));
    }

    await prisma.supplier.delete({ where: { id } });

    return right(undefined);
  }
}
