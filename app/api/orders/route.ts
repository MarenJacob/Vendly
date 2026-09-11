import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { products } from '@/lib/products';
import { rateLimit } from '@/lib/rate-limit';
import { getCustomer } from '@/lib/customer-auth';

function reference(){return `VD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;}

export async function POST(request:Request){const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';if(!rateLimit(`order:${ip}`,8,60_000).ok)return NextResponse.json({error:'Too many checkout attempts. Please try again shortly.'},{status:429});
  try{
    const body=await request.json();
    const {customer,items}=body??{};
    if(!customer?.name||!customer?.phone||!customer?.email||!customer?.address) return NextResponse.json({error:'Complete customer details are required.'},{status:400});
    if(!Array.isArray(items)||!items.length) return NextResponse.json({error:'Your cart is empty.'},{status:400});
    if(items.some((item:{id?:string;quantity?:number})=>!item.id||!Number.isFinite(Number(item.quantity))||Number(item.quantity)<1||Number(item.quantity)>20)) return NextResponse.json({error:'One or more cart quantities are invalid.'},{status:400});

    if(process.env.DATABASE_URL){
      const ids=[...new Set(items.map((item:{id:string})=>item.id))];
      const dbProducts=await prisma.product.findMany({where:{id:{in:ids}}});
      const byId=new Map(dbProducts.map(p=>[p.id,p]));
      if(dbProducts.length!==ids.length) return NextResponse.json({error:'One or more products are no longer available.'},{status:409});
      const normalized=items.map((item:{id:string;quantity:number})=>{const product=byId.get(item.id)!;const quantity=Math.floor(Number(item.quantity));if(product.stock<quantity) throw new Error(`${product.name} has insufficient stock.`);return {product,quantity};});
      const total=normalized.reduce((sum,row)=>sum+Number(row.product.price)*row.quantity,0);
      const orderReference=reference();
      const customerUser=await getCustomer();
      const order=await prisma.$transaction(async tx=>{
        for(const {product,quantity} of normalized){
          const changed=await tx.product.updateMany({where:{id:product.id,stock:{gte:quantity}},data:{stock:{decrement:quantity}}});
          if(changed.count!==1) throw new Error(`${product.name} has insufficient stock.`);
        }
        const created=await tx.order.create({data:{reference:orderReference,total,phone:String(customer.phone).trim(),email:String(customer.email).trim().toLowerCase(),address:String(customer.address).trim(),userId:customerUser?.id ?? undefined,items:{create:normalized.map(({product,quantity})=>({productId:product.id,quantity,price:product.price}))}}});
        for(const {product,quantity} of normalized) await tx.inventoryAdjustment.create({data:{productId:product.id,orderId:created.id,quantity:-quantity,reason:'Customer order'}});
        return created;
      });
      return NextResponse.json({reference:order.reference,orderId:order.id,total},{status:201});
    }

    const normalized=items.map((item:{id:string;quantity:number})=>{const product=products.find(p=>p.id===item.id);if(!product)throw new Error(`Product ${item.id} was not found.`);return {product,quantity:Math.floor(Number(item.quantity))};});
    const total=normalized.reduce((sum,row)=>sum+row.product.price*row.quantity,0);
    return NextResponse.json({reference:reference(),total,demo:true},{status:201});
  }catch(error){
    console.error('Order creation failed:',error);
    const message=error instanceof Error&&error.message.includes('insufficient stock')?error.message:'We could not create your order. Please try again.';
    return NextResponse.json({error:message},{status:500});
  }
}
