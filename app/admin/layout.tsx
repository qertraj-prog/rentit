import type { Metadata } from 'next'
import AdminLayout from './AdminLayout'

export const metadata: Metadata = {
  title: 'Admin Panel | RentIt',
  description: 'RentIt admin dashboard',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}
