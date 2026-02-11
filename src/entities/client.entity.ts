import { BaseEntity, BaseProps } from "@src/core/entity";
import { OutputClient } from "@src/use-cases/client/dtos";
import { ClientCreateInput } from "generated/prisma/models";
import { Client as PrismaClient } from "generated/prisma/client";

export interface ClientProps extends BaseProps {
  name: string;
  email?: string | null;
  birthDate?: Date | null;
  phone?: string | null;
  notes?: string | null;
}

export class Client extends BaseEntity {
  public name: string;
  public email: string | null;
  public birthDate: Date | null;
  public phone: string | null;
  public notes: string | null;

  constructor(props: ClientProps) {
    super(props);
    this.name = props.name;
    this.email = props.email ?? null;
    this.birthDate = props.birthDate ?? null;
    this.phone = props.phone ?? null;
    this.notes = props.notes ?? null;
  }

  public static fromPrisma(client: PrismaClient): Client {
    return new Client({
      id: client.id,
      name: client.name,
      email: client.email ?? null,
      birthDate: client.birthDate ?? null,
      phone: client.phone ?? null,
      notes: client.notes ?? null,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    });
  }

  toOutput(): OutputClient {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      birthDate: this.birthDate,
      phone: this.phone,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toPrisma(): ClientCreateInput {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      birthDate: this.birthDate,
      phone: this.phone,
      notes: this.notes,
    };
  }
}
