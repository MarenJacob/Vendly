import { cookies } from 'next/headers';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';

const COOKIE = 'vendly_customer_session';
const TTL = 60 * 60 * 24 * 30;
function secret(){
  const value = process.env.AUTH_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET must be set in production.');
  }
  return 'dev-only-insecure-secret-do-not-use-in-production';
}
function sign(value:string){ return createHmac('sha256', secret()).update(value).digest('hex'); }
export function hashPassword(password:string){ const salt=randomBytes(16).toString('hex'); const key=scryptSync(password,salt,64).toString('hex'); return `${salt}:${key}`; }
export function verifyPassword(password:string, stored:string){ const [salt,key]=stored.split(':'); if(!salt||!key)return false; const actual=scryptSync(password,salt,64); const expected=Buffer.from(key,'hex'); return expected.length===actual.length && timingSafeEqual(actual,expected); }
export function createCustomerSession(userId:string){ const payload=`${userId}.${Date.now()}`; return `${payload}.${sign(payload)}`; }
export function validCustomerSession(value?:string){ if(!value)return null; const parts=value.split('.'); if(parts.length!==3)return null; const payload=`${parts[0]}.${parts[1]}`, sig=parts[2], expected=sign(payload); if(sig.length!==expected.length||!timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null; if(Date.now()-Number(parts[1])>TTL*1000)return null; return parts[0]; }
export async function getCustomer(){ const store=await cookies(); const id=validCustomerSession(store.get(COOKIE)?.value); if(!id)return null; return prisma.user.findUnique({where:{id}}); }
export { COOKIE, TTL };
