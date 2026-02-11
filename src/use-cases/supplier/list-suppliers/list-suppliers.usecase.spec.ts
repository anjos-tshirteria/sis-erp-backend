jest.mock("@src/database/index", () => ({
  prisma: {
    supplier: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { ListSuppliersUseCase } from "./list-suppliers.usecase";
import { ListSuppliersInput, ListSuppliersOutput } from "../dtos";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  supplier: {
    findMany: jest.Mock;
    count: jest.Mock;
  };
};

describe("ListSuppliersUseCase", () => {
  let usecase: ListSuppliersUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  const mockSuppliers = [
    {
      id: "s1",
      name: "Fornecedor A",
      phone: "(11) 99999-0000",
      notes: "Notas A",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    },
    {
      id: "s2",
      name: "Fornecedor B",
      phone: null,
      notes: null,
      createdAt: new Date("2024-02-01T00:00:00.000Z"),
      updatedAt: new Date("2024-02-02T00:00:00.000Z"),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new ListSuppliersUseCase();
  });

  it("returns paginated suppliers mapped to domain output", async () => {
    const input: ListSuppliersInput = { page: 1, limit: 10 };

    mockedPrisma.supplier.findMany.mockResolvedValue(mockSuppliers);
    mockedPrisma.supplier.count.mockResolvedValue(2);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    const value = result.value as ListSuppliersOutput;
    expect(value).toHaveProperty("data");
    expect(value).toHaveProperty("pagination");
    expect(value.data).toHaveLength(2);
    expect(value.data[0]).toEqual(
      expect.objectContaining({
        id: "s1",
        name: "Fornecedor A",
        phone: "(11) 99999-0000",
        notes: "Notas A",
      }),
    );
    expect(value.data[1]).toEqual(
      expect.objectContaining({
        id: "s2",
        name: "Fornecedor B",
        phone: null,
        notes: null,
      }),
    );
    expect(value.pagination).toEqual(
      expect.objectContaining({ page: 1, limit: 10, total: 2, totalPages: 1 }),
    );
  });

  it("returns empty list when no suppliers exist", async () => {
    mockedPrisma.supplier.findMany.mockResolvedValue([]);
    mockedPrisma.supplier.count.mockResolvedValue(0);

    const result = await usecase.run({ page: 1, limit: 10 });

    expect(result.isRight()).toBe(true);
    const value = result.value as ListSuppliersOutput;
    expect(value.data).toHaveLength(0);
    expect(value.pagination.total).toBe(0);
    expect(value.pagination.totalPages).toBe(0);
  });

  it("applies name filter to prisma queries", async () => {
    const input: ListSuppliersInput = { page: 1, limit: 5, name: "ABC" };

    mockedPrisma.supplier.findMany.mockResolvedValue([]);
    mockedPrisma.supplier.count.mockResolvedValue(0);

    await usecase.run(input);

    expect(mockedPrisma.supplier.findMany).toHaveBeenCalled();
    expect(mockedPrisma.supplier.count).toHaveBeenCalledWith({
      where: { name: "ABC" },
    });
  });

  it("applies phone filter to prisma queries", async () => {
    const input: ListSuppliersInput = {
      page: 1,
      limit: 5,
      phone: "(11) 99999",
    };

    mockedPrisma.supplier.findMany.mockResolvedValue([]);
    mockedPrisma.supplier.count.mockResolvedValue(0);

    await usecase.run(input);

    expect(mockedPrisma.supplier.count).toHaveBeenCalledWith({
      where: { phone: "(11) 99999" },
    });
  });

  it("uses default page and limit when not provided", async () => {
    mockedPrisma.supplier.findMany.mockResolvedValue([]);
    mockedPrisma.supplier.count.mockResolvedValue(0);

    const result = await usecase.run({} as ListSuppliersInput);

    expect(result.isRight()).toBe(true);
    const value = result.value as ListSuppliersOutput;
    expect(value.pagination.page).toBe(1);
    expect(value.pagination.limit).toBe(10);
  });

  it("returns validation error when page is invalid", async () => {
    const invalidInput = { page: -1, limit: 0 } as unknown as ListSuppliersInput;

    const result = await usecase.run(invalidInput);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(InputValidationError);
  });
});
