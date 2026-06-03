import { Router, type Request, type Response } from 'express';
import { writeAudit } from '../audit';
import { prisma } from '../db';
import { HttpError, parse } from '../http';
import { requireAuth, type AuthedRequest } from '../auth/middleware';
import { diagramCreateSchema, diagramListQuerySchema, diagramUpdateSchema } from '../validation';

export const diagramsRouter: Router = Router();

diagramsRouter.use(requireAuth);

const uid = (req: Request): string => (req as AuthedRequest).userId;

// Express 5 types route params as `string | string[]`; for `/:id` it's a string.
const idParam = (req: Request): string => {
  const value = req.params.id;
  return Array.isArray(value) ? value[0] : value;
};

const assertFolderOwned = async (userId: string, folderId: string): Promise<void> => {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId },
    select: { id: true }
  });
  if (!folder) {
    throw new HttpError(404, 'Folder not found');
  }
};

const assertDiagramOwned = async (userId: string, diagramId: string): Promise<void> => {
  const diagram = await prisma.diagram.findFirst({
    where: { id: diagramId, userId },
    select: { id: true }
  });
  if (!diagram) {
    throw new HttpError(404, 'Diagram not found');
  }
};

// List diagram metadata (no payload) for the user, optionally within a folder.
diagramsRouter.get('/', async (req: Request, res: Response) => {
  const userId = uid(req);
  const { folderId } = parse(diagramListQuerySchema, req.query);
  const diagrams = await prisma.diagram.findMany({
    where: { userId, ...(folderId ? { folderId } : {}) },
    select: { id: true, name: true, folderId: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }
  });
  res.json(diagrams);
});

// Full diagram including the serialized payload.
diagramsRouter.get('/:id', async (req: Request, res: Response) => {
  const userId = uid(req);
  const diagram = await prisma.diagram.findFirst({
    where: { id: idParam(req), userId }
  });
  if (!diagram) {
    throw new HttpError(404, 'Diagram not found');
  }
  res.json(diagram);
});

diagramsRouter.post('/', async (req: Request, res: Response) => {
  const userId = uid(req);
  const input = parse(diagramCreateSchema, req.body);

  if (input.folderId) {
    await assertFolderOwned(userId, input.folderId);
  }

  const diagram = await prisma.diagram.create({
    data: {
      userId,
      name: input.name,
      payload: input.payload,
      folderId: input.folderId ?? null
    }
  });
  await writeAudit(userId, 'diagram.create', { diagramId: diagram.id });
  res.status(201).json(diagram);
});

diagramsRouter.patch('/:id', async (req: Request, res: Response) => {
  const userId = uid(req);
  const diagramId = idParam(req);
  const input = parse(diagramUpdateSchema, req.body);

  await assertDiagramOwned(userId, diagramId);

  if (input.folderId !== undefined && input.folderId !== null) {
    await assertFolderOwned(userId, input.folderId);
  }

  const diagram = await prisma.diagram.update({
    where: { id: diagramId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.payload !== undefined ? { payload: input.payload } : {}),
      ...(input.folderId !== undefined ? { folderId: input.folderId } : {})
    }
  });
  await writeAudit(userId, 'diagram.update', { diagramId });
  res.json(diagram);
});

diagramsRouter.delete('/:id', async (req: Request, res: Response) => {
  const userId = uid(req);
  const diagramId = idParam(req);
  await assertDiagramOwned(userId, diagramId);
  await prisma.diagram.delete({ where: { id: diagramId } });
  await writeAudit(userId, 'diagram.delete', { diagramId });
  res.status(204).end();
});
