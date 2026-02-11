jest.mock("@src/database/index", () => ({
  prisma: {
    client: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { DeleteClientUseCase } from "./delete-client.usecase";
import { DeleteClientInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  client: {
    findUnique: jest.Mock;
    delete: jest.Mock;
  };
};

describe("DeleteClientUseCase", () => {
  let usecase: DeleteClientUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  const validId = "13da8489-8f88-41e2-8348-8663daecf1fb";

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new DeleteClientUseCase();
  });

  it("deletes client when exists and returns success", async () => {
    const input: DeleteClientInput = { id: validId };
    const existing = { id: validId };

    mockedPrisma.client.findUnique.mockResolvedValue(existing);
    mockedPrisma.client.delete.mockResolvedValue(existing);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toBeUndefined();
    expect(mockedPrisma.client.findUnique).toHaveBeenCalledWith({
      where: { id: validId },
    });
    expect(mockedPrisma.client.delete).toHaveBeenCalledWith({
      where: { id: validId },
    });
  });

  it("returns NotFoundError when client does not exist", async () => {
    const input: DeleteClientInput = { id: validId };

    mockedPrisma.client.findUnique.mockResolvedValue(null);

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
    expect(mockedPrisma.client.delete).not.toHaveBeenCalled();
  });

  it("returns InputValidationError when id is not a valid UUID", async () => {
    const result = await usecase.run({
      id: "not-uuid",
    } as unknown as DeleteClientInput);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(InputValidationError);
    expect(mockedPrisma.client.findUnique).not.toHaveBeenCalled();
  });

  it("returns InputValidationError when id is empty", async () => {
    const result = await usecase.run({
      id: "",
    } as unknown as DeleteClientInput);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(InputValidationError);
  });
});
