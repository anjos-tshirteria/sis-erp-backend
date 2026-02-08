import { MeController } from "@src/controllers/me/me.controller";
import { Request, Response } from "express";
import { GetCurrentUserUseCase } from "@src/use-cases/me/get-current-user/get-current-user.usecase";
import { right, wrong } from "@src/util/either";
import { NotFoundError } from "@src/errors/generic.errors";

describe("MeController", () => {
  let controller: MeController;

  const mockCurrentUser = {
    id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    name: "User 1",
    username: "user1",
    email: "u1@example.com",
    active: true,
    role: {
      id: "r1",
      name: "Admin",
      description: "Administrador do sistema",
      permissions: ["MANAGE_USERS", "VIEW_REPORTS"],
    },
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  };

  const getCurrentUserUseCase = {
    run: jest.fn(),
  } as unknown as GetCurrentUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new MeController(getCurrentUserUseCase);
  });

  describe("get", () => {
    it("should return 200 with current user data", async () => {
      (getCurrentUserUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockCurrentUser),
      );

      const req = {
        user: { id: "13da8489-8f88-41e2-8348-8663daecf1fb", roleId: "r1" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith(mockCurrentUser);
    });

    it("should call use case with user id from JWT token", async () => {
      (getCurrentUserUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockCurrentUser),
      );

      const req = {
        user: { id: "13da8489-8f88-41e2-8348-8663daecf1fb", roleId: "r1" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(getCurrentUserUseCase.run).toHaveBeenCalledWith({
        id: "13da8489-8f88-41e2-8348-8663daecf1fb",
      });
    });

    it("should return 404 if user not found", async () => {
      const error = new NotFoundError("usuário", "id", "123");
      (getCurrentUserUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const req = {
        user: { id: "123", roleId: "r1" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.get(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
    });
  });
});
