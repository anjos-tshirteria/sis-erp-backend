import z from "zod";
import { PermissionCode } from "generated/prisma/enums";
import { BasePaginatorSchema } from "@src/util/zod/paginator";
import { Paginated } from "@src/types/paginator";
import { Role } from "@src/entities/role.entity";

export type OutputRole = Role;

export const CreateRoleSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  permissions: z.array(z.enum(PermissionCode)).optional().default([]),
});

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type CreateRoleOutput = OutputRole;

export const ListRolesSchema = BasePaginatorSchema.extend({
  name: z.string().optional(),
});

export type ListRolesInput = z.infer<typeof ListRolesSchema>;
export type ListRolesOutput = Paginated<OutputRole>;

export const GetRoleSchema = z.object({ id: z.string().uuid("ID inválido") });
export type GetRoleInput = z.infer<typeof GetRoleSchema>;
export type GetRoleOutput = OutputRole;

export const UpdateRoleSchema = z.object({
  id: z.uuid("ID inválido"),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  permissions: z.array(z.enum(PermissionCode)).optional(),
});
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
export type UpdateRoleOutput = OutputRole;

export const DeleteRoleSchema = z.object({
  id: z.uuid("ID inválido"),
});
export type DeleteRoleInput = z.infer<typeof DeleteRoleSchema>;
export type DeleteRoleOutput = void;

export type RoleControllerOutput =
  | CreateRoleOutput
  | ListRolesOutput
  | GetRoleOutput
  | UpdateRoleOutput
  | DeleteRoleOutput;
