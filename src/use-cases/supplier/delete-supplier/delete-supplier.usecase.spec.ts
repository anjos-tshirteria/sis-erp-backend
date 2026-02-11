jest.mock("@src/database/index", () => ({
  prisma: {
    supplier: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { DeleteSupplierUseCase } from "./delete-supplier.usecase";
import { DeleteSupplierInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  supplier: {
    findUnique: jest.Mock;
    delete: jest.Mock;
  };
};

describe("DeleteSupplierUseCase", () => {
  let usecase: DeleteSupplierUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  const validId = "13da8489-8f88-41e2-8348-8663daecf1fb";

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new DeleteSupplierUseCase();
  });

  it("deletes supplier when exists and returns success", async () => {
    const input: DeleteSupplierInput = { id: validId };
    const existing = { id: validId };

    mockedPrisma.supplier.findUnique.mockResolvedValue(existing);
    mockedPrisma.supplier.delete.mockResolvedValue(existing);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toBeUndefined();
    expect(mockedPrisma.supplier.findUnique).toHaveBeenCalledWith({
      where: { id: validId },
    });
    expect(mockedPrisma.supplier.delete).toHaveBeenCalledWith({
      where: { id: validId },
    });
  });

  it("returns NotFoundError when supplier does not exist", async () => {
    const input: DeleteSupplierInput = { id: validId };

    mockedPrisma.supplier.findUnique.mockResolvedValue(null);

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
    expect(mockedPrisma.supplier.delete).not.toHaveBeenCalled();
  });

  it("returns InputValidationError when id is not a valid UUID", async () => {
    const result = await usecase.run({
      id: "not-uuid",
    } as unknown as DeleteSupplierInput);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(InputValidationError);
    expect(mockedPrisma.supplier.findUnique).not.toHaveBeenCalled();
  });

  it("returns InputValidationError when id is empty", async () => {
    const result = await usecase.run({
      id: "",
    } as unknown as DeleteSupplierInput);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(InputValidationError);
  });
});
