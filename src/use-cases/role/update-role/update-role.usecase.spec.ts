jest.mock("@src/database/index", () => ({
  prisma: {
    role: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { UpdateRoleUseCase } from "./update-role.usecase";
import { UpdateRoleInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";

type PrismaMock = {
  role: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

describe("UpdateRoleUseCase", () => {
  let usecase: UpdateRoleUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new UpdateRoleUseCase();
  });

  it("updates role when exists", async () => {
    const input: UpdateRoleInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
      name: "Updated",
    };

    const existing = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
      name: "Old",
      permissions: ["CREATE_USER"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = { ...existing, name: "Updated" };

    mockedPrisma.role.findUnique.mockResolvedValue(existing);
    mockedPrisma.role.update.mockResolvedValue(updated);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        id: "13da8489-8f88-41e2-8348-8663daecf1fb",
        name: "Updated",
      }),
    );
  });

  it("returns NotFoundError when not exists", async () => {
    const input: UpdateRoleInput = {
      id: "a3b0c6b7-1111-4444-8888-1234567890ab",
      name: "X",
    };
    mockedPrisma.role.findUnique.mockResolvedValue(null);

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });

  describe("input validation", () => {
    type InvalidCase = [string, UpdateRoleInput];

    it.each<InvalidCase>([
      ["invalid id", { id: "not-uuid" }],
      ["empty name", { id: "13da8489-8f88-41e2-8348-8663daecf1fb", name: "" }],
      [
        "invalid permission",
        {
          id: "13da8489-8f88-41e2-8348-8663daecf1fb",
          // eslint-disable-next-line
          permissions: ["INVALID"] as any,
        },
      ],
    ])("returns validation error when %s", async (_, invalidInput) => {
      const result = await usecase.run(invalidInput);

      expect(result.isWrong()).toBe(true);
      expect(mockedPrisma.role.findUnique).not.toHaveBeenCalled();
      expect(mockedPrisma.role.update).not.toHaveBeenCalled();
    });
  });

  it("updates only provided fields (partial update)", async () => {
    const input: UpdateRoleInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
      description: "New desc",
    };

    const existing = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
      name: "Old",
      permissions: ["CREATE_USER"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = { ...existing, description: "New desc" };

    mockedPrisma.role.findUnique.mockResolvedValue(existing);
    mockedPrisma.role.update.mockResolvedValue(updated);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(mockedPrisma.role.update).toHaveBeenCalledWith({
      where: { id: "13da8489-8f88-41e2-8348-8663daecf1fb" },
      data: { description: "New desc" },
    });
    expect(result.value).toEqual(
      expect.objectContaining({
        id: "13da8489-8f88-41e2-8348-8663daecf1fb",
        description: "New desc",
      }),
    );
  });

  it("updates permissions and name correctly", async () => {
    const input: UpdateRoleInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
      name: "NewName",
      permissions: ["MANAGE_USERS"],
    };

    const existing = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
      name: "Old",
      permissions: ["CREATE_USER"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = {
      ...existing,
      name: "NewName",
      permissions: ["MANAGE_USERS"],
    };

    mockedPrisma.role.findUnique.mockResolvedValue(existing);
    mockedPrisma.role.update.mockResolvedValue(updated);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(mockedPrisma.role.update).toHaveBeenCalledWith({
      where: { id: "13da8489-8f88-41e2-8348-8663daecf1fb" },
      data: { name: "NewName", permissions: ["MANAGE_USERS"] },
    });
    expect(result.value).toEqual(
      expect.objectContaining({
        id: "13da8489-8f88-41e2-8348-8663daecf1fb",
        name: "NewName",
        permissions: ["MANAGE_USERS"],
      }),
    );
  });
});
