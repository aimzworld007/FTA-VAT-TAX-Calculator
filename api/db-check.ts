import { prisma } from "../src/lib/prisma.js";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type VercelRequestLike = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponseLike = {
  status: (code: number) => VercelResponseLike;
  json: (body: JsonValue | Record<string, unknown>) => void;
};

export default async function handler(
  _req: VercelRequestLike,
  res: VercelResponseLike
) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        ok: false,
        message: "DATABASE_URL is missing",
      });
    }

    const result = await prisma.$queryRaw`
      SELECT NOW() as server_time
    `;

    return res.status(200).json({
      ok: true,
      message: "Database connected successfully",
      result,
    });
  } catch (error: any) {
    console.error("DB_CHECK_ERROR", error);

    return res.status(500).json({
      ok: false,
      message: "Database check failed",
      error: error?.message || "Unknown error",
      code: error?.code || null,
    });
  }
}
