import type { VercelResponse } from '@vercel/node';
export const ok = (res: VercelResponse, data: unknown, status = 200) => res.status(status).json(data);
export const fail = (res: VercelResponse, status: number, error: string) => res.status(status).json({ error });
