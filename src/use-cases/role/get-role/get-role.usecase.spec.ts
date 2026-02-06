jest.mock("@src/database/index", () => ({
  prisma: {
    role: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { GetRoleUseCase } from "./get-role.usecase";
import { GetRoleInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";

type PrismaMock = {
  role: {
    findUnique: jest.Mock;
  };
};

describe("GetRoleUseCase", () => {
  let usecase: GetRoleUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new GetRoleUseCase();
  });

  it("returns role when found", async () => {
    const input: GetRoleInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    const role = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
      name: "Admin",
      description: null,
      permissions: ["CREATE_USER"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedPrisma.role.findUnique.mockResolvedValue(role);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        id: "13da8489-8f88-41e2-8348-8663daecf1fb",
        name: "Admin",
        permissions: ["CREATE_USER"],
      }),
    );
  });

  it("returns NotFoundError when not found", async () => {
    const input: GetRoleInput = {
      id: "a3b0c6b7-1111-4444-8888-1234567890ab",
    };
    mockedPrisma.role.findUnique.mockResolvedValue(null);

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
});
