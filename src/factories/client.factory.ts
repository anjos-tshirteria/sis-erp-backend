import { ClientController } from "@src/controllers/client/client.controller";
import { CreateClientUseCase } from "@src/use-cases/client/create-client/create-client.usecase";
import { GetClientUseCase } from "@src/use-cases/client/get-client/get-client.usecase";
import { ListClientsUseCase } from "@src/use-cases/client/list-clients/list-clients.usecase";
import { UpdateClientUseCase } from "@src/use-cases/client/update-client/update-client.usecase";
import { DeleteClientUseCase } from "@src/use-cases/client/delete-client/delete-client.usecase";

export function makeClientController(): ClientController {
  const createClientUseCase = new CreateClientUseCase();
  const listClientsUseCase = new ListClientsUseCase();
  const getClientUseCase = new GetClientUseCase();
  const updateClientUseCase = new UpdateClientUseCase();
  const deleteClientUseCase = new DeleteClientUseCase();
  return new ClientController(
    createClientUseCase,
    listClientsUseCase,
    getClientUseCase,
    updateClientUseCase,
    deleteClientUseCase,
  );
}
