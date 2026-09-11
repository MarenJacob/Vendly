import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomer } from '@/lib/customer-auth';
import { cleanText } from '@/lib/validation';
export async function PATCH(req:Request){
  const user=await getCustomer(); if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
  try { const b=await req.json(); const name=cleanText(b.name,100); const phone=cleanText(b.phone,30); if(name.length<2)return NextResponse.json({error:'Please enter your name.'},{status:400});
    const updated=await prisma.user.update({where:{id:user.id},data:{name,phone:phone||null}}); return NextResponse.json({user:{id:updated.id,name:updated.name,email:updated.email,phone:updated.phone}});
  } catch{return NextResponse.json({error:'Could not update your profile.'},{status:400});}
}
