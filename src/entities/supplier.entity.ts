import { BaseEntity, BaseProps } from "@src/core/entity";
import { OutputSupplier } from "@src/use-cases/supplier/dtos";
import { SupplierCreateInput } from "generated/prisma/models";
import { Supplier as PrismaSupplier } from "generated/prisma/client";

export interface SupplierProps extends BaseProps {
  name: string;
  phone?: string | null;
  notes?: string | null;
}

export class Supplier extends BaseEntity {
  public name: string;
  public phone: string | null;
  public notes: string | null;

  constructor(props: SupplierProps) {
    super(props);
    this.name = props.name;
    this.phone = props.phone ?? null;
    this.notes = props.notes ?? null;
  }

  public static fromPrisma(supplier: PrismaSupplier): Supplier {
    return new Supplier({
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone ?? null,
      notes: supplier.notes ?? null,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    });
  }

  toOutput(): OutputSupplier {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toPrisma(): SupplierCreateInput {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      notes: this.notes,
    };
  }
}
