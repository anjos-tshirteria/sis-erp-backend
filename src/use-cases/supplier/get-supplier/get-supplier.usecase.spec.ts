jest.mock("@src/database/index", () => ({
  prisma: {
    supplier: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { GetSupplierUseCase } from "./get-supplier.usecase";
import { GetSupplierInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  supplier: {
    findUnique: jest.Mock;
  };
};

describe("GetSupplierUseCase", () => {
  let usecase: GetSupplierUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  const mockSupplier = {
    id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    name: "Fornecedor A",
    phone: "(11) 99999-0000",
    notes: "Notas",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new GetSupplierUseCase();
  });

  it("returns supplier mapped to domain output when found", async () => {
    const input: GetSupplierInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    mockedPrisma.supplier.findUnique.mockResolvedValue(mockSupplier);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        id: "13da8489-8f88-41e2-8348-8663daecf1fb",
        name: "Fornecedor A",
        phone: "(11) 99999-0000",
        notes: "Notas",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      }),
    );
    expect(mockedPrisma.supplier.findUnique).toHaveBeenCalledWith({
      where: { id: input.id },
    });
  });

  it("returns supplier with null optional fields", async () => {
    const input: GetSupplierInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    mockedPrisma.supplier.findUnique.mockResolvedValue({
      ...mockSupplier,
      phone: null,
      notes: null,
    });

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        phone: null,
        notes: null,
      }),
    );
  });

  it("returns NotFoundError when supplier not found", async () => {
    const input: GetSupplierInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    mockedPrisma.supplier.findUnique.mockResolvedValue(null);

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });

  it("returns InputValidationError when id is not a valid UUID", async () => {
    const result = await usecase.run({
      id: "not-uuid",
    } as unknown as GetSupplierInput);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(InputValidationError);
    expect(mockedPrisma.supplier.findUnique).not.toHaveBeenCalled();
  });

  it("returns InputValidationError when id is empty", async () => {
    const result = await usecase.run({
      id: "",
    } as unknown as GetSupplierInput);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(InputValidationError);
  });
});
