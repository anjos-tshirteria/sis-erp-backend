import { BaseEntity, BaseProps } from "@src/core/entity";
import { PermissionCode } from "generated/prisma/enums";
import { Role as PrismaRole } from "generated/prisma/client";

export interface RoleProps extends BaseProps {
  name: string;
  description?: string | null;
  permissions?: PermissionCode[];
}

export class Role extends BaseEntity {
  public name: string;
  public description?: string | null;
  public permissions: PermissionCode[];

  constructor(props: RoleProps) {
    super(props);
    this.name = props.name;
    this.description = props.description ?? null;
    this.permissions = props.permissions ?? [];
  }

  public static fromPrisma(role: PrismaRole): Role {
    return new Role({
      id: role.id,
      name: role.name,
      description: role.description ?? null,
      permissions: role.permissions ?? [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }

  addPermission(permission: PermissionCode) {
    this.permissions.push(permission);
    this.updatedAt = new Date();
  }
}
