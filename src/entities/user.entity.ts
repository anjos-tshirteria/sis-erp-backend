import { BaseEntity, BaseProps } from "@src/core/entity";
import { Role } from "./role.entity";
import { OutputUser } from "@src/use-cases/user/dtos";
import { UserCreateInput } from "generated/prisma/models";
import {
  User as PrismaUser,
  Role as PrismaRole,
} from "generated/prisma/client";

export interface UserProps extends BaseProps {
  name: string;
  username: string;
  email?: string | null;
  password: string;
  active?: boolean;
  roleId: string;
  role: Role;
}

export class User extends BaseEntity {
  public name: string;
  public username: string;
  public email: string | null;
  public password: string;
  public active: boolean;

  public roleId: string;
  public role: Role;

  constructor(props: UserProps) {
    super(props);
    this.name = props.name;
    this.username = props.username;
    this.email = props.email ?? null;
    this.password = props.password;
    this.active = props.active ?? true;
    this.roleId = props.roleId;
    this.role = props.role;
  }

  public static fromPrisma(user: PrismaUser & { role: PrismaRole }): User {
    const role = Role.fromPrisma(user.role);

    return new User({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email ?? null,
      password: user.password,
      active: user.active ?? true,
      roleId: user.roleId,
      role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  deactivate() {
    this.active = false;
    this.updatedAt = new Date();
  }

  toOutput(): OutputUser {
    return {
      id: this.id,
      name: this.name,
      username: this.username,
      email: this.email,
      active: this.active,
      role: this.role.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toPrisma(): UserCreateInput {
    return {
      name: this.name,
      username: this.username,
      password: this.password,
      role: {
        connect: { id: this.roleId },
      },
    };
  }
}
