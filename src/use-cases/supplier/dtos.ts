import { Paginated } from "@src/types/paginator";
import { BasePaginatorSchema } from "@src/util/zod/paginator";
import z from "zod";

export type OutputSupplier = {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const CreateSupplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type CreateSupplierOutput = OutputSupplier;

export const ListSuppliersSchema = BasePaginatorSchema.extend({
  name: z.string().optional(),
  phone: z.string().optional(),
});

export type ListSuppliersInput = z.infer<typeof ListSuppliersSchema>;
export type ListSuppliersOutput = Paginated<OutputSupplier>;

export const GetSupplierSchema = z.object({
  id: z.uuid("ID inválido"),
});

export type GetSupplierInput = z.infer<typeof GetSupplierSchema>;
export type GetSupplierOutput = OutputSupplier;

export const UpdateSupplierSchema = z.object({
  id: z.uuid("ID inválido"),
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;
export type UpdateSupplierOutput = OutputSupplier;

export const DeleteSupplierSchema = z.object({
  id: z.uuid("ID inválido"),
});

export type DeleteSupplierInput = z.infer<typeof DeleteSupplierSchema>;
export type DeleteSupplierOutput = void;

export type SupplierControllerOutput =
  | CreateSupplierOutput
  | ListSuppliersOutput
  | GetSupplierOutput
  | UpdateSupplierOutput
  | DeleteSupplierOutput;
