import { Request, Response } from "express";
import { AbstractController } from "@src/core/controller";
import { CreateRoleUseCase } from "@src/use-cases/role/create-role/create-role.usecase";
import { ListRolesInput, RoleControllerOutput } from "@src/use-cases/role/dtos";
import { ListRolesUseCase } from "@src/use-cases/role/list-roles/list-roles.usecase";
import { GetRoleUseCase } from "@src/use-cases/role/get-role/get-role.usecase";
import { UpdateRoleUseCase } from "@src/use-cases/role/update-role/update-role.usecase";
import { DeleteRoleUseCase } from "@src/use-cases/role/delete-role/delete-role.usecase";
import { DefaultFailOutput } from "@src/types/errors";

type FailOutput = DefaultFailOutput;
type SuccessOutput = RoleControllerOutput;

export class RoleController extends AbstractController<
  FailOutput,
  SuccessOutput
> {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {
    super();
  }

  async create(req: Request, res: Response) {
    const result = await this.createRoleUseCase.run(req.body);
    return result.isRight()
      ? this.created(req, res, result)
      : this.handleError(req, res, result);
  }

  async list(req: Request, res: Response) {
    const result = await this.listRolesUseCase.run(
      req.query as unknown as ListRolesInput,
    );
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async get(req: Request, res: Response) {
    const id = req.params.id as string;
    const result = await this.getRoleUseCase.run({ id });
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const payload = { id, ...req.body };
    const result = await this.updateRoleUseCase.run(payload);
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const result = await this.deleteRoleUseCase.run({ id });
    return result.isRight()
      ? this.noContent(req, res, result)
      : this.handleError(req, res, result);
  }
}
