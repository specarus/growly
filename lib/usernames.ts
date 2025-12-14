import { prisma } from "./prisma";

export const normalizeUsername = (input: string) => {
  if (!input) return "";
  return input.trim().replace(/^@/, "").toLowerCase();
};

const sanitizeBase = (input: string) => {
  const trimmed = input.trim().toLowerCase();
  const letters = trimmed.replace(/[^a-z0-9]/g, "");
  return letters.length > 0 ? letters : "user";
};

const randomSuffix = () => {
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return num.toString();
};

const buildUsername = (base: string, suffix: string) => `${base}${suffix}`;

export const generateUniqueUsername = async (name: string) => {
  const base = sanitizeBase(name);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = buildUsername(base, randomSuffix());
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
  }
  // fallback with timestamp if random collisions occur
  const candidate = buildUsername(base, Date.now().toString().slice(-4));
  return candidate;
};

export const ensureUsernameForUser = async (userId: string, name: string) => {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  if (current?.username) {
    return current.username;
  }
  const username = await generateUniqueUsername(name);
  await prisma.user.update({
    where: { id: userId },
    data: { username },
  });
  return username;
};
