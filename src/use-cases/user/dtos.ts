import { Paginated } from "@src/types/paginator";
import { BasePaginatorSchema } from "@src/util/zod/paginator";
import { zPassword } from "@src/util/zod/password";
import z from "zod";

export type OutputUser = {
  id: string;
  name: string;
  username: string;
  email: string | null;
  active: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export const CreateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  username: z.string().min(1, "Usuário é obrigatório"),
  email: z.email("Email inválido"),
  password: zPassword(),
  roleId: z.uuid("ID Inválido"),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateUserOutput = OutputUser;

export const ListUsersSchema = BasePaginatorSchema.extend({
  name: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  active: z.boolean().optional(),
  roleId: z.uuid().optional(),
});

export type ListUsersInput = z.infer<typeof ListUsersSchema>;
export type ListUsersOutput = Paginated<OutputUser>;

export const GetUserSchema = z.object({
  id: z.uuid("ID inválido"),
});

export type GetUserInput = z.infer<typeof GetUserSchema>;
export type GetUserOutput = OutputUser;

export const UpdateUserSchema = z.object({
  id: z.uuid("ID inválido"),
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  email: z.email().optional(),
  active: z.boolean().optional(),
  roleId: z.uuid().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UpdateUserOutput = OutputUser;

export const DeleteUserSchema = z.object({
  id: z.uuid("ID inválido"),
});

export type DeleteUserInput = z.infer<typeof DeleteUserSchema>;
export type DeleteUserOutput = void;

export type UserControllerOutput =
  | CreateUserOutput
  | ListUsersOutput
  | GetUserOutput
  | UpdateUserOutput
  | DeleteUserOutput;
