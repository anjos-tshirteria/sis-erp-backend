import { AuthController } from "@src/controllers/auth/auth.controller";
import { Request, Response } from "express";
import { LoginUseCase } from "@src/use-cases/auth/login/login.usecase";
import { RefreshTokenUseCase } from "@src/use-cases/auth/refresh/refresh-token.usecase";
import { right, wrong } from "@src/util/either";
import { InputValidationError } from "@src/errors/input-validation.error";
import { ZodError } from "zod";
import {
  EmailOrPasswordWrongError,
  InvalidRefreshTokenError,
} from "@src/errors/auth.errors";

describe("AuthController", () => {
  let controller: AuthController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockAuthResponse = {
    accessToken: "access_token_123",
    refreshToken: "refresh_token_123",
  };

  const loginUseCase = {
    run: jest.fn().mockResolvedValue(right(mockAuthResponse)),
  } as unknown as LoginUseCase;
  const refreshTokenUseCase = {
    run: jest.fn(),
  } as unknown as RefreshTokenUseCase;

  beforeEach(() => {
    controller = new AuthController(loginUseCase, refreshTokenUseCase);

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ send: jsonMock });

    mockReq = {
      body: {
        email: "user@example.com",
        password: "Password123!",
      },
    };

    mockRes = {
      status: statusMock,
      send: jsonMock,
    };
  });

  describe("login", () => {
    it("should return 200 if login runs successfully", async () => {
      await controller.login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 400 if login fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (loginUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.login(mockReq as Request, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should return 401 if login fails with EmailOrPasswordWrongError", async () => {
      const error = new EmailOrPasswordWrongError();
      (loginUseCase.run as jest.Mock).mockResolvedValueOnce(wrong(error));

      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.login(mockReq as Request, res);

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe("refresh", () => {
    it("should return 200 if refresh token runs successfully", async () => {
      (refreshTokenUseCase.run as jest.Mock).mockResolvedValueOnce(
        right(mockAuthResponse),
      );

      const req = {
        body: { refreshToken: "refresh_token_123" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.refresh(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 400 if refresh token fails with InputValidationError", async () => {
      const error = new InputValidationError(new ZodError([]));
      (refreshTokenUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const req = {
        body: { refreshToken: "refresh_token_123" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.refresh(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should return 401 if refresh token fails with InvalidRefreshTokenError", async () => {
      const error = new InvalidRefreshTokenError();
      (refreshTokenUseCase.run as jest.Mock).mockResolvedValueOnce(
        wrong(error),
      );

      const req = {
        body: { refreshToken: "invalid_token" },
      } as unknown as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock, send: sendMock } as unknown as Response;

      await controller.refresh(req, res);

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });
});
