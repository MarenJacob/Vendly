import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {getAdminSession} from '@/lib/admin-auth';
import {sendEmail, orderStatusEmailHtml} from '@/lib/email';
const statuses=['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED'] as const;
const transitions:Record<string,string[]>={PENDING:['PAID','CANCELLED'],PAID:['PROCESSING','CANCELLED'],PROCESSING:['SHIPPED','CANCELLED'],SHIPPED:['DELIVERED'],DELIVERED:[],CANCELLED:[]};
export async function GET(){if(!await getAdminSession())return NextResponse.json({error:'Unauthorized'},{status:401});const orders=await prisma.order.findMany({include:{items:{include:{product:true}},user:true},orderBy:{createdAt:'desc'}});return NextResponse.json({orders});}
export async function PATCH(req:Request){const actor=await getAdminSession();if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});try{const b=await req.json();const id=String(b.id||''),next=String(b.status||'');if(!statuses.includes(next as any))return NextResponse.json({error:'Invalid order status.'},{status:400});const current=await prisma.order.findUnique({where:{id},include:{items:true}});if(!current)return NextResponse.json({error:'Order not found.'},{status:404});if(current.status!==next&&!transitions[current.status]?.includes(next))return NextResponse.json({error:`Cannot move ${current.status} to ${next}.`},{status:409});if(current.status===next)return NextResponse.json({order:current});const order=await prisma.$transaction(async tx=>{if(next==='CANCELLED'){for(const item of current.items){await tx.product.update({where:{id:item.productId},data:{stock:{increment:item.quantity}}});await tx.inventoryAdjustment.create({data:{productId:item.productId,orderId:id,quantity:item.quantity,reason:'Cancelled order stock restoration'}})}}const updated=await tx.order.update({where:{id},data:{status:next as any}});await tx.auditLog.create({data:{actor,action:'ORDER_STATUS_CHANGED',entity:'Order',entityId:id,details:JSON.stringify({from:current.status,to:next,reference:current.reference})}});return updated});
if(['PROCESSING','SHIPPED','DELIVERED','CANCELLED'].includes(next)){
  try{
    const full=await prisma.order.findUnique({where:{id},include:{items:{include:{product:true}}}});
    if(full){
      const appUrl=process.env.NEXT_PUBLIC_APP_URL||'';
      await sendEmail(full.email,`Order update — ${full.reference}`,orderStatusEmailHtml({reference:full.reference,total:Number(full.total),address:full.address,phone:full.phone,items:full.items.map(i=>({quantity:i.quantity,price:Number(i.price),product:{name:i.product.name}}))},next,`${appUrl}/track?ref=${full.reference}`));
    }
  }catch(e){console.error('[admin/orders] status email failed:',e);}
}
return NextResponse.json({order});}catch{return NextResponse.json({error:'Could not update order.'},{status:400});}}
