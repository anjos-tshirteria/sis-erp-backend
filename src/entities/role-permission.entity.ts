import { Role } from "generated/prisma/browser";
import { Permission } from "./permission.entity";

export interface RolePermissionProps {
  roleId: string;
  permissionId: string;
  role?: Role;
  permission?: Permission;
}

export class RolePermission {
  public readonly roleId: string;
  public readonly permissionId: string;

  public readonly role?: Role;
  public readonly permission?: Permission;

  constructor(props: RolePermissionProps) {
    this.roleId = props.roleId;
    this.permissionId = props.permissionId;
    this.role = props.role;
    this.permission = props.permission;
  }
}
