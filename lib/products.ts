export type Product = { id:string; slug:string; name:string; category:string; price:number; oldPrice?:number; image:string; video?:string; badge?:string; description:string; sizes?:string[]; stock?:number };
// NOTE: `products` below is DEMO DATA ONLY. It is used solely as a local
// fallback by /api/orders when no DATABASE_URL is configured, so the app
// still runs for local preview without a database. Every customer-facing
// page reads the real catalogue from lib/catalog.ts (Postgres via Prisma)
// instead — see getAllProducts / getProductBySlug / getCategoryNames.
export const products: Product[] = [
{id:'p1',slug:'minimal-leather-sneaker',name:'Minimal Leather Sneaker',category:'Footwear',price:68000,oldPrice:76000,image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',video:'https://cdn.coverr.co/videos/coverr-a-man-wearing-sneakers-1577/1080p.mp4',badge:'New',description:'A clean everyday sneaker designed around comfort, simplicity and an elevated finish.',sizes:['40','41','42','43','44']},
{id:'p2',slug:'structured-everyday-tote',name:'Structured Everyday Tote',category:'Bags',price:54000,image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',badge:'Popular',description:'A versatile structured tote with enough room for your everyday essentials.'},
{id:'p3',slug:'classic-steel-watch',name:'Classic Steel Watch',category:'Watches',price:92000,oldPrice:110000,image:'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85',video:'https://cdn.coverr.co/videos/coverr-a-watch-on-a-wrist-1574/1080p.mp4',description:'Timeless proportions and a polished steel finish for a refined daily look.'},
{id:'p4',slug:'signature-linen-set',name:'Signature Linen Set',category:'Fashion',price:73500,image:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',description:'Relaxed tailoring in breathable linen, made for effortless occasions.'},
{id:'p5',slug:'everyday-scent',name:'Everyday Scent',category:'Beauty',price:38500,image:'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85',video:'https://cdn.coverr.co/videos/coverr-perfume-bottle-1575/1080p.mp4',badge:'Featured',description:'A sophisticated everyday fragrance with a clean, memorable character.'},
{id:'p6',slug:'canvas-weekender',name:'Canvas Weekender',category:'Bags',price:61000,image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85',description:'A durable weekender built for short trips, gym days and spontaneous plans.'},
{id:'p7',slug:'everyday-cotton-shirt',name:'Everyday Cotton Shirt',category:'Fashion',price:42000,image:'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=85',description:'Soft premium cotton with an easy silhouette that works across the week.'},
{id:'p8',slug:'city-runner',name:'City Runner',category:'Footwear',price:79500,image:'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85',video:'https://cdn.coverr.co/videos/coverr-running-shoes-1578/1080p.mp4',badge:'Trending',description:'Lightweight performance-inspired footwear for fast-moving city days.'}
];
export const categories=['All','Fashion','Footwear','Bags','Watches','Beauty'];
export const formatNaira=(n:number)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);
export const getProduct=(slug:string)=>products.find(p=>p.slug===slug);
