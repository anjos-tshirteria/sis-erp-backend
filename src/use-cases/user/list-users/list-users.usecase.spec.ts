jest.mock("@src/database/index", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { ListUsersUseCase } from "./list-users.usecase";
import { ListUsersInput, ListUsersOutput } from "../dtos";

type PrismaMock = {
  user: {
    findMany: jest.Mock;
    count: jest.Mock;
  };
  role: {
    findFirst: jest.Mock;
  };
};

describe("ListUsersUseCase", () => {
  let usecase: ListUsersUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new ListUsersUseCase();
  });

  it("returns paginated users mapped to domain output", async () => {
    const input: ListUsersInput = { page: 1, limit: 10 };

    const prismaUsers = [
      {
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
      },
    ];

    mockedPrisma.user.findMany.mockResolvedValue(prismaUsers);
    mockedPrisma.user.count.mockResolvedValue(1);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    const value = result.value as ListUsersOutput;
    expect(value).toHaveProperty("data");
    expect(value).toHaveProperty("pagination");
    expect(value.data).toHaveLength(1);
    expect(value.data[0]).toEqual(
      expect.objectContaining({
        id: "u1",
        name: "User 1",
        username: "user1",
        role: "Admin",
      }),
    );
    expect(value.pagination).toEqual(
      expect.objectContaining({ page: 1, limit: 10, total: 1 }),
    );
  });

  it("applies filters to prisma queries", async () => {
    const input: ListUsersInput = { page: 1, limit: 5, name: "john" };

    mockedPrisma.user.findMany.mockResolvedValue([]);
    mockedPrisma.user.count.mockResolvedValue(0);

    await usecase.run(input);

    expect(mockedPrisma.user.findMany).toHaveBeenCalled();
    expect(mockedPrisma.user.count).toHaveBeenCalledWith({
      where: { name: "john" },
    });
  });

  it("returns validation error when input invalid", async () => {
    const invalidInput = { page: -1, limit: 0 } as unknown as ListUsersInput;

    const result = await usecase.run(invalidInput);

    expect(result.isWrong()).toBe(true);
  });
});
