jest.mock("@src/database/index", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { GetUserUseCase } from "./get-user.usecase";
import { GetUserInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";

type PrismaMock = {
  user: {
    findUnique: jest.Mock;
  };
};

describe("GetUserUseCase", () => {
  let usecase: GetUserUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new GetUserUseCase();
  });

  it("returns user mapped to domain output when found", async () => {
    const input: GetUserInput = { id: "13da8489-8f88-41e2-8348-8663daecf1fb" };

    const prismaUser = {
      id: "u1",
      name: "User 1",
      username: "user1",
      email: "u1@example.com",
      password: "secret",
      active: true,
      roleId: "r1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      role: {
        id: "r1",
        name: "Admin",
        description: null,
        createdAt: new Date("2023-12-01T00:00:00.000Z"),
        updatedAt: new Date("2023-12-02T00:00:00.000Z"),
      },
    };

    mockedPrisma.user.findUnique.mockResolvedValue(prismaUser);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    const value = result.value;
    expect(value).toEqual(
      expect.objectContaining({
        id: "u1",
        name: "User 1",
        username: "user1",
        role: "Admin",
      }),
    );
  });

  it("returns NotFoundError when user not found", async () => {
    const input: GetUserInput = { id: "13da8489-8f88-41e2-8348-8663daecf1fb" };

    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });

  it("returns validation error when input invalid", async () => {
    const invalidInput = { id: "not-uuid" } as unknown as GetUserInput;

    const result = await usecase.run(invalidInput);

    expect(result.isWrong()).toBe(true);
  });
});
