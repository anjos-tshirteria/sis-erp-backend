jest.mock("@src/database/index", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { DeleteUserUseCase } from "./delete-user.usecase";
import { DeleteUserInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";

type PrismaMock = {
  user: {
    findUnique: jest.Mock;
    delete: jest.Mock;
  };
};

describe("DeleteUserUseCase", () => {
  let usecase: DeleteUserUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new DeleteUserUseCase();
  });

  it("deletes user when exists and returns success", async () => {
    const input: DeleteUserInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    const existing = { id: "13da8489-8f88-41e2-8348-8663daecf1fb" };

    mockedPrisma.user.findUnique.mockResolvedValue(existing);
    mockedPrisma.user.delete.mockResolvedValue(existing);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
  });

  it("returns NotFoundError when user does not exist", async () => {
    const input: DeleteUserInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });

  it("returns validation error when input invalid", async () => {
    const invalidInput = { id: "not-uuid" } as unknown as DeleteUserInput;

    const result = await usecase.run(invalidInput);

    expect(result.isWrong()).toBe(true);
  });
});
