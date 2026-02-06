import { RoleController } from "@src/controllers/role/role.controller";
import { CreateRoleUseCase } from "@src/use-cases/role/create-role/create-role.usecase";
import { ListRolesUseCase } from "@src/use-cases/role/list-roles/list-roles.usecase";
import { GetRoleUseCase } from "@src/use-cases/role/get-role/get-role.usecase";
import { UpdateRoleUseCase } from "@src/use-cases/role/update-role/update-role.usecase";
import { DeleteRoleUseCase } from "@src/use-cases/role/delete-role/delete-role.usecase";

export function makeRoleController(): RoleController {
  const createRoleUseCase = new CreateRoleUseCase();
  const listRolesUseCase = new ListRolesUseCase();
  const getRoleUseCase = new GetRoleUseCase();
  const updateRoleUseCase = new UpdateRoleUseCase();
  const deleteRoleUseCase = new DeleteRoleUseCase();

  return new RoleController(
    createRoleUseCase,
    listRolesUseCase,
    getRoleUseCase,
    updateRoleUseCase,
    deleteRoleUseCase,
  );
}
