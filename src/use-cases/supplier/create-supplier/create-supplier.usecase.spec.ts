jest.mock("@src/database/index", () => ({
  prisma: {
    supplier: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { CreateSupplierUseCase } from "./create-supplier.usecase";
import { prisma } from "@src/database/index";
import { AlreadyExistsError } from "@src/errors/generic.errors";
import { CreateSupplierInput } from "../dtos";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  supplier: {
    findFirst: jest.Mock;
    create: jest.Mock;
  };
};

describe("CreateSupplierUseCase", () => {
  let usecase: CreateSupplierUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;
  let input: CreateSupplierInput;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new CreateSupplierUseCase();
    input = {
      name: "Fornecedor ABC",
      phone: "(11) 99999-0000",
      notes: "Fornecedor de materiais",
    };
  });

  describe("input validation", () => {
    it("returns InputValidationError when name is empty", async () => {
      const result = await usecase.run({ ...input, name: "" });

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
      expect(mockedPrisma.supplier.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("duplicate check", () => {
    it("returns AlreadyExistsError when supplier with same name exists", async () => {
      mockedPrisma.supplier.findFirst.mockResolvedValue({ id: "s1" });

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(AlreadyExistsError);
      expect(mockedPrisma.supplier.findFirst).toHaveBeenCalledWith({
        where: { name: input.name },
      });
      expect(mockedPrisma.supplier.create).not.toHaveBeenCalled();
    });
  });

  describe("success", () => {
    it("creates a supplier with all fields", async () => {
      mockedPrisma.supplier.findFirst.mockResolvedValue(null);
      mockedPrisma.supplier.create.mockResolvedValue({ id: "s-created" });

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(mockedPrisma.supplier.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: input.name,
          phone: input.phone,
          notes: input.notes,
        }),
      });
      expect(result.value).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: input.name,
          phone: input.phone,
          notes: input.notes,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });

    it("creates a supplier without optional fields", async () => {
      mockedPrisma.supplier.findFirst.mockResolvedValue(null);
      mockedPrisma.supplier.create.mockResolvedValue({ id: "s-created" });

      const result = await usecase.run({ name: "Fornecedor Simples" });

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({
          name: "Fornecedor Simples",
          phone: null,
          notes: null,
        }),
      );
    });
  });
});
