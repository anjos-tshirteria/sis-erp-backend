jest.mock("@src/database/index", () => ({
  prisma: {
    client: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { CreateClientUseCase } from "./create-client.usecase";
import { prisma } from "@src/database/index";
import { AlreadyExistsError } from "@src/errors/generic.errors";
import { CreateClientInput } from "../dtos";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  client: {
    findFirst: jest.Mock;
    create: jest.Mock;
  };
};

describe("CreateClientUseCase", () => {
  let usecase: CreateClientUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;
  let input: CreateClientInput;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new CreateClientUseCase();
    input = {
      name: "Cliente ABC",
      email: "cliente@email.com",
      birthDate: new Date("1990-05-15"),
      phone: "(11) 99999-0000",
      notes: "Cliente preferencial",
    };
  });

  describe("input validation", () => {
    it("returns InputValidationError when name is empty", async () => {
      const result = await usecase.run({ ...input, name: "" });

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
      expect(mockedPrisma.client.findFirst).not.toHaveBeenCalled();
    });

    it("returns InputValidationError when email is invalid", async () => {
      const result = await usecase.run({ ...input, email: "invalid-email" });

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
      expect(mockedPrisma.client.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("duplicate check", () => {
    it("returns AlreadyExistsError when client with same name exists", async () => {
      mockedPrisma.client.findFirst.mockResolvedValue({ id: "c1" });

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(AlreadyExistsError);
      expect(mockedPrisma.client.findFirst).toHaveBeenCalledWith({
        where: { name: input.name },
      });
      expect(mockedPrisma.client.create).not.toHaveBeenCalled();
    });
  });

  describe("success", () => {
    it("creates a client with all fields", async () => {
      mockedPrisma.client.findFirst.mockResolvedValue(null);
      mockedPrisma.client.create.mockResolvedValue({ id: "c-created" });

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(mockedPrisma.client.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: input.name,
          email: input.email,
          phone: input.phone,
          notes: input.notes,
        }),
      });
      expect(result.value).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: input.name,
          email: input.email,
          phone: input.phone,
          notes: input.notes,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });

    it("creates a client without optional fields", async () => {
      mockedPrisma.client.findFirst.mockResolvedValue(null);
      mockedPrisma.client.create.mockResolvedValue({ id: "c-created" });

      const result = await usecase.run({ name: "Cliente Simples" });

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({
          name: "Cliente Simples",
          email: null,
          birthDate: null,
          phone: null,
          notes: null,
        }),
      );
    });
  });
});
