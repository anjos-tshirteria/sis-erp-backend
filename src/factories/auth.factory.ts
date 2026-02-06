import { AuthController } from "@src/controllers/auth/auth.controller";
import { LoginUseCase } from "@src/use-cases/auth/login/login.usecase";
import { RefreshTokenUseCase } from "@src/use-cases/auth/refresh/refresh-token.usecase";

export function makeAuthController(): AuthController {
  const loginUseCase = new LoginUseCase();
  const refreshTokenUseCase = new RefreshTokenUseCase();

  return new AuthController(loginUseCase, refreshTokenUseCase);
}
