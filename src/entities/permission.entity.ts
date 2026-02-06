import { BaseEntity, BaseProps } from "@src/core/entity";
import { PermissionCode } from "generated/prisma/enums";

export interface PermissionProps extends BaseProps {
  code: PermissionCode;
  description?: string | null;
}

export class Permission extends BaseEntity {
  public readonly code: PermissionCode;
  public readonly description?: string | null;

  constructor(props: PermissionProps) {
    super(props);
    this.code = props.code;
    this.description = props.description ?? null;
  }
}
