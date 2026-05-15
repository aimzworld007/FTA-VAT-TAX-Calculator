import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../src/lib/prisma";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
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
