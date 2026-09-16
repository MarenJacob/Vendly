import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 48; // 48 hours

export async function issueVerificationToken(userId: string) {
  const token = randomBytes(32).toString('hex');
  await prisma.user.update({
    where: { id: userId },
    data: { verifyToken: token, verifyExpiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });
  return token;
}

export async function consumeVerificationToken(token: string) {
  const user = await prisma.user.findUnique({ where: { verifyToken: token } });
  if (!user || !user.verifyExpiresAt || user.verifyExpiresAt < new Date()) return null;
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifiedAt: new Date(), verifyToken: null, verifyExpiresAt: null },
  });
  return user;
}
