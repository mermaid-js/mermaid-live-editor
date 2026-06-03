import { Router, type Request, type Response } from 'express';
import { writeAudit } from '../audit';
import { prisma } from '../db';
import { HttpError, parse } from '../http';
import { requireAuth, type AuthedRequest } from '../auth/middleware';
import { folderCreateSchema, folderUpdateSchema } from '../validation';

export const foldersRouter: Router = Router();

foldersRouter.use(requireAuth);

const uid = (req: Request): string => (req as AuthedRequest).userId;

// Express 5 types route params as `string | string[]`; for `/:id` it's a string.
const idParam = (req: Request): string => {
  const value = req.params.id;
  return Array.isArray(value) ? value[0] : value;
};

/** Ensure a folder exists and belongs to the current user. */
const assertFolderOwned = async (userId: string, folderId: string): Promise<void> => {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId },
    select: { id: true }
  });
  if (!folder) {
    throw new HttpError(404, 'Folder not found');
  }
};

// List all folders for the user (flat; the client builds the tree).
foldersRouter.get('/', async (req: Request, res: Response) => {
  const folders = await prisma.folder.findMany({
    where: { userId: uid(req) },
    select: { id: true, name: true, parentId: true, createdAt: true },
    orderBy: { name: 'asc' }
  });
  res.json(folders);
});

foldersRouter.post('/', async (req: Request, res: Response) => {
  const userId = uid(req);
  const input = parse(folderCreateSchema, req.body);

  if (input.parentId) {
    await assertFolderOwned(userId, input.parentId);
  }

  const folder = await prisma.folder.create({
    data: { userId, name: input.name, parentId: input.parentId ?? null },
    select: { id: true, name: true, parentId: true, createdAt: true }
  });
  await writeAudit(userId, 'folder.create', { folderId: folder.id });
  res.status(201).json(folder);
});

foldersRouter.patch('/:id', async (req: Request, res: Response) => {
  const userId = uid(req);
  const folderId = idParam(req);
  const input = parse(folderUpdateSchema, req.body);

  await assertFolderOwned(userId, folderId);

  if (input.parentId !== undefined && input.parentId !== null) {
    if (input.parentId === folderId) {
      throw new HttpError(400, 'A folder cannot be its own parent');
    }
    await assertFolderOwned(userId, input.parentId);
  }

  const folder = await prisma.folder.update({
    where: { id: folderId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId } : {})
    },
    select: { id: true, name: true, parentId: true, createdAt: true }
  });
  await writeAudit(userId, 'folder.update', { folderId });
  res.json(folder);
});

foldersRouter.delete('/:id', async (req: Request, res: Response) => {
  const userId = uid(req);
  const folderId = idParam(req);
  await assertFolderOwned(userId, folderId);
  await prisma.folder.delete({ where: { id: folderId } });
  await writeAudit(userId, 'folder.delete', { folderId });
  res.status(204).end();
});
