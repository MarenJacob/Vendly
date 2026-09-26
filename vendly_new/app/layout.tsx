import type {Metadata} from 'next'; import {Inter} from 'next/font/google'; import './globals.css';
const inter=Inter({subsets:['latin'],variable:'--font-inter',display:'swap'});
export const metadata:Metadata={title:{default:'Vendly — Shop with confidence',template:'%s — Vendly'},description:'A modern Nigerian online storefront for discovering products, secure checkout and human support.',metadataBase:new URL(process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000'),openGraph:{title:'Vendly — Shop with confidence',description:'Discover products, shop securely and get human support.',type:'website',siteName:'Vendly'},robots:{index:true,follow:true}};
export const viewport={themeColor:'#061426'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={inter.variable}><body>{children}</body></html>}
