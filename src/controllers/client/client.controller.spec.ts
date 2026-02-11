import { ClientController } from "@src/controllers/client/client.controller";
import { Request, Response } from "express";
import { CreateClientUseCase } from "@src/use-cases/client/create-client/create-client.usecase";
import { ListClientsUseCase } from "@src/use-cases/client/list-clients/list-clients.usecase";
import { GetClientUseCase } from "@src/use-cases/client/get-client/get-client.usecase";
import { UpdateClientUseCase } from "@src/use-cases/client/update-client/update-client.usecase";
import { DeleteClientUseCase } from "@src/use-cases/client/delete-client/delete-client.usecase";
import { right, wrong } from "@src/util/either";
import { InputValidationError } from "@src/errors/input-validation.error";
import { ZodError } from "zod";
import { AlreadyExistsError, NotFoundError } from "@src/errors/generic.errors";

describe("ClientController", () => {
  let controller: ClientController;

  const mockClient = {
    id: "123",
    name: "Cliente A",
    email: "a@email.com",
    birthDate: new Date("1990-01-01"),
    phone: "(11) 99999-0000",
    notes: "Notas",
  };

  const createClientUseCase = {
    run: jest.fn().mockResolvedValue(right(mockClient)),
  } as unknown as CreateClientUseCase;
  const listClientsUseCase = {
    run: jest.fn(),
  } as unknown as ListClientsUseCase;
  const getClientUseCase = {
    run: jest.fn(),
  } as unknown as GetClientUseCase;
  const updateClientUseCase = {
    run: jest.fn(),
  } as unknown as UpdateClientUseCase;
  const deleteClientUseCase = {
    run: jest.fn(),
  } as unknown as DeleteClientUseCase;

  beforeEach(() => {
    controller = new ClientController(
      createClientUseCase,
      listClientsUseCase,
      getClientUseCase,
      updateClientUseCase,
      deleteClientUseCase,
    );
  });

  describe("create", () => {
    it("should return 201 if create client runs successfully", async () => {
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { body: mockClient } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(req, res);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith(mockClient);
    });

    it("should return 400 if create client fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (createClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { body: {} } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should return 409 if create client fails with AlreadyExistsError", async () => {
      const error = new AlreadyExistsError("cliente", "name");
      (createClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { body: mockClient } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(req, res);

      expect(statusMock).toHaveBeenCalledWith(409);
    });

    it("should pass req.body to create use case", async () => {
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const body = { name: "Novo Cliente", phone: "123" };
      const req = { body } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(req, res);

      expect(createClientUseCase.run).toHaveBeenCalledWith(body);
    });
  });

  describe("list", () => {
    it("should return 200 if list clients runs successfully", async () => {
      (listClientsUseCase.run as jest.Mock).mockResolvedValueOnce(
        right({ data: [mockClient], pagination: {} }),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { query: {} } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.list(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 400 if list clients fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (listClientsUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { query: {} } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.list(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should pass query params to list use case", async () => {
      (listClientsUseCase.run as jest.Mock).mockResolvedValueOnce(
        right({ data: [], pagination: {} }),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const query = { name: "ABC", page: "1" };
      const req = { query } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.list(req, res);

      expect(listClientsUseCase.run).toHaveBeenCalledWith(query);
    });
  });

  describe("get", () => {
    it("should return 200 if get client runs successfully", async () => {
      (getClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockClient),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 404 if get client fails with NotFoundError", async () => {
      const error = new NotFoundError("cliente", "id", "123");
      (getClientUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 400 if get client fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (getClientUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should pass params.id to get use case", async () => {
      (getClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockClient),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "abc-123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(getClientUseCase.run).toHaveBeenCalledWith({ id: "abc-123" });
    });
  });

  describe("update", () => {
    it("should return 200 if update client runs successfully", async () => {
      (updateClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockClient),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = {
        params: { id: "123" },
        body: { name: "Atualizado" },
      } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 404 if update client fails with NotFoundError", async () => {
      const error = new NotFoundError("cliente", "id", "123");
      (updateClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = {
        params: { id: "123" },
        body: { name: "Atualizado" },
      } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 400 if update client fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (updateClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = {
        params: { id: "123" },
        body: { name: "Atualizado" },
      } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should merge params.id with body and pass to update use case", async () => {
      (updateClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockClient),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = {
        params: { id: "abc-123" },
        body: { name: "Novo Nome", phone: "1234" },
      } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(updateClientUseCase.run).toHaveBeenCalledWith({
        id: "abc-123",
        name: "Novo Nome",
        phone: "1234",
      });
    });
  });

  describe("delete", () => {
    it("should return 204 if delete client runs successfully", async () => {
      (deleteClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(null),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(statusMock).toHaveBeenCalledWith(204);
    });

    it("should return 404 if delete client fails with NotFoundError", async () => {
      const error = new NotFoundError("cliente", "id", "123");
      (deleteClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 400 if delete client fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (deleteClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should pass params.id to delete use case", async () => {
      (deleteClientUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(null),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "abc-123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(deleteClientUseCase.run).toHaveBeenCalledWith({ id: "abc-123" });
    });
  });
});
