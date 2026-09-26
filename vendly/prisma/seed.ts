import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const catalog = [
  { id:'p1', slug:'minimal-leather-sneaker', name:'Minimal Leather Sneaker', category:'Footwear', price:68000, oldPrice:76000, image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85', description:'A clean everyday sneaker designed around comfort, simplicity and an elevated finish.', featured:true },
  { id:'p2', slug:'structured-everyday-tote', name:'Structured Everyday Tote', category:'Bags', price:54000, image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85', description:'A versatile structured tote with enough room for your everyday essentials.', featured:true },
  { id:'p3', slug:'classic-steel-watch', name:'Classic Steel Watch', category:'Watches', price:92000, oldPrice:110000, image:'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85', description:'Timeless proportions and a polished steel finish for a refined daily look.', featured:true },
  { id:'p4', slug:'signature-linen-set', name:'Signature Linen Set', category:'Fashion', price:73500, image:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85', description:'Relaxed tailoring in breathable linen, made for effortless occasions.' },
  { id:'p5', slug:'everyday-scent', name:'Everyday Scent', category:'Beauty', price:38500, image:'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85', description:'A sophisticated everyday fragrance with a clean, memorable character.', featured:true },
  { id:'p6', slug:'canvas-weekender', name:'Canvas Weekender', category:'Bags', price:61000, image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85', description:'A durable weekender built for short trips, gym days and spontaneous plans.' },
  { id:'p7', slug:'everyday-cotton-shirt', name:'Everyday Cotton Shirt', category:'Fashion', price:42000, image:'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=85', description:'Soft premium cotton with an easy silhouette that works across the week.' },
  { id:'p8', slug:'city-runner', name:'City Runner', category:'Footwear', price:79500, image:'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85', description:'Lightweight performance-inspired footwear for fast-moving city days.' },
];

async function main() {
  for (const name of ['Fashion','Footwear','Bags','Watches','Beauty']) {
    await prisma.category.upsert({ where:{slug:name.toLowerCase()}, update:{name}, create:{name,slug:name.toLowerCase()} });
  }
  for (const item of catalog) {
    const category = await prisma.category.findUniqueOrThrow({where:{slug:item.category.toLowerCase()}});
    await prisma.product.upsert({
      where:{id:item.id},
      update:{name:item.name,slug:item.slug,description:item.description,price:item.price,oldPrice:item.oldPrice,featured:item.featured??false,categoryId:category.id,stock:100},
      create:{id:item.id,name:item.name,slug:item.slug,description:item.description,price:item.price,oldPrice:item.oldPrice,featured:item.featured??false,categoryId:category.id,stock:100,images:{create:{url:item.image,alt:item.name}}}
    });
  }
  console.log('Vendly catalog seeded.');
}

main().catch(console.error).finally(()=>prisma.$disconnect());
