import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { sendEmail, paymentConfirmedEmailHtml } from '@/lib/email';
export async function GET(request:Request){const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';if(!rateLimit(`payverify:${ip}`,30,60_000).ok)return NextResponse.json({error:'Too many verification requests. Please try again shortly.'},{status:429});const secret=process.env.PAYSTACK_SECRET_KEY;if(!secret)return NextResponse.json({error:'Payment verification is not configured.'},{status:503});try{const reference=new URL(request.url).searchParams.get('reference');if(!reference)return NextResponse.json({error:'Missing payment reference.'},{status:400});const response=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,{headers:{Authorization:`Bearer ${secret}`},cache:'no-store'});const data=await response.json();if(!response.ok||!data.status)return NextResponse.json({error:data.message||'Verification failed.'},{status:502});const tx=data.data;const order=await prisma.order.findFirst({where:{OR:[{paymentReference:reference},{reference:String(tx.metadata?.orderReference||'')} ]}});if(!order)return NextResponse.json({error:'Order not found.'},{status:404});const expected=Math.round(Number(order.total)*100);const valid=tx.status==='success'&&Number(tx.amount)===expected&&tx.currency==='NGN'&&String(tx.customer?.email||'').toLowerCase()===order.email.toLowerCase();if(!valid)return NextResponse.json({error:'Payment could not be verified.'},{status:409});
const wasAlreadyPaid=order.status==='PAID';
const updated=wasAlreadyPaid?order:await prisma.order.update({where:{id:order.id},data:{status:'PAID',paymentReference:reference,paidAt:tx.paid_at?new Date(tx.paid_at):new Date()}});
if(!wasAlreadyPaid){
  try{
    const full=await prisma.order.findUnique({where:{id:order.id},include:{items:{include:{product:true}}}});
    if(full){
      const appUrl=process.env.NEXT_PUBLIC_APP_URL||'';
      await sendEmail(full.email,`Payment confirmed — ${full.reference}`,paymentConfirmedEmailHtml({reference:full.reference,total:full.total,address:full.address,phone:full.phone,items:full.items.map(i=>({quantity:i.quantity,price:i.price,product:{name:i.product.name}}))},`${appUrl}/track?ref=${full.reference}`));
    }
  }catch(e){console.error('[paystack verify] confirmation email failed:',e);}
}
return NextResponse.json({verified:true,reference:updated.reference,status:updated.status,amount:expected});}catch(error){console.error('Paystack verification failed:',error);return NextResponse.json({error:'Unable to verify payment.'},{status:500});}}
