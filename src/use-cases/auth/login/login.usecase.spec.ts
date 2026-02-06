jest.mock("@src/database/index", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("@src/util/password", () => ({
  __esModule: true,
  default: {
    comparePasswords: jest.fn(),
    checkPasswordRules: jest.fn(),
  },
}));

jest.mock("@src/util/jwt", () => ({
  __esModule: true,
  default: {
    signToken: jest.fn(),
  },
}));

import { prisma } from "@src/database/index";
import PasswordUtil from "@src/util/password";
import JWT from "@src/util/jwt";
import { LoginUseCase } from "./login.usecase";
import { LoginUseCaseInput } from "../dtos";
import { EmailOrPasswordWrongError } from "@src/errors/auth.errors";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  user: {
    findFirst: jest.Mock;
  };
};

type PasswordUtilMock = typeof PasswordUtil & {
  comparePasswords: jest.Mock;
  checkPasswordRules: jest.Mock;
};

type JWTMock = typeof JWT & {
  signToken: jest.Mock;
};

describe("LoginUseCase", () => {
  let usecase: LoginUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;
  const mockedPasswordUtil = PasswordUtil as unknown as PasswordUtilMock;
  const mockedJWT = JWT as unknown as JWTMock;
  let input: LoginUseCaseInput;

  const mockUser = {
    id: "user-123",
    email: "user@example.com",
    password: "hashed_password_here",
    roleId: "role-456",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new LoginUseCase();
    input = {
      username: "user@example.com",
      password: "SecurePassword123!",
    };

    mockedPasswordUtil.checkPasswordRules.mockImplementation(
      (password: string) => {
        if (!password || password.length < 8) {
          return "Password must have at least 8 characters";
        }
        if (!/[A-Z]/.test(password)) {
          return "Password must contain at least one uppercase letter";
        }
        if (!/[0-9]/.test(password)) {
          return "Password must contain at least one number";
        }
        if (!/[!@#$%&*+=~^_-]/.test(password)) {
          return "Password must contain at least one special character";
        }
        return undefined;
      },
    );
  });

  describe("Input Validation", () => {
    it("allows empty username (validation happens at database level)", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(null);
      const invalidInput = { ...input, username: "" };

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(EmailOrPasswordWrongError);
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: "" },
      });
    });

    it("returns InputValidationError when username is missing", async () => {
      const invalidInput = { ...input };
      delete (invalidInput as any).username;

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
      expect(mockedPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("returns InputValidationError when password is empty", async () => {
      const invalidInput = { ...input, password: "" };

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
      expect(mockedPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("returns InputValidationError when password is too short", async () => {
      const invalidInput = { ...input, password: "short" };

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
      expect(mockedPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("returns InputValidationError when password lacks uppercase letter", async () => {
      const invalidInput = { ...input, password: "securepassword123!" };

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
    });

    it("returns InputValidationError when password lacks number", async () => {
      const invalidInput = { ...input, password: "SecurePassword!" };

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
    });

    it("returns InputValidationError when password lacks special character", async () => {
      const invalidInput = { ...input, password: "SecurePassword123" };

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
    });

    it("returns InputValidationError when password is missing", async () => {
      const invalidInput = { ...input };
      delete (invalidInput as any).password;

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
      expect(mockedPrisma.user.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("User Not Found", () => {
    it("returns EmailOrPasswordWrongError when user does not exist", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(null);

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(EmailOrPasswordWrongError);
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: input.username },
      });
      expect(mockedPasswordUtil.comparePasswords).not.toHaveBeenCalled();
      expect(mockedJWT.signToken).not.toHaveBeenCalled();
    });

    it("does not call password comparison when user is not found", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(null);

      await usecase.run(input);

      expect(mockedPasswordUtil.comparePasswords).not.toHaveBeenCalled();
    });
  });

  describe("Password Validation", () => {
    it("returns EmailOrPasswordWrongError when password is incorrect", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(false);

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(EmailOrPasswordWrongError);
      expect(mockedPasswordUtil.comparePasswords).toHaveBeenCalledWith(
        input.password,
        mockUser.password,
      );
      expect(mockedJWT.signToken).not.toHaveBeenCalled();
    });

    it("does not generate tokens when password is incorrect", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(false);

      await usecase.run(input);

      expect(mockedJWT.signToken).not.toHaveBeenCalled();
    });
  });

  describe("Successful Login", () => {
    it("returns access and refresh tokens on successful login", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken
        .mockReturnValueOnce("access_token_123")
        .mockReturnValueOnce("refresh_token_456");

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual({
        accessToken: "access_token_123",
        refreshToken: "refresh_token_456",
      });
    });

    it("signs access token with correct parameters", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken
        .mockReturnValueOnce("access_token_123")
        .mockReturnValueOnce("refresh_token_456");

      await usecase.run(input);

      expect(mockedJWT.signToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        roleId: mockUser.roleId,
      });
    });

    it("signs refresh token with refresh flag set to true", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken
        .mockReturnValueOnce("access_token_123")
        .mockReturnValueOnce("refresh_token_456");

      await usecase.run(input);

      const calls = mockedJWT.signToken.mock.calls;
      expect(calls).toHaveLength(2);
      expect(calls[0][0]).toEqual({
        userId: mockUser.id,
        roleId: mockUser.roleId,
      });
      expect(calls[1][0]).toEqual({
        userId: mockUser.id,
        roleId: mockUser.roleId,
        refresh: true,
      });
    });

    it("calls prisma with correct email filter", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken
        .mockReturnValueOnce("access_token_123")
        .mockReturnValueOnce("refresh_token_456");

      await usecase.run(input);

      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: input.username },
      });
    });

    it("compares plain password with hashed password from database", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken
        .mockReturnValueOnce("access_token_123")
        .mockReturnValueOnce("refresh_token_456");

      await usecase.run(input);

      expect(mockedPasswordUtil.comparePasswords).toHaveBeenCalledWith(
        input.password,
        mockUser.password,
      );
    });

    it("successfully logs in user with valid credentials", async () => {
      const customUser = {
        ...mockUser,
        id: "user-789",
        roleId: "admin-role",
      };

      mockedPrisma.user.findFirst.mockResolvedValue(customUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken
        .mockReturnValueOnce("custom_access_token")
        .mockReturnValueOnce("custom_refresh_token");

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual({
        accessToken: "custom_access_token",
        refreshToken: "custom_refresh_token",
      });
      expect(mockedJWT.signToken).toHaveBeenCalledWith({
        userId: "user-789",
        roleId: "admin-role",
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles user with special characters in email", async () => {
      const specialEmailInput = {
        ...input,
        username: "user+test@example.co.uk",
      };
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken
        .mockReturnValueOnce("access_token_123")
        .mockReturnValueOnce("refresh_token_456");

      const result = await usecase.run(specialEmailInput);

      expect(result.isRight()).toBe(true);
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: "user+test@example.co.uk" },
      });
    });

    it("returns error when database query fails", async () => {
      mockedPrisma.user.findFirst.mockRejectedValue(
        new Error("Database connection error"),
      );

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(Error);
    });

    it("returns error when password comparison fails", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockRejectedValue(
        new Error("Bcrypt error"),
      );

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
    });

    it("returns error when token signing fails", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken.mockImplementation(() => {
        throw new Error("JWT signing failed");
      });

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
    });

    it("handles very long password", async () => {
      const longPassword = "S" + "a".repeat(250) + "1!";
      const longPasswordInput = { ...input, password: longPassword };

      const result = await usecase.run(longPasswordInput);

      expect(result.isWrong()).toBe(true);
    });

    it("is case-sensitive for email lookup", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken
        .mockReturnValueOnce("access_token_123")
        .mockReturnValueOnce("refresh_token_456");

      const uppercaseInput = { ...input, username: "USER@EXAMPLE.COM" };
      await usecase.run(uppercaseInput);

      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: "USER@EXAMPLE.COM" },
      });
    });
  });

  describe("Token Generation", () => {
    it("generates exactly two tokens", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken
        .mockReturnValueOnce("access_token")
        .mockReturnValueOnce("refresh_token");

      await usecase.run(input);

      expect(mockedJWT.signToken).toHaveBeenCalledTimes(2);
    });

    it("generates different tokens for access and refresh", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken
        .mockReturnValueOnce("unique_access_token_xyz")
        .mockReturnValueOnce("unique_refresh_token_abc");

      const result = await usecase.run(input);

      expect(result.value).toEqual({
        accessToken: "unique_access_token_xyz",
        refreshToken: "unique_refresh_token_abc",
      });
      const value = result.value as any;
      expect(value.accessToken).not.toBe(value.refreshToken);
    });

    it("uses correct user data for token generation", async () => {
      const testUser = {
        ...mockUser,
        id: "specific-user-id",
        roleId: "specific-role-id",
      };
      mockedPrisma.user.findFirst.mockResolvedValue(testUser);
      mockedPasswordUtil.comparePasswords.mockResolvedValue(true);
      mockedJWT.signToken
        .mockReturnValueOnce("access")
        .mockReturnValueOnce("refresh");

      await usecase.run(input);

      expect(mockedJWT.signToken).toHaveBeenNthCalledWith(1, {
        userId: "specific-user-id",
        roleId: "specific-role-id",
      });
      expect(mockedJWT.signToken).toHaveBeenNthCalledWith(2, {
        userId: "specific-user-id",
        roleId: "specific-role-id",
        refresh: true,
      });
    });
  });
});
