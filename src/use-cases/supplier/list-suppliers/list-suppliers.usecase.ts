import { AbstractUseCase } from "@src/core/use-case";
import { Either, right } from "@src/util/either";
import {
  ListSuppliersInput,
  ListSuppliersOutput,
  ListSuppliersSchema,
} from "../dtos";
import { ZodType } from "zod";
import { DefaultFailOutput } from "@src/types/errors";
import { prisma } from "@src/database";
import { paginate } from "@src/util/pagination";
import { Supplier } from "generated/prisma/client";
import { Supplier as SupplierEntity } from "@src/entities/supplier.entity";

type Input = ListSuppliersInput;
type FailOutput = DefaultFailOutput;
type SuccessOutput = ListSuppliersOutput;

export class ListSuppliersUseCase extends AbstractUseCase<
  Input,
  FailOutput,
  SuccessOutput
> {
  constructor() {
    super();
  }

  protected validationRules(): ZodType<Input> {
    return ListSuppliersSchema;
  }

  protected async execute(
    input: Input,
  ): Promise<Either<FailOutput, SuccessOutput>> {
    const { page, limit, ...filters } = input;

    const {
      data: suppliers,
      total,
      totalPages,
    } = await paginate<Supplier>(prisma.supplier, filters, page, limit);

    const domainSuppliers = suppliers.map((supplier) =>
      SupplierEntity.fromPrisma(supplier),
    );

    return right({
      data: domainSuppliers.map((s) => s.toOutput()),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }
}
