import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import {
  GetSupplierInput,
  GetSupplierOutput,
  GetSupplierSchema,
} from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { NotFoundError } from "@src/errors/generic.errors";
import { Supplier } from "@src/entities/supplier.entity";

type Input = GetSupplierInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = GetSupplierOutput;

export class GetSupplierUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  constructor() {
    super();
  }

  protected validationRules(): ZodType<Input> {
    return GetSupplierSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const supplier = await prisma.supplier.findUnique({
      where: { id: input.id },
    });

    if (!supplier) {
      return wrong(new NotFoundError("fornecedor", "id", input.id));
    }

    const domainSupplier = Supplier.fromPrisma(supplier);

    return right(domainSupplier.toOutput());
  }
}
