import { z } from 'zod';

// Shared shapes for folder + diagram requests. The editor sends `payload` as the
// pako-serialized State string produced by serializeState().

const id = z.string().min(1);
const name = z.string().min(1).max(200).trim();
const payload = z.string().min(1).max(1_000_000);

export const folderCreateSchema = z.object({
  name,
  parentId: id.nullish()
});

export const folderUpdateSchema = z
  .object({
    name: name.optional(),
    parentId: id.nullish()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'No fields to update'
  });

export const diagramCreateSchema = z.object({
  name,
  folderId: id.nullish(),
  payload
});

export const diagramUpdateSchema = z
  .object({
    name: name.optional(),
    folderId: id.nullish(),
    payload: payload.optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'No fields to update'
  });

export const diagramListQuerySchema = z.object({
  folderId: id.optional()
});

// Entra ID SSO integration config. `clientSecret` is optional: when omitted (or
// blank) on update, the existing stored secret is kept. An empty string is
// treated as "keep existing".
export const entraConfigUpdateSchema = z.object({
  tenantId: z.string().min(1).trim(),
  clientId: z.string().min(1).trim(),
  clientSecret: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  redirectUri: z.string().url()
});

export type EntraConfigUpdateInput = z.infer<typeof entraConfigUpdateSchema>;

export type FolderCreateInput = z.infer<typeof folderCreateSchema>;
export type FolderUpdateInput = z.infer<typeof folderUpdateSchema>;
export type DiagramCreateInput = z.infer<typeof diagramCreateSchema>;
export type DiagramUpdateInput = z.infer<typeof diagramUpdateSchema>;
