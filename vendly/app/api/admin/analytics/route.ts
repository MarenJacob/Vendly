import {NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
export async function GET(){
 if(!await getAdminSession())return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const since=new Date(Date.now()-30*86400000);
  const [orders,paid,products,customers,byStatus,top]=await Promise.all([
   prisma.order.count(),
   prisma.order.aggregate({_sum:{total:true},where:{status:{in:['PAID','PROCESSING','SHIPPED','DELIVERED']}}}),
   prisma.product.count(),prisma.user.count({where:{role:'CUSTOMER'}}),
   prisma.order.groupBy({by:['status'],_count:{_all:true},_sum:{total:true}}),
   prisma.orderItem.groupBy({by:['productId'],_sum:{quantity:true},where:{order:{createdAt:{gte:since},status:{in:['PAID','PROCESSING','SHIPPED','DELIVERED']}}},orderBy:{_sum:{quantity:'desc'}},take:5})
  ]);
  const ids=top.map(x=>x.productId); const productsTop=await prisma.product.findMany({where:{id:{in:ids}},select:{id:true,name:true,price:true}}); const lookup=new Map(productsTop.map(x=>[x.id,x]));
  return NextResponse.json({orders,revenue:Number(paid._sum.total||0),products,customers,byStatus,topProducts:top.map(x=>({...x,product:lookup.get(x.productId)||null}))});
 }catch{return NextResponse.json({orders:0,revenue:0,products:0,customers:0,byStatus:[],topProducts:[]})}
}
