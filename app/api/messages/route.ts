import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomer } from '@/lib/customer-auth';
import { cleanText, validEmail } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail, supportMessageAdminEmailHtml } from '@/lib/email';
export async function POST(req:Request){
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'; const gate=rateLimit(`message:${ip}`,5,60_000); if(!gate.ok)return NextResponse.json({error:'Too many messages. Please try again shortly.'},{status:429});
  try{const b=await req.json();const name=cleanText(b.name,100),phone=cleanText(b.phone,30),email=validEmail(b.email),message=cleanText(b.message,2000),productId=b.productId?cleanText(b.productId,80):undefined; if(name.length<2||phone.length<7||message.length<5)return NextResponse.json({error:'Please complete your contact details and message.'},{status:400}); const user=await getCustomer(); const created=await prisma.message.create({data:{name,phone,email:email||null,message,userId:user?.id,productId:productId||undefined}});
  try{
    const adminInbox=process.env.GMAIL_USER;
    if(adminInbox){
      const product=productId?await prisma.product.findUnique({where:{id:productId},select:{name:true}}):null;
      await sendEmail(adminInbox,`New Vendly message from ${name}`,supportMessageAdminEmailHtml({name,phone,email,message,productName:product?.name}),email||undefined);
    }
  }catch(e){console.error('[messages] admin notification failed:',e);}
  return NextResponse.json({ok:true,id:created.id},{status:201});}catch{return NextResponse.json({error:'We could not send your message.'},{status:500});}
}
