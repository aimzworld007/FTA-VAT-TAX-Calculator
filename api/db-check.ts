import { prisma } from '../src/lib/prisma';

type ApiRequest = { method?: string };
type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (payload: Record<string, unknown>) => void };
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed'
    });
  }

  try {
    // `prisma generate` is a build-time step that generates the Prisma client.
    // It does not prove that runtime DATABASE_URL credentials/network are valid.
    // This runtime query verifies that deployed serverless code can reach PostgreSQL.
    await prisma.$queryRaw`SELECT NOW()`;

    return res.status(200).json({
      ok: true,
      message: 'Database connected successfully'
    });
  } catch {
    // Never return raw database errors to avoid leaking credentials or topology.
    await prisma.$disconnect().catch(() => undefined);

    return res.status(500).json({
      ok: false,
      message: 'Database connection failed'
    });
  }
}
