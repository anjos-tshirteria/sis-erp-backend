jest.mock("@src/database/index", () => ({
  prisma: {
    client: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { UpdateClientUseCase } from "./update-client.usecase";
import { UpdateClientInput } from "../dtos";
import { NotFoundError } from "@src/errors/generic.errors";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  client: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

describe("UpdateClientUseCase", () => {
  let usecase: UpdateClientUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;

  const validId = "13da8489-8f88-41e2-8348-8663daecf1fb";

  const existing = {
    id: validId,
    name: "Cliente Antigo",
    email: "antigo@email.com",
    birthDate: new Date("1990-01-01"),
    phone: "(11) 99999-0000",
    notes: "Notas antigas",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new UpdateClientUseCase();
  });

  describe("success", () => {
    it("updates and returns the client when found", async () => {
      const input: UpdateClientInput = { id: validId, name: "Cliente Novo" };
      const updated = { ...existing, name: "Cliente Novo" };

      mockedPrisma.client.findUnique.mockResolvedValue(existing);
      mockedPrisma.client.update.mockResolvedValue(updated);

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({
          id: validId,
          name: "Cliente Novo",
        }),
      );
      expect(mockedPrisma.client.update).toHaveBeenCalledWith({
        where: { id: validId },
        data: { name: "Cliente Novo" },
      });
    });

    it("updates email to null", async () => {
      const input: UpdateClientInput = { id: validId, email: null };
      const updated = { ...existing, email: null };

      mockedPrisma.client.findUnique.mockResolvedValue(existing);
      mockedPrisma.client.update.mockResolvedValue(updated);

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({ email: null }),
      );
    });

    it("updates phone to null", async () => {
      const input: UpdateClientInput = { id: validId, phone: null };
      const updated = { ...existing, phone: null };

      mockedPrisma.client.findUnique.mockResolvedValue(existing);
      mockedPrisma.client.update.mockResolvedValue(updated);

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({ phone: null }),
      );
    });

    it("updates notes to null", async () => {
      const input: UpdateClientInput = { id: validId, notes: null };
      const updated = { ...existing, notes: null };

      mockedPrisma.client.findUnique.mockResolvedValue(existing);
      mockedPrisma.client.update.mockResolvedValue(updated);

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({ notes: null }),
      );
    });

    it("updates multiple fields at once", async () => {
      const input: UpdateClientInput = {
        id: validId,
        name: "Novo Nome",
        email: "novo@email.com",
        phone: "(21) 88888-1111",
        notes: "Novas notas",
      };
      const updated = { ...existing, ...input };

      mockedPrisma.client.findUnique.mockResolvedValue(existing);
      mockedPrisma.client.update.mockResolvedValue(updated);

      const result = await usecase.run(input);

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({
          name: "Novo Nome",
          email: "novo@email.com",
          phone: "(21) 88888-1111",
          notes: "Novas notas",
        }),
      );
    });
  });

  describe("not found", () => {
    it("returns NotFoundError when client does not exist", async () => {
      const input: UpdateClientInput = { id: validId, name: "X" };

      mockedPrisma.client.findUnique.mockResolvedValue(null);

      const result = await usecase.run(input);

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(mockedPrisma.client.update).not.toHaveBeenCalled();
    });
  });

  describe("input validation", () => {
    it("returns InputValidationError when id is not a valid UUID", async () => {
      const result = await usecase.run({ id: "not-uuid", name: "X" });

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
      expect(mockedPrisma.client.findUnique).not.toHaveBeenCalled();
    });

    it("returns InputValidationError when name is empty string", async () => {
      const result = await usecase.run({ id: validId, name: "" });

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
    });

    it("returns InputValidationError when email is invalid", async () => {
      const result = await usecase.run({ id: validId, email: "invalid" });

      expect(result.isWrong()).toBe(true);
      expect(result.value).toBeInstanceOf(InputValidationError);
    });
  });
});
