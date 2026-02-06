import { BaseBusinessError } from "./base-business.error";

export class UsernameOrPasswordWrongError extends BaseBusinessError {
  constructor() {
    super("Wrong username or password");
  }
}

export class InvalidRefreshTokenError extends BaseBusinessError {
  constructor() {
    super("Invalid refresh token");
  }
}
