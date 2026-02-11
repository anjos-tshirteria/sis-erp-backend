import { SupplierController } from "@src/controllers/supplier/supplier.controller";
import { Request, Response } from "express";
import { CreateSupplierUseCase } from "@src/use-cases/supplier/create-supplier/create-supplier.usecase";
import { ListSuppliersUseCase } from "@src/use-cases/supplier/list-suppliers/list-suppliers.usecase";
import { GetSupplierUseCase } from "@src/use-cases/supplier/get-supplier/get-supplier.usecase";
import { UpdateSupplierUseCase } from "@src/use-cases/supplier/update-supplier/update-supplier.usecase";
import { DeleteSupplierUseCase } from "@src/use-cases/supplier/delete-supplier/delete-supplier.usecase";
import { right, wrong } from "@src/util/either";
import { InputValidationError } from "@src/errors/input-validation.error";
import { ZodError } from "zod";
import { AlreadyExistsError, NotFoundError } from "@src/errors/generic.errors";

describe("SupplierController", () => {
  let controller: SupplierController;

  const mockSupplier = {
    id: "123",
    name: "Fornecedor A",
    phone: "(11) 99999-0000",
    notes: "Notas",
  };

  const createSupplierUseCase = {
    run: jest.fn().mockResolvedValue(right(mockSupplier)),
  } as unknown as CreateSupplierUseCase;
  const listSuppliersUseCase = {
    run: jest.fn(),
  } as unknown as ListSuppliersUseCase;
  const getSupplierUseCase = {
    run: jest.fn(),
  } as unknown as GetSupplierUseCase;
  const updateSupplierUseCase = {
    run: jest.fn(),
  } as unknown as UpdateSupplierUseCase;
  const deleteSupplierUseCase = {
    run: jest.fn(),
  } as unknown as DeleteSupplierUseCase;

  beforeEach(() => {
    controller = new SupplierController(
      createSupplierUseCase,
      listSuppliersUseCase,
      getSupplierUseCase,
      updateSupplierUseCase,
      deleteSupplierUseCase,
    );
  });

  describe("create", () => {
    it("should return 201 if create supplier runs successfully", async () => {
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { body: mockSupplier } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(req, res);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith(mockSupplier);
    });

    it("should return 400 if create supplier fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (createSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { body: {} } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should return 409 if create supplier fails with AlreadyExistsError", async () => {
      const error = new AlreadyExistsError("fornecedor", "name");
      (createSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { body: mockSupplier } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(req, res);

      expect(statusMock).toHaveBeenCalledWith(409);
    });

    it("should pass req.body to create use case", async () => {
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const body = { name: "Novo Fornecedor", phone: "123" };
      const req = { body } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(req, res);

      expect(createSupplierUseCase.run).toHaveBeenCalledWith(body);
    });
  });

  describe("list", () => {
    it("should return 200 if list suppliers runs successfully", async () => {
      (listSuppliersUseCase.run as jest.Mock).mockResolvedValueOnce(
        right({ data: [mockSupplier], pagination: {} }),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { query: {} } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.list(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 400 if list suppliers fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (listSuppliersUseCase.run as jest.Mock).mockResolvedValueOnce(
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
      (listSuppliersUseCase.run as jest.Mock).mockResolvedValueOnce(
        right({ data: [], pagination: {} }),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const query = { name: "ABC", page: "1" };
      const req = { query } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.list(req, res);

      expect(listSuppliersUseCase.run).toHaveBeenCalledWith(query);
    });
  });

  describe("get", () => {
    it("should return 200 if get supplier runs successfully", async () => {
      (getSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockSupplier),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 404 if get supplier fails with NotFoundError", async () => {
      const error = new NotFoundError("fornecedor", "id", "123");
      (getSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 400 if get supplier fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (getSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should pass params.id to get use case", async () => {
      (getSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockSupplier),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "abc-123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(getSupplierUseCase.run).toHaveBeenCalledWith({ id: "abc-123" });
    });
  });

  describe("update", () => {
    it("should return 200 if update supplier runs successfully", async () => {
      (updateSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockSupplier),
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

    it("should return 404 if update supplier fails with NotFoundError", async () => {
      const error = new NotFoundError("fornecedor", "id", "123");
      (updateSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
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

    it("should return 400 if update supplier fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (updateSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
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
      (updateSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockSupplier),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = {
        params: { id: "abc-123" },
        body: { name: "Novo Nome", phone: "1234" },
      } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(updateSupplierUseCase.run).toHaveBeenCalledWith({
        id: "abc-123",
        name: "Novo Nome",
        phone: "1234",
      });
    });
  });

  describe("delete", () => {
    it("should return 204 if delete supplier runs successfully", async () => {
      (deleteSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(null),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(statusMock).toHaveBeenCalledWith(204);
    });

    it("should return 404 if delete supplier fails with NotFoundError", async () => {
      const error = new NotFoundError("fornecedor", "id", "123");
      (deleteSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 400 if delete supplier fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (deleteSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
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
      (deleteSupplierUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(null),
      );

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const req = { params: { id: "abc-123" } } as unknown as Request;
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(deleteSupplierUseCase.run).toHaveBeenCalledWith({ id: "abc-123" });
    });
  });
});
