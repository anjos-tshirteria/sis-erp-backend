import { BaseEntity, BaseProps } from "@src/core/entity";
import { Role } from "./role.entity";
import { OutputUser } from "@src/use-cases/user/dtos";
import { UserCreateInput } from "generated/prisma/models";

export interface UserProps extends BaseProps {
  name: string;
  username: string;
  email: string;
  password: string;
  active?: boolean;
  roleId: string;
  role: Role;
}

export class User extends BaseEntity {
  public name: string;
  public username: string;
  public email: string;
  public password: string;
  public active: boolean;

  public roleId: string;
  public role: Role;

  constructor(props: UserProps) {
    super(props);
    this.name = props.name;
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
    this.active = props.active ?? true;
    this.roleId = props.roleId;
    this.role = props.role;
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
