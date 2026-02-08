import { MeController } from "@src/controllers/me/me.controller";
import { GetCurrentUserUseCase } from "@src/use-cases/me/get-current-user/get-current-user.usecase";

export function makeMeController(): MeController {
  const getCurrentUserUseCase = new GetCurrentUserUseCase();
  return new MeController(getCurrentUserUseCase);
}
