import type {NextConfig} from 'next';
const security=[
 {key:'X-Content-Type-Options',value:'nosniff'},
 {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
 {key:'X-Frame-Options',value:'SAMEORIGIN'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
 {key:'X-DNS-Prefetch-Control',value:'on'},
 {key:'Cross-Origin-Opener-Policy',value:'same-origin-allow-popups'},
 ...(process.env.NODE_ENV==='production'?[{key:'Strict-Transport-Security',value:'max-age=31536000; includeSubDomains'}]:[])
];
const nextConfig:NextConfig={images:{remotePatterns:[{protocol:'https',hostname:'images.unsplash.com'},{protocol:'https',hostname:'res.cloudinary.com'}]},async headers(){return [{source:'/(.*)',headers:security},{source:'/api/:path*',headers:[{key:'Cache-Control',value:'no-store'}]}]}};
export default nextConfig;
