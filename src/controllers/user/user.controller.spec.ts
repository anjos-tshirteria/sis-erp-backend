import { UserController } from "@src/controllers/user/user.controller";
import { Request, Response } from "express";
import { CreateUserUseCase } from "@src/use-cases/user/create-user/create-user.usecase";
import { ListUsersUseCase } from "@src/use-cases/user/list-users/list-users.usecase";
import { GetUserUseCase } from "@src/use-cases/user/get-user/get-user.usecase";
import { UpdateUserUseCase } from "@src/use-cases/user/update-user/update-user.usecase";
import { DeleteUserUseCase } from "@src/use-cases/user/delete-user/delete-user.usecase";
import { right, wrong } from "@src/util/either";
import { InputValidationError } from "@src/errors/input-validation.error";
import { ZodError } from "zod";
import { AlreadyExistsError, NotFoundError } from "@src/errors/generic.errors";

describe("UserController", () => {
  let controller: UserController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockUser = {
    id: "123",
    name: "John Doe",
    email: "john@example.com",
  };

  const createUserUseCase = {
    run: jest.fn().mockResolvedValue(right(mockUser)),
  } as unknown as CreateUserUseCase;
  const listUsersUseCase = { run: jest.fn() } as unknown as ListUsersUseCase;
  const getUserUseCase = { run: jest.fn() } as unknown as GetUserUseCase;
  const updateUserUseCase = { run: jest.fn() } as unknown as UpdateUserUseCase;
  const deleteUserUseCase = { run: jest.fn() } as unknown as DeleteUserUseCase;

  beforeEach(() => {
    controller = new UserController(
      createUserUseCase,
      listUsersUseCase,
      getUserUseCase,
      updateUserUseCase,
      deleteUserUseCase,
    );

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ send: jsonMock });

    mockReq = {
      body: mockUser,
    };

    mockRes = {
      status: statusMock,
      send: jsonMock,
    };
  });

  describe("create", () => {
    it("should return 201 if create user runs successfully", async () => {
      await controller.create(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it("should return 400 if create user fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (createUserUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(mockReq as Request, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should return 409 if create user fails with AlreadyExistsError", async () => {
      const error = new AlreadyExistsError("user", "email");
      (createUserUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.create(mockReq as Request, res);

      expect(statusMock).toHaveBeenCalledWith(409);
    });
  });

  describe("list", () => {
    it("should return 200 if list users runs successfully", async () => {
      (listUsersUseCase.run as jest.Mock).mockResolvedValueOnce(
        right([mockUser]),
      );

      const req = { query: {} } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.list(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 400 if list users fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (listUsersUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = { query: {} } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.list(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe("get", () => {
    it("should return 200 if get user runs successfully", async () => {
      (getUserUseCase.run as jest.Mock).mockResolvedValueOnce(right(mockUser));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 404 if get user fails with NotFoundError", async () => {
      const error = new NotFoundError("user", "id", "123");
      (getUserUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 400 if get user fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (getUserUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe("update", () => {
    it("should return 200 if update user runs successfully", async () => {
      (updateUserUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockUser),
      );

      const req = {
        params: { id: "123" },
        body: { name: "Jane Doe" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 404 if update user fails with NotFoundError", async () => {
      const error = new NotFoundError("user", "id", "123");
      (updateUserUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = {
        params: { id: "123" },
        body: { name: "Jane Doe" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 400 if update user fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (updateUserUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = {
        params: { id: "123" },
        body: { name: "Jane Doe" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should return 409 if update user fails with AlreadyExistsError", async () => {
      const error = new AlreadyExistsError("user", "email");
      (updateUserUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = {
        params: { id: "123" },
        body: { name: "Jane Doe" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.update(req, res);

      expect(statusMock).toHaveBeenCalledWith(409);
    });
  });

  describe("delete", () => {
    it("should return 204 if delete user runs successfully", async () => {
      (deleteUserUseCase.run as jest.Mock).mockResolvedValueOnce(right(null));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(statusMock).toHaveBeenCalledWith(204);
    });

    it("should return 404 if delete user fails with NotFoundError", async () => {
      const error = new NotFoundError("user", "id", "123");
      (deleteUserUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 400 if delete user fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (deleteUserUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const req = { params: { id: "123" } } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.delete(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });
});
