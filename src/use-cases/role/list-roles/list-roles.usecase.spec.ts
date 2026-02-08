jest.mock("@src/database/index", () => ({
  prisma: {
    role: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { ListRolesUseCase } from "./list-roles.usecase";
import { ListRolesInput, ListRolesOutput } from "../dtos";

type PrismaMock = {
  role: {
    findMany: jest.Mock;
    count: jest.Mock;
  };
};

describe("ListRolesUseCase", () => {
  let usecase: ListRolesUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new ListRolesUseCase();
  });

  it("returns paginated roles", async () => {
    const input: ListRolesInput = { page: 1, limit: 10 };

    const roles = [
      {
        id: "13da8489-8f88-41e2-8348-8663daecf1fb",
        name: "Admin",
        permissions: ["CREATE_USER"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockedPrisma.role.findMany.mockResolvedValue(roles);
    mockedPrisma.role.count.mockResolvedValue(1);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    const output = result.value as ListRolesOutput;
    expect(output.data).toHaveLength(1);
    expect(output.data[0]).toEqual(
      expect.objectContaining({
        id: "13da8489-8f88-41e2-8348-8663daecf1fb",
        name: "Admin",
      }),
    );
  });
});
