jest.mock("@src/util/jwt", () => ({
  __esModule: true,
  default: {
    verifyToken: jest.fn(),
    signToken: jest.fn(),
  },
}));

import JWT from "@src/util/jwt";
import { RefreshTokenUseCase } from "./refresh-token.usecase";
import { RefreshTokenUseCaseInput, TokensOutput } from "../dtos";
import { InvalidRefreshTokenError } from "@src/errors/auth.errors";
import { InputValidationError } from "@src/errors/input-validation.error";
import { TokenPayload } from "@src/middleware/auth.middleware";

type JWTMock = typeof JWT & {
  verifyToken: jest.Mock;
  signToken: jest.Mock;
};

describe("RefreshTokenUseCase", () => {
  let usecase: RefreshTokenUseCase;
  const mockedJWT = JWT as unknown as JWTMock;
  let input: RefreshTokenUseCaseInput;

  const mockTokenPayload: TokenPayload = {
    user: {
      id: "user-123",
      roleId: "role-456",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new RefreshTokenUseCase();
    input = {
      refreshToken: "valid_refresh_token_123",
    };
  });

  describe("Input Validation", () => {
    it("allows empty refreshToken (validation happens at JWT level)", async () => {
      mockedJWT.verifyToken.mockReturnValue(null);

      const result = await usecase.run({ refreshToken: "" });

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidRefreshTokenError);
      expect(mockedJWT.verifyToken).toHaveBeenCalledWith("");
    });

    it("returns InputValidationError when refreshToken is missing", async () => {
      const invalidInput = {} as RefreshTokenUseCaseInput;

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
      expect(mockedJWT.verifyToken).not.toHaveBeenCalled();
    });

    it("returns InputValidationError when refreshToken is not a string", async () => {
      const invalidInput = { refreshToken: 123 } as any;

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
      expect(mockedJWT.verifyToken).not.toHaveBeenCalled();
    });

    it("returns InputValidationError when refreshToken is null", async () => {
      const invalidInput = { refreshToken: null } as any;

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
    });

    it("returns InputValidationError when refreshToken is an object", async () => {
      const invalidInput = { refreshToken: { token: "test" } } as any;

      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
    });
  });

  describe("Token Verification", () => {
    it("returns InvalidRefreshTokenError when token verification fails", async () => {
      mockedJWT.verifyToken.mockReturnValue(null);

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidRefreshTokenError);
      expect(mockedJWT.verifyToken).toHaveBeenCalledWith(input.refreshToken);
      expect(mockedJWT.signToken).not.toHaveBeenCalled();
    });

    it("returns InvalidRefreshTokenError when token is malformed", async () => {
      mockedJWT.verifyToken.mockReturnValue(null);

      const malformedTokenInput = { refreshToken: "malformed.token.here" };
      const result = await usecase.run(malformedTokenInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidRefreshTokenError);
      expect(mockedJWT.verifyToken).toHaveBeenCalledWith(
        "malformed.token.here",
      );
    });

    it("returns InvalidRefreshTokenError when token is expired", async () => {
      mockedJWT.verifyToken.mockReturnValue(null);

      const expiredTokenInput = { refreshToken: "expired.token.signature" };
      const result = await usecase.run(expiredTokenInput);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidRefreshTokenError);
    });

    it("verifies token with correct parameter", async () => {
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_access_token");

      await usecase.run(input);

      expect(mockedJWT.verifyToken).toHaveBeenCalledWith(input.refreshToken);
      expect(mockedJWT.verifyToken).toHaveBeenCalledTimes(1);
    });

    it("does not sign new token when verification fails", async () => {
      mockedJWT.verifyToken.mockReturnValue(null);

      await usecase.run(input);

      expect(mockedJWT.signToken).not.toHaveBeenCalled();
    });
  });

  describe("Successful Token Refresh", () => {
    it("returns new access token on successful verification", async () => {
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_access_token_789");

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual({
        accessToken: "new_access_token_789",
        refreshToken: input.refreshToken,
      });
    });

    it("returns same refresh token in response", async () => {
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_access_token");

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect((result.value as TokensOutput).refreshToken).toBe(
        input.refreshToken,
      );
    });

    it("signs new access token with user data from verified token", async () => {
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_access_token");

      await usecase.run(input);

      expect(mockedJWT.signToken).toHaveBeenCalledWith({
        userId: mockTokenPayload.user.id,
        roleId: mockTokenPayload.user.roleId,
      });
    });

    it("generates exactly one new token on refresh", async () => {
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_token");

      await usecase.run(input);

      expect(mockedJWT.signToken).toHaveBeenCalledTimes(1);
    });

    it("extracts user info from verified token payload", async () => {
      const customPayload: TokenPayload = {
        user: {
          id: "custom-user-id",
          roleId: "custom-role-id",
        },
      };

      mockedJWT.verifyToken.mockReturnValue(customPayload);
      mockedJWT.signToken.mockReturnValue("custom_token");

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(mockedJWT.signToken).toHaveBeenCalledWith({
        userId: "custom-user-id",
        roleId: "custom-role-id",
      });
    });

    it("handles multiple successful refreshes with different tokens", async () => {
      const firstPayload: TokenPayload = {
        user: { id: "user-1", roleId: "role-1" },
      };

      mockedJWT.verifyToken.mockReturnValue(firstPayload);
      mockedJWT.signToken.mockReturnValue("access_token_1");

      const result1 = await usecase.run(input);
      expect(result1.isRight()).toBe(true);

      jest.clearAllMocks();

      const secondPayload: TokenPayload = {
        user: { id: "user-2", roleId: "role-2" },
      };

      mockedJWT.verifyToken.mockReturnValue(secondPayload);
      mockedJWT.signToken.mockReturnValue("access_token_2");

      const secondInput = { refreshToken: "different_token" };
      const result2 = await usecase.run(secondInput);

      expect(result2.isRight()).toBe(true);
      expect(mockedJWT.signToken).toHaveBeenCalledWith({
        userId: "user-2",
        roleId: "role-2",
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles token payload with extra properties", async () => {
      const payloadWithExtras = {
        ...mockTokenPayload,
        extra: "data",
        timestamp: Date.now(),
      } as TokenPayload & Record<string, any>;

      mockedJWT.verifyToken.mockReturnValue(payloadWithExtras);
      mockedJWT.signToken.mockReturnValue("new_token");

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(mockedJWT.signToken).toHaveBeenCalledWith({
        userId: mockTokenPayload.user.id,
        roleId: mockTokenPayload.user.roleId,
      });
    });

    it("handles very long refresh token", async () => {
      const longToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.".repeat(100);
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_access_token");

      const result = await usecase.run({ refreshToken: longToken });

      expect(result.isRight()).toBe(true);
      expect(mockedJWT.verifyToken).toHaveBeenCalledWith(longToken);
    });

    it("handles special characters in token", async () => {
      const specialToken = "token_with_special-chars!@#$%^&*()+=[]{}|;:,.<>?";
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_token");

      const result = await usecase.run({ refreshToken: specialToken });

      expect(result.isRight()).toBe(true);
      expect(mockedJWT.verifyToken).toHaveBeenCalledWith(specialToken);
    });

    it("returns error when JWT verification throws exception", async () => {
      mockedJWT.verifyToken.mockImplementation(() => {
        throw new Error("JWT library error");
      });

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
    });

    it("returns error when token signing throws exception", async () => {
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockImplementation(() => {
        throw new Error("Token signing failed");
      });

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
    });

    it("handles token payload with missing user property", async () => {
      const invalidPayload = {} as TokenPayload;

      mockedJWT.verifyToken.mockReturnValue(invalidPayload);

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
    });

    it("handles token payload with missing user.id", async () => {
      const invalidPayload = {
        user: {
          roleId: "role-456",
        },
      } as TokenPayload;

      mockedJWT.verifyToken.mockReturnValue(invalidPayload);

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
    });

    it("handles token payload with missing user.roleId", async () => {
      const invalidPayload = {
        user: {
          id: "user-123",
        },
      } as TokenPayload;

      mockedJWT.verifyToken.mockReturnValue(invalidPayload);

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
    });

    it("is case-sensitive for refresh token", async () => {
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_token");

      const input1 = { refreshToken: "TOKEN_ABC_XYZ" };
      const input2 = { refreshToken: "token_abc_xyz" };

      await usecase.run(input1);
      const firstCall = mockedJWT.verifyToken.mock.calls[0][0];

      jest.clearAllMocks();
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_token");

      await usecase.run(input2);
      const secondCall = mockedJWT.verifyToken.mock.calls[0][0];

      expect(firstCall).toBe("TOKEN_ABC_XYZ");
      expect(secondCall).toBe("token_abc_xyz");
      expect(firstCall).not.toBe(secondCall);
    });
  });

  describe("Return Value", () => {
    it("returns object with accessToken and refreshToken properties", async () => {
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_access_token");

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      const value = result.value as any;
      expect("accessToken" in value).toBe(true);
      expect("refreshToken" in value).toBe(true);
    });

    it("accessToken contains the newly signed token", async () => {
      const newAccessToken = "generated_access_token_12345";
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue(newAccessToken);

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      const value = result.value as any;
      expect(value.accessToken).toBe(newAccessToken);
    });

    it("refreshToken contains the original refresh token from input", async () => {
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_access_token");

      const originalToken = "original_refresh_token_xyz";
      const result = await usecase.run({ refreshToken: originalToken });

      expect(result.isRight()).toBe(true);
      const value = result.value as any;
      expect(value.refreshToken).toBe(originalToken);
    });

    it("does not modify the input refresh token", async () => {
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_access_token");

      const originalInput = { refreshToken: "untouched_token" };
      const result = await usecase.run(originalInput);

      expect(originalInput.refreshToken).toBe("untouched_token");
      const value = result.value as any;
      expect(value.refreshToken).toBe("untouched_token");
    });

    it("returns response that is not null or undefined", async () => {
      mockedJWT.verifyToken.mockReturnValue(mockTokenPayload);
      mockedJWT.signToken.mockReturnValue("new_access_token");

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value).not.toBeNull();
    });
  });

  describe("Integration Scenarios", () => {
    it("handles refresh token workflow: login -> refresh -> refresh again", async () => {
      const initialPayload: TokenPayload = {
        user: { id: "user-1", roleId: "role-1" },
      };

      mockedJWT.verifyToken.mockReturnValue(initialPayload);
      mockedJWT.signToken.mockReturnValue("access_token_1");

      const result1 = await usecase.run({
        refreshToken: "refresh_token_1",
      });

      expect(result1.isRight()).toBe(true);

      mockedJWT.verifyToken.mockReturnValue(initialPayload);
      mockedJWT.signToken.mockReturnValue("access_token_2");

      const result2 = await usecase.run({
        refreshToken: "refresh_token_1",
      });

      expect(result2.isRight()).toBe(true);
      const value2 = result2.value as any;
      expect(value2.refreshToken).toBe("refresh_token_1");
      expect(value2.accessToken).toBe("access_token_2");
    });

    it("preserves user identity across token refreshes", async () => {
      const userId = "preserved-user-id";
      const roleId = "preserved-role-id";

      const payload: TokenPayload = {
        user: { id: userId, roleId },
      };

      mockedJWT.verifyToken.mockReturnValue(payload);
      mockedJWT.signToken.mockReturnValue("new_token");

      await usecase.run(input);

      expect(mockedJWT.signToken).toHaveBeenCalledWith({
        userId,
        roleId,
      });
    });
  });
});
