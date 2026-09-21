import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, paymentConfirmedEmailHtml } from '@/lib/email';

export async function POST(request:Request){
  const secret=process.env.PAYSTACK_SECRET_KEY;
  if(!secret) return NextResponse.json({error:'Webhook is not configured.'},{status:503});
  const raw=await request.text();
  const signature=request.headers.get('x-paystack-signature')??'';
  const hash=crypto.createHmac('sha512',secret).update(raw).digest('hex');
  if(!signature || signature.length!==hash.length || !crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(signature))) return NextResponse.json({error:'Invalid signature.'},{status:401});
  try{
    const event=JSON.parse(raw);
    if(event.event==='charge.success' && event.data?.reference && process.env.DATABASE_URL){
      const reference=String(event.data.reference);
      const order=await prisma.order.findUnique({where:{reference}});
      if(order && order.status!=='PAID'){
        const expected=Math.round(Number(order.total)*100);
        if(Number(event.data.amount)===expected && event.data.currency==='NGN' && String(event.data.customer?.email||'').toLowerCase()===order.email.toLowerCase()){
          await prisma.order.update({where:{id:order.id},data:{status:'PAID',paymentReference:reference,paidAt:event.data.paid_at?new Date(event.data.paid_at):new Date()}});
          try{
            const full=await prisma.order.findUnique({where:{id:order.id},include:{items:{include:{product:true}}}});
            if(full){
              const appUrl=process.env.NEXT_PUBLIC_APP_URL||'';
              await sendEmail(full.email,`Payment confirmed — ${full.reference}`,paymentConfirmedEmailHtml({reference:full.reference,total:Number(full.total),address:full.address,phone:full.phone,items:full.items.map(i=>({quantity:i.quantity,price:Number(i.price),product:{name:i.product.name}}))},`${appUrl}/track?ref=${full.reference}`));
            }
          }catch(e){console.error('[paystack webhook] confirmation email failed:',e);}
        }
      }
    }
    return NextResponse.json({received:true});
  }catch(error){console.error('Paystack webhook processing failed:',error);return NextResponse.json({error:'Invalid webhook payload.'},{status:400});}
}
