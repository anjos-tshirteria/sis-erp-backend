import { BaseBusinessError } from "./base-business.error";

export class AlreadyExistsError extends BaseBusinessError {
  constructor(entity: string, field?: string) {
    const fieldInfo = field ? ` with this ${field}` : "";
    super(`A ${entity} already exists${fieldInfo}.`);
  }
}

export class NotFoundError extends BaseBusinessError {
  constructor(entity: string, field: string = "id", value: string) {
    super(`No ${entity} was found with ${field}: ${value}.`);
  }
}
