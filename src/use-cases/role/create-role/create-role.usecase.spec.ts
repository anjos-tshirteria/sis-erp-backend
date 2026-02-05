jest.mock("@src/database/index", () => ({
  prisma: {
    role: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { prisma } from "@src/database/index";
import { CreateRoleUseCase } from "./create-role.usecase";
import { CreateRoleInput } from "../dtos";
import { AlreadyExistsError } from "@src/errors/generic.errors";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  role: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

describe("CreateRoleUseCase", () => {
  let usecase: CreateRoleUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;
  let input: CreateRoleInput;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new CreateRoleUseCase();
    input = {
      name: "Admin",
      permissions: ["MANAGE_USERS"],
    };
  });

  describe("input validation", () => {
    type InvalidCase = [
      keyof CreateRoleInput,
      CreateRoleInput[keyof CreateRoleInput],
    ];
    it.each<InvalidCase>([
      ["name", ""],
      ["permissions", ["INVALID_PERMISSION"] as any],
    ])(
      "returns InputValidationError when %s is invalid",
      async (field, value) => {
        const invalidInput = { ...input, [field]: value } as CreateRoleInput;

        const result = await usecase.run(invalidInput);

        expect(result.isWrong()).toBe(true);
        expect(result.value).toBeInstanceOf(InputValidationError);
        expect(mockedPrisma.role.findUnique).not.toHaveBeenCalled();
        expect(mockedPrisma.role.create).not.toHaveBeenCalled();
      },
    );
  });

  it("returns AlreadyExistsError when role with same name exists", async () => {
    mockedPrisma.role.findUnique.mockResolvedValue({ id: "r1" });

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsError);
  });

  it("creates a role successfully", async () => {
    mockedPrisma.role.findUnique.mockResolvedValue(null);

    const created = {
      id: "r1",
      name: "Admin",
      description: null,
      permissions: ["MANAGE_USERS"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedPrisma.role.create.mockResolvedValue(created);

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);

    expect(mockedPrisma.role.create).toHaveBeenCalledWith({
      data: {
        name: input.name,
        description: undefined,
        permissions: input.permissions,
      },
    });

    expect(result.value).toEqual(
      expect.objectContaining({
        id: "r1",
        name: "Admin",
        permissions: ["MANAGE_USERS"],
      }),
    );
  });
});
