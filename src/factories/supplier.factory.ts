import { SupplierController } from "@src/controllers/supplier/supplier.controller";
import { CreateSupplierUseCase } from "@src/use-cases/supplier/create-supplier/create-supplier.usecase";
import { GetSupplierUseCase } from "@src/use-cases/supplier/get-supplier/get-supplier.usecase";
import { ListSuppliersUseCase } from "@src/use-cases/supplier/list-suppliers/list-suppliers.usecase";
import { UpdateSupplierUseCase } from "@src/use-cases/supplier/update-supplier/update-supplier.usecase";
import { DeleteSupplierUseCase } from "@src/use-cases/supplier/delete-supplier/delete-supplier.usecase";

export function makeSupplierController(): SupplierController {
  const createSupplierUseCase = new CreateSupplierUseCase();
  const listSuppliersUseCase = new ListSuppliersUseCase();
  const getSupplierUseCase = new GetSupplierUseCase();
  const updateSupplierUseCase = new UpdateSupplierUseCase();
  const deleteSupplierUseCase = new DeleteSupplierUseCase();
  return new SupplierController(
    createSupplierUseCase,
    listSuppliersUseCase,
    getSupplierUseCase,
    updateSupplierUseCase,
    deleteSupplierUseCase,
  );
}
