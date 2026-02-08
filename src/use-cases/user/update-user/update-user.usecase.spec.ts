jest.mock("@src/database/index", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { UpdateUserUseCase } from "./update-user.usecase";
import { UpdateUserInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";

type PrismaMock = {
  user: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

describe("UpdateUserUseCase", () => {
  let usecase: UpdateUserUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new UpdateUserUseCase();
  });

  it("updates and returns the user when found", async () => {
    const input: UpdateUserInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
      name: "Updated",
    };

    const existing = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
      name: "Old",
      username: "user1",
      email: "u1@example.com",
      password: "secret",
      active: true,
      roleId: "13da8489-8f88-41e2-8348-8663daecf1fb",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      role: {
        id: "13da8489-8f88-41e2-8348-8663daecf1fb",
        name: "Admin",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const updated = { ...existing, name: "Updated" };

    mockedPrisma.user.findUnique.mockResolvedValue(existing);
    mockedPrisma.user.update.mockResolvedValue(updated);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        id: "13da8489-8f88-41e2-8348-8663daecf1fb",
        name: "Updated",
        role: "Admin",
      }),
    );
  });

  it("returns NotFoundError when user does not exist", async () => {
    const input: UpdateUserInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
      name: "X",
    };

    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });

  it("returns validation error when input invalid", async () => {
    const invalidInput = { id: "not-uuid" };

    const result = await usecase.run(invalidInput);

    expect(result.isWrong()).toBe(true);
  });
});
