import type { RequestHandler } from './$types';
import { GET as manifestGet } from '../../manifest.json/+server';

export const GET: RequestHandler = manifestGet;
