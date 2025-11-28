import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const engineFileByPlatform: Record<string, string> = {
  linux: "libquery_engine-rhel-openssl-3.0.x.so.node",
  win32: "query_engine-windows.dll.node",
};

const engineFile = engineFileByPlatform[process.platform];
if (engineFile) {
  const customEnginePath = join(
    process.cwd(),
    "lib",
    "generated",
    "prisma",
    engineFile
  );
  if (existsSync(customEnginePath)) {
    process.env.PRISMA_QUERY_ENGINE_BINARY ??= customEnginePath;
  }
}

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
