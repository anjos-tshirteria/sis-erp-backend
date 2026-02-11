jest.mock("@src/database/index", () => ({
  prisma: {
    supplier: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { UpdateSupplierUseCase } from "./update-supplier.usecase";
import { UpdateSupplierInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  supplier: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

describe("UpdateSupplierUseCase", () => {
  let usecase: UpdateSupplierUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  const validId = "13da8489-8f88-41e2-8348-8663daecf1fb";

  const existing = {
    id: validId,
    name: "Fornecedor Antigo",
    phone: "(11) 99999-0000",
    notes: "Notas antigas",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new UpdateSupplierUseCase();
  });

  describe("success", () => {
    it("updates and returns the supplier when found", async () => {
      const input: UpdateSupplierInput = { id: validId, name: "Fornecedor Novo" };
      const updated = { ...existing, name: "Fornecedor Novo" };

      mockedPrisma.supplier.findUnique.mockResolvedValue(existing);
      mockedPrisma.supplier.update.mockResolvedValue(updated);

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({
          id: validId,
          name: "Fornecedor Novo",
        }),
      );
      expect(mockedPrisma.supplier.update).toHaveBeenCalledWith({
        where: { id: validId },
        data: { name: "Fornecedor Novo" },
      });
    });

    it("updates phone to null", async () => {
      const input: UpdateSupplierInput = { id: validId, phone: null };
      const updated = { ...existing, phone: null };

      mockedPrisma.supplier.findUnique.mockResolvedValue(existing);
      mockedPrisma.supplier.update.mockResolvedValue(updated);

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({ phone: null }),
      );
    });

    it("updates notes to null", async () => {
      const input: UpdateSupplierInput = { id: validId, notes: null };
      const updated = { ...existing, notes: null };

      mockedPrisma.supplier.findUnique.mockResolvedValue(existing);
      mockedPrisma.supplier.update.mockResolvedValue(updated);

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({ notes: null }),
      );
    });

    it("updates multiple fields at once", async () => {
      const input: UpdateSupplierInput = {
        id: validId,
        name: "Novo Nome",
        phone: "(21) 88888-1111",
        notes: "Novas notas",
      };
      const updated = { ...existing, ...input };

      mockedPrisma.supplier.findUnique.mockResolvedValue(existing);
      mockedPrisma.supplier.update.mockResolvedValue(updated);

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({
          name: "Novo Nome",
          phone: "(21) 88888-1111",
          notes: "Novas notas",
        }),
      );
    });
  });

  describe("not found", () => {
    it("returns NotFoundError when supplier does not exist", async () => {
      const input: UpdateSupplierInput = { id: validId, name: "X" };

      mockedPrisma.supplier.findUnique.mockResolvedValue(null);

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(mockedPrisma.supplier.update).not.toHaveBeenCalled();
    });
  });

  describe("input validation", () => {
    it("returns InputValidationError when id is not a valid UUID", async () => {
      const result = await usecase.run({ id: "not-uuid", name: "X" });

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
      expect(mockedPrisma.supplier.findUnique).not.toHaveBeenCalled();
    });

    it("returns InputValidationError when name is empty string", async () => {
      const result = await usecase.run({ id: validId, name: "" });

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
    });
  });
});
