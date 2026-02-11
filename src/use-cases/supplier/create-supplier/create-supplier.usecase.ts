import { AbstractUseCase } from "@src/core/use-case";
import { Either, right, wrong } from "@src/util/either";
import { Supplier } from "@src/entities/supplier.entity";
import { ZodType } from "zod";
import {
  CreateSupplierInput,
  CreateSupplierOutput,
  CreateSupplierSchema,
} from "../dtos";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database/index";
import { AlreadyExistsError } from "@src/errors/generic.errors";

type Input = CreateSupplierInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = CreateSupplierOutput;

export class CreateSupplierUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  constructor() {
    super();
  }

  protected validationRules(): ZodType<Input> {
    return CreateSupplierSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const existingSupplier = await prisma.supplier.findFirst({
      where: { name: input.name },
    });

    if (existingSupplier) {
      return wrong(new AlreadyExistsError("fornecedor", "name"));
    }

    const supplier = new Supplier(input);

    await prisma.supplier.create({ data: supplier.toPrisma() });

    return right(supplier.toOutput());
  }
}
