import { RoleController } from "@src/controllers/role/role.controller";
import { Request, Response } from "express";
import { CreateRoleUseCase } from "@src/use-cases/role/create-role/create-role.usecase";
import { ListRolesUseCase } from "@src/use-cases/role/list-roles/list-roles.usecase";
import { GetRoleUseCase } from "@src/use-cases/role/get-role/get-role.usecase";
import { UpdateRoleUseCase } from "@src/use-cases/role/update-role/update-role.usecase";
import { DeleteRoleUseCase } from "@src/use-cases/role/delete-role/delete-role.usecase";
import { right, wrong } from "@src/util/either";
import { InputValidationError } from "@src/errors/input-validation.error";
import { ZodError } from "zod";
import { AlreadyExistsError, NotFoundError } from "@src/errors/generic.errors";

describe("RoleController", () => {
  let controller: RoleController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockRole = {
    id: "123",
    name: "Admin",
    description: "Administrator role",
  };

  const createRoleUseCase = {
    run: jest.fn().mockResolvedValue(right(mockRole)),
  } as unknown as CreateRoleUseCase;
  const listRolesUseCase = { run: jest.fn() } as unknown as ListRolesUseCase;
  const getRoleUseCase = { run: jest.fn() } as unknown as GetRoleUseCase;
  const updateRoleUseCase = { run: jest.fn() } as unknown as UpdateRoleUseCase;
  const deleteRoleUseCase = { run: jest.fn() } as unknown as DeleteRoleUseCase;

  beforeEach(() => {
    controller = new RoleController(
      createRoleUseCase,
      listRolesUseCase,
      getRoleUseCase,
      updateRoleUseCase,
      deleteRoleUseCase,
    );

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ send: jsonMock });

    mockReq = {
      body: mockRole,
    };

    mockRes = {
      status: statusMock,
      send: jsonMock,
    };
  });

  describe("create", () => {
    it("should return 201 if create role runs successfully", async () => {
      await controller.create(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it("should return 400 if create role fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (createRoleUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(mockReq as Request, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should return 409 if create role fails with AlreadyExistsError", async () => {
      const error = new AlreadyExistsError("role", "name");
      (createRoleUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(mockReq as Request, res);

      expect(statusMock).toHaveBeenCalledWith(409);
    });
  });

  describe("list", () => {
    it("should return 200 if list roles runs successfully", async () => {
      (listRolesUseCase.run as jest.Mock).mockResolvedValueOnce(
        right([mockRole]),
      );

      const req = { query: {} } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.list(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 400 if list roles fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (listRolesUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = { query: {} } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.list(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe("get", () => {
    it("should return 200 if get role runs successfully", async () => {
      (getRoleUseCase.run as jest.Mock).mockResolvedValueOnce(right(mockRole));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 404 if get role fails with NotFoundError", async () => {
      const error = new NotFoundError("role", "id", "123");
      (getRoleUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 400 if get role fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (getRoleUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe("update", () => {
    it("should return 200 if update role runs successfully", async () => {
      (updateRoleUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockRole),
      );

      const req = {
        params: { id: "123" },
        body: { name: "Super Admin" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 404 if update role fails with NotFoundError", async () => {
      const error = new NotFoundError("role", "id", "123");
      (updateRoleUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = {
        params: { id: "123" },
        body: { name: "Super Admin" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 400 if update role fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (updateRoleUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = {
        params: { id: "123" },
        body: { name: "Super Admin" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should return 409 if update role fails with AlreadyExistsError", async () => {
      const error = new AlreadyExistsError("role", "name");
      (updateRoleUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = {
        params: { id: "123" },
        body: { name: "Super Admin" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(statusMock).toHaveBeenCalledWith(409);
    });
  });

  describe("delete", () => {
    it("should return 204 if delete role runs successfully", async () => {
      (deleteRoleUseCase.run as jest.Mock).mockResolvedValueOnce(right(null));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(statusMock).toHaveBeenCalledWith(204);
    });

    it("should return 404 if delete role fails with NotFoundError", async () => {
      const error = new NotFoundError("role", "id", "123");
      (deleteRoleUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 400 if delete role fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (deleteRoleUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });
});
