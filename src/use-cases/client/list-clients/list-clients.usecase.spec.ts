jest.mock("@src/database/index", () => ({
  prisma: {
    client: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { ListClientsUseCase } from "./list-clients.usecase";
import { ListClientsInput, ListClientsOutput } from "../dtos";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  client: {
    findMany: jest.Mock;
    count: jest.Mock;
  };
};

describe("ListClientsUseCase", () => {
  let usecase: ListClientsUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  const mockClients = [
    {
      id: "c1",
      name: "Cliente A",
      email: "a@email.com",
      birthDate: new Date("1990-01-01"),
      phone: "(11) 99999-0000",
      notes: "Notas A",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    },
    {
      id: "c2",
      name: "Cliente B",
      email: null,
      birthDate: null,
      phone: null,
      notes: null,
      createdAt: new Date("2024-02-01T00:00:00.000Z"),
      updatedAt: new Date("2024-02-02T00:00:00.000Z"),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new ListClientsUseCase();
  });

  it("returns paginated clients mapped to domain output", async () => {
    const input: ListClientsInput = { page: 1, limit: 10 };

    mockedPrisma.client.findMany.mockResolvedValue(mockClients);
    mockedPrisma.client.count.mockResolvedValue(2);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    const value = result.value as ListClientsOutput;
    expect(value).toHaveProperty("data");
    expect(value).toHaveProperty("pagination");
    expect(value.data).toHaveLength(2);
    expect(value.data[0]).toEqual(
      expect.objectContaining({
        id: "c1",
        name: "Cliente A",
        email: "a@email.com",
        phone: "(11) 99999-0000",
        notes: "Notas A",
      }),
    );
    expect(value.data[1]).toEqual(
      expect.objectContaining({
        id: "c2",
        name: "Cliente B",
        email: null,
        phone: null,
        notes: null,
      }),
    );
    expect(value.pagination).toEqual(
      expect.objectContaining({ page: 1, limit: 10, total: 2, totalPages: 1 }),
    );
  });

  it("returns empty list when no clients exist", async () => {
    mockedPrisma.client.findMany.mockResolvedValue([]);
    mockedPrisma.client.count.mockResolvedValue(0);

    const result = await usecase.run({ page: 1, limit: 10 });

    expect(result.isRight()).toBe(true);
    const value = result.value as ListClientsOutput;
    expect(value.data).toHaveLength(0);
    expect(value.pagination.total).toBe(0);
    expect(value.pagination.totalPages).toBe(0);
  });

  it("applies name filter to prisma queries", async () => {
    const input: ListClientsInput = { page: 1, limit: 5, name: "ABC" };

    mockedPrisma.client.findMany.mockResolvedValue([]);
    mockedPrisma.client.count.mockResolvedValue(0);

    await usecase.run(input);

    expect(mockedPrisma.client.findMany).toHaveBeenCalled();
    expect(mockedPrisma.client.count).toHaveBeenCalledWith({
      where: { name: "ABC" },
    });
  });

  it("applies email filter to prisma queries", async () => {
    const input: ListClientsInput = {
      page: 1,
      limit: 5,
      email: "test@email.com",
    };

    mockedPrisma.client.findMany.mockResolvedValue([]);
    mockedPrisma.client.count.mockResolvedValue(0);

    await usecase.run(input);

    expect(mockedPrisma.client.count).toHaveBeenCalledWith({
      where: { email: "test@email.com" },
    });
  });

  it("applies phone filter to prisma queries", async () => {
    const input: ListClientsInput = {
      page: 1,
      limit: 5,
      phone: "(11) 99999",
    };

    mockedPrisma.client.findMany.mockResolvedValue([]);
    mockedPrisma.client.count.mockResolvedValue(0);

    await usecase.run(input);

    expect(mockedPrisma.client.count).toHaveBeenCalledWith({
      where: { phone: "(11) 99999" },
    });
  });

  it("uses default page and limit when not provided", async () => {
    mockedPrisma.client.findMany.mockResolvedValue([]);
    mockedPrisma.client.count.mockResolvedValue(0);

    const result = await usecase.run({} as ListClientsInput);

    expect(result.isRight()).toBe(true);
    const value = result.value as ListClientsOutput;
    expect(value.pagination.page).toBe(1);
    expect(value.pagination.limit).toBe(10);
  });

  it("returns validation error when page is invalid", async () => {
    const invalidInput = { page: -1, limit: 0 } as unknown as ListClientsInput;

    const result = await usecase.run(invalidInput);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(InputValidationError);
  });
});
