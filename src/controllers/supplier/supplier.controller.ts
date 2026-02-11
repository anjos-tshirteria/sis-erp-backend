import { Request, Response } from "express";
import { AbstractController } from "@src/core/controller";
import { CreateSupplierUseCase } from "@src/use-cases/supplier/create-supplier/create-supplier.usecase";
import { DefaultFailOutput } from "@src/types/errors";
import {
  ListSuppliersInput,
  SupplierControllerOutput,
} from "@src/use-cases/supplier/dtos";
import { ListSuppliersUseCase } from "@src/use-cases/supplier/list-suppliers/list-suppliers.usecase";
import { GetSupplierUseCase } from "@src/use-cases/supplier/get-supplier/get-supplier.usecase";
import { UpdateSupplierUseCase } from "@src/use-cases/supplier/update-supplier/update-supplier.usecase";
import { DeleteSupplierUseCase } from "@src/use-cases/supplier/delete-supplier/delete-supplier.usecase";

type FailOutput = DefaultFailOutput;
type SuccessOutput = SupplierControllerOutput;

export class SupplierController extends AbstractController<
  FailOutput,
  SuccessOutput
> {
  constructor(
    private readonly createSupplierUseCase: CreateSupplierUseCase,
    private readonly listSuppliersUseCase: ListSuppliersUseCase,
    private readonly getSupplierUseCase: GetSupplierUseCase,
    private readonly updateSupplierUseCase: UpdateSupplierUseCase,
    private readonly deleteSupplierUseCase: DeleteSupplierUseCase,
  ) {
    super();
  }

  async create(req: Request, res: Response) {
    const result = await this.createSupplierUseCase.run(req.body);
    return result.isRight()
      ? this.created(req, res, result)
      : this.handleError(req, res, result);
  }

  async list(req: Request, res: Response) {
    const result = await this.listSuppliersUseCase.run(
      req.query as unknown as ListSuppliersInput,
    );
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async get(req: Request, res: Response) {
    const supplierId = req.params.id;
    const result = await this.getSupplierUseCase.run({
      id: supplierId as string,
    });
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async update(req: Request, res: Response) {
    const result = await this.updateSupplierUseCase.run({
      id: req.params.id as string,
      ...req.body,
    });
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async delete(req: Request, res: Response) {
    const result = await this.deleteSupplierUseCase.run({
      id: req.params.id as string,
    });
    return result.isRight()
      ? this.noContent(req, res, result)
      : this.handleError(req, res, result);
  }
}
