import { PermissionCode } from "generated/prisma/enums";
import z from "zod";

export type OutputCurrentUser = {
  id: string;
  name: string;
  username: string;
  email: string | null;
  active: boolean;
  role: {
    id: string;
    name: string;
    description: string | null;
    permissions: PermissionCode[];
  };
  createdAt: Date;
  updatedAt: Date;
};

export const GetCurrentUserSchema = z.object({
  id: z.uuid("ID inválido"),
});

export type GetCurrentUserInput = z.infer<typeof GetCurrentUserSchema>;
export type GetCurrentUserOutput = OutputCurrentUser;

export type MeControllerOutput = GetCurrentUserOutput;
