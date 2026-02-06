jest.mock("@src/database/index", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("@src/util/password", () => ({
  __esModule: true,
  default: {
    hashPassword: jest.fn(),
    checkPasswordRules: jest.fn(),
  },
}));

import { CreateUserUseCase } from "./create-user.usecase";
import { prisma } from "@src/database/index";
import PasswordUtil from "@src/util/password";
import { AlreadyExistsError, NotFoundError } from "@src/errors/generic.errors";
import { CreateUserInput } from "../dtos";
import { InputValidationError } from "@src/errors/input-validation.error";

type PrismaMock = {
  user: {
    findFirst: jest.Mock;
    create: jest.Mock;
  };
  role: {
    findFirst: jest.Mock;
  };
};

describe("CreateUserUseCase", () => {
  let usecase: CreateUserUseCase;
  const mockedPrisma = prisma as unknown as PrismaMock;
  let mockedPasswordUtil: jest.Mocked<typeof PasswordUtil>;
  let input: CreateUserInput;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new CreateUserUseCase();
    input = {
      name: "User",
      username: "user",
      email: "user@email.com",
      password: "P@ssw0rd!123",
      roleId: "d297007d-308b-4ef7-8f06-a03ce798ff13",
    };
    mockedPasswordUtil = PasswordUtil as jest.Mocked<typeof PasswordUtil>;
    mockedPasswordUtil.checkPasswordRules.mockReturnValue(undefined);
  });

  describe("input validation", () => {
    type InvalidCase = [
      keyof CreateUserInput,
      CreateUserInput[keyof CreateUserInput],
    ];
    it.each<InvalidCase>([
      ["name", ""],
      ["username", ""],
      ["email", "invalid-email"],
      ["password", "weak-password"],
      ["roleId", "invalid-uuid"],
    ])(
      "return InputValidationError when %s is invalid",
      async (field, value) => {
        const invalidInput = {
          ...input,
          [field]: value,
        } as CreateUserInput;

        if (field === "password") {
          mockedPasswordUtil.checkPasswordRules.mockReturnValue(
            "Password does not meet rules",
          );
        }
        const result = await usecase.run(invalidInput);

        expect(result.isWrong()).toBe(true);
        expect(result.value).toBeInstanceOf(InputValidationError);
        expect(mockedPrisma.user.findFirst).not.toHaveBeenCalled();
      },
    );
  });

  it("returns AlreadyExistsError when user with same email exists", async () => {
    mockedPrisma.user.findFirst.mockResolvedValue({ id: "u1" });

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsError);
  });

  it("returns NotFoundError when role does not exist", async () => {
    mockedPrisma.user.findFirst.mockResolvedValue(null);
    mockedPrisma.role.findFirst.mockResolvedValue(null);

    const result = await usecase.run(input);

    expect(result.isWrong()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });

  it("creates a user successfully", async () => {
    mockedPrisma.user.findFirst.mockResolvedValue(null);
    mockedPrisma.role.findFirst.mockResolvedValue({
      id: "d297007d-308b-4ef7-8f06-a03ce798ff13",
      name: "Admin",
    });
    mockedPrisma.user.create.mockResolvedValue({ id: "u-created" });

    mockedPasswordUtil.hashPassword.mockResolvedValue("hashed-password");

    const result = await usecase.run(input);

    expect(result.isRight()).toBe(true);

    expect(mockedPasswordUtil.hashPassword).toHaveBeenCalledWith(
      input.password,
    );

    expect(mockedPrisma.user.create).toHaveBeenCalledWith({
      data: {
        name: input.name,
        username: input.username,
        password: "hashed-password",
        role: { connect: { id: input.roleId } },
      },
    });

    expect(result.value).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: input.name,
        username: input.username,
        role: "Admin",
      }),
    );
  });
});
