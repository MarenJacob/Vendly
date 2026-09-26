import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
export async function GET(){if(!await getAdminSession())return NextResponse.json({error:'Unauthorized'},{status:401});const logs=await prisma.auditLog.findMany({orderBy:{createdAt:'desc'},take:100});return NextResponse.json({logs});}
