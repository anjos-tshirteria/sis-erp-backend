import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import {
  UpdateSupplierInput,
  UpdateSupplierOutput,
  UpdateSupplierSchema,
} from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { Supplier } from "@src/entities/supplier.entity";
import { NotFoundError } from "@src/errors/generic.errors";

type Input = UpdateSupplierInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = UpdateSupplierOutput;

export class UpdateSupplierUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  protected validationRules(): ZodType<Input> {
    return UpdateSupplierSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { id, ...data } = input;

    const existing = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existing) {
      return wrong(new NotFoundError("fornecedor", "id", id));
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data,
    });

    const domainSupplier = Supplier.fromPrisma(updated);

    return right(domainSupplier.toOutput());
  }
}
