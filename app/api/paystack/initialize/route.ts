import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
export async function POST(request: Request) {const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';if(!rateLimit(`payinit:${ip}`,12,60_000).ok)return NextResponse.json({error:'Too many payment attempts. Please try again shortly.'},{status:429});
  const secret=process.env.PAYSTACK_SECRET_KEY;
  if(!secret) return NextResponse.json({error:'Payment is not configured.'},{status:503});
  try {
    const body=await request.json();
    const email=String(body?.email||'').trim().toLowerCase();
    const orderReference=String(body?.reference||'').trim();
    if(!email||!orderReference) return NextResponse.json({error:'Payment details are incomplete.'},{status:400});
    if(!process.env.DATABASE_URL) return NextResponse.json({error:'A live database is required for payment.'},{status:503});
    const order=await prisma.order.findUnique({where:{reference:orderReference}});
    if(!order||order.email!==email) return NextResponse.json({error:'Order could not be verified.'},{status:404});
    if(order.status==='PAID') return NextResponse.json({error:'This order is already paid.'},{status:409});
    const amount=Math.round(Number(order.total)*100);
    const callback=`${process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000'}/checkout/verify`;
    const response=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({email,amount,currency:'NGN',callback_url:callback,metadata:{orderReference}}),cache:'no-store'});
    const data=await response.json();
    if(!response.ok||!data.status) return NextResponse.json({error:data.message||'Paystack could not initialize the transaction.'},{status:502});
    await prisma.order.update({where:{id:order.id},data:{paymentReference:String(data.data.reference)}});
    return NextResponse.json({authorizationUrl:data.data.authorization_url,reference:data.data.reference});
  } catch(error){console.error('Paystack initialization failed:',error);return NextResponse.json({error:'Unable to initialize payment.'},{status:500});}
}
