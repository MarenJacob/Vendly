import { redirect } from 'next/navigation'; import { getAdminSession } from '@/lib/admin-auth'; import AdminShell from '@/components/admin/AdminShell';
export default async function ProtectedAdminLayout({children}:{children:React.ReactNode}){if(!await getAdminSession())redirect('/admin/login');return <AdminShell>{children}</AdminShell>}
