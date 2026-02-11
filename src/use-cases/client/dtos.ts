import { Paginated } from "@src/types/paginator";
import { BasePaginatorSchema } from "@src/util/zod/paginator";
import z from "zod";

export type OutputClient = {
  id: string;
  name: string;
  email: string | null;
  birthDate: Date | null;
  phone: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const CreateClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email").optional(),
  birthDate: z.coerce.date().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type CreateClientOutput = OutputClient;

export const ListClientsSchema = BasePaginatorSchema.extend({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  birthDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type ListClientsInput = z.infer<typeof ListClientsSchema>;
export type ListClientsOutput = Paginated<OutputClient>;

export const GetClientSchema = z.object({
  id: z.uuid("Invalid ID"),
});

export type GetClientInput = z.infer<typeof GetClientSchema>;
export type GetClientOutput = OutputClient;

export const UpdateClientSchema = z.object({
  id: z.uuid("Invalid ID"),
  name: z.string().min(1).optional(),
  email: z.email("Invalid email").optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type UpdateClientOutput = OutputClient;

export const DeleteClientSchema = z.object({
  id: z.uuid("Invalid ID"),
});

export type DeleteClientInput = z.infer<typeof DeleteClientSchema>;
export type DeleteClientOutput = void;

export type ClientControllerOutput =
  | CreateClientOutput
  | ListClientsOutput
  | GetClientOutput
  | UpdateClientOutput
  | DeleteClientOutput;
