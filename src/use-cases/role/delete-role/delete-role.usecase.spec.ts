jest.mock("@src/database/index", () => ({
  prisma: {
    role: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { DeleteRoleUseCase } from "./delete-role.usecase";
import { DeleteRoleInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";

type PrismaMock = {
  role: {
    findUnique: jest.Mock;
    delete: jest.Mock;
  };
};

describe("DeleteRoleUseCase", () => {
  let usecase: DeleteRoleUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new DeleteRoleUseCase();
  });

  it("deletes role when exists", async () => {
    const input: DeleteRoleInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };
    mockedPrisma.role.findUnique.mockResolvedValue({
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    });
    mockedPrisma.role.delete.mockResolvedValue({
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    });

    const result = await usecase.run(input);
    expect(result.isRight()).toBe(true);
  });

  it("returns NotFoundError when not exists", async () => {
    const input: DeleteRoleInput = {
      id: "a3b0c6b7-1111-4444-8888-1234567890ab",
    };
    mockedPrisma.role.findUnique.mockResolvedValue(null);

    const result = await usecase.run(input);
    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
});
