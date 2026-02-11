jest.mock("@src/database/index", () => ({
  prisma: {
    client: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { GetClientUseCase } from "./get-client.usecase";
import { GetClientInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  client: {
    findUnique: jest.Mock;
  };
};

describe("GetClientUseCase", () => {
  let usecase: GetClientUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  const mockClient = {
    id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    name: "Cliente A",
    email: "a@email.com",
    birthDate: new Date("1990-01-01"),
    phone: "(11) 99999-0000",
    notes: "Notas",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new GetClientUseCase();
  });

  it("returns client mapped to domain output when found", async () => {
    const input: GetClientInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    mockedPrisma.client.findUnique.mockResolvedValue(mockClient);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        id: "13da8489-8f88-41e2-8348-8663daecf1fb",
        name: "Cliente A",
        email: "a@email.com",
        phone: "(11) 99999-0000",
        notes: "Notas",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      }),
    );
    expect(mockedPrisma.client.findUnique).toHaveBeenCalledWith({
      where: { id: input.id },
    });
  });

  it("returns client with null optional fields", async () => {
    const input: GetClientInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    mockedPrisma.client.findUnique.mockResolvedValue({
      ...mockClient,
      email: null,
      birthDate: null,
      phone: null,
      notes: null,
    });

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        email: null,
        birthDate: null,
        phone: null,
        notes: null,
      }),
    );
  });

  it("returns NotFoundError when client not found", async () => {
    const input: GetClientInput = {
      id: "13da8489-8f88-41e2-8348-8663daecf1fb",
    };

    mockedPrisma.client.findUnique.mockResolvedValue(null);

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });

  it("returns InputValidationError when id is not a valid UUID", async () => {
    const result = await usecase.run({
      id: "not-uuid",
    } as unknown as GetClientInput);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(InputValidationError);
    expect(mockedPrisma.client.findUnique).not.toHaveBeenCalled();
  });

  it("returns InputValidationError when id is empty", async () => {
    const result = await usecase.run({
      id: "",
    } as unknown as GetClientInput);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(InputValidationError);
  });
});
