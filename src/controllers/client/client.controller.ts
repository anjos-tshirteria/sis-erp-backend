import { Request, Response } from "express";
import { AbstractController } from "@src/core/controller";
import { CreateClientUseCase } from "@src/use-cases/client/create-client/create-client.usecase";
import { DefaultFailOutput } from "@src/types/errors";
import {
  ListClientsInput,
  ClientControllerOutput,
} from "@src/use-cases/client/dtos";
import { ListClientsUseCase } from "@src/use-cases/client/list-clients/list-clients.usecase";
import { GetClientUseCase } from "@src/use-cases/client/get-client/get-client.usecase";
import { UpdateClientUseCase } from "@src/use-cases/client/update-client/update-client.usecase";
import { DeleteClientUseCase } from "@src/use-cases/client/delete-client/delete-client.usecase";

type FailOutput = DefaultFailOutput;
type SuccessOutput = ClientControllerOutput;

export class ClientController extends AbstractController<
  FailOutput,
  SuccessOutput
> {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly listClientsUseCase: ListClientsUseCase,
    private readonly getClientUseCase: GetClientUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly deleteClientUseCase: DeleteClientUseCase,
  ) {
    super();
  }

  async create(req: Request, res: Response) {
    const result = await this.createClientUseCase.run(req.body);
    return result.isRight()
      ? this.created(req, res, result)
      : this.handleError(req, res, result);
  }

  async list(req: Request, res: Response) {
    const result = await this.listClientsUseCase.run(
      req.query as unknown as ListClientsInput,
    );
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async get(req: Request, res: Response) {
    const clientId = req.params.id;
    const result = await this.getClientUseCase.run({
      id: clientId as string,
    });
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async update(req: Request, res: Response) {
    const result = await this.updateClientUseCase.run({
      id: req.params.id as string,
      ...req.body,
    });
    return result.isRight()
      ? this.ok(req, res, result)
      : this.handleError(req, res, result);
  }

  async delete(req: Request, res: Response) {
    const result = await this.deleteClientUseCase.run({
      id: req.params.id as string,
    });
    return result.isRight()
      ? this.noContent(req, res, result)
      : this.handleError(req, res, result);
  }
}
