import { BaseBusinessError } from "@src/errors/base-business.error";
import { UnknownError } from "@src/errors/unknown.error";

export type DefaultFailOutput = BaseBusinessError | UnknownError;
