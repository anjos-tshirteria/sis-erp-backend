import { zPassword } from "@src/util/zod/password";
import z from "zod";

export type OutputUser = {
  id: string;
  name: string;
  username: string;
  email: string;
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

export type UserControllerOutput = CreateUserOutput;
