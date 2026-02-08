jest.mock("@src/database/index", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { GetCurrentUserUseCase } from "./get-current-user.usecase";
import { GetCurrentUserInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";

type PrismaMock = {
  user: {
    findUnique: jest.Mock;
  };
};

describe("GetCurrentUserUseCase", () => {
  let usecase: GetCurrentUserUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  const prismaUser = {
    id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    name: "User 1",
    username: "user1",
    email: "u1@example.com",
    password: "hashed-secret",
    active: true,
    roleId: "r1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    role: {
      id: "r1",
      name: "Admin",
      description: "Administrador do sistema",
      permissions: ["MANAGE_USERS", "VIEW_REPORTS"],
      createdAt: new Date("2023-12-01T00:00:00.000Z"),
      updatedAt: new Date("2023-12-02T00:00:00.000Z"),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new GetCurrentUserUseCase();
  });

  it("returns current user with full role when found", async () => {
    const input: GetCurrentUserInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    mockedPrisma.user.findUnique.mockResolvedValue(prismaUser);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        id: prismaUser.id,
        name: "User 1",
        username: "user1",
        email: "u1@example.com",
        active: true,
        role: {
          id: "r1",
          name: "Admin",
          description: "Administrador do sistema",
          permissions: ["MANAGE_USERS", "VIEW_REPORTS"],
        },
      }),
    );
  });

  it("does not expose password in the output", async () => {
    const input: GetCurrentUserInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    mockedPrisma.user.findUnique.mockResolvedValue(prismaUser);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).not.toHaveProperty("password");
  });

  it("returns NotFoundError when user not found", async () => {
    const input: GetCurrentUserInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });

  it("returns validation error when input is invalid", async () => {
    const invalidInput = { id: "not-uuid" } as unknown as GetCurrentUserInput;

    const result = await usecase.run(invalidInput);

    expect(result.isWrong()).toBe(true);
  });

  it("queries prisma with the correct id and includes role", async () => {
    const input: GetCurrentUserInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    mockedPrisma.user.findUnique.mockResolvedValue(prismaUser);

    await usecase.run(input);

    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: input.id },
      include: { role: true },
    });
  });
});
