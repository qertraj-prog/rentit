'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ListChecks, Users, LogOut,
  ShieldCheck, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './admin.module.css'

const NAV = [
  { href: '/admin',          label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/listings', label: 'Listings',    icon: ListChecks      },
  { href: '/admin/users',    label: 'Users',       icon: Users           },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sideOpen, setSideOpen] = useState(false)

  const handleLogout = async () => {
    // Dev mode — clear cookie via API
    await fetch('/api/admin-auth', { method: 'DELETE' })
    // Prod mode — also sign out Supabase if available
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    router.push('/admin/login')
  }

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sideOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <ShieldCheck size={20} />
            <span>Admin Panel</span>
          </div>
          <button className={styles.sideClose} onClick={() => setSideOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV.map(item => {
            const Icon = item.icon
            const active = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                onClick={() => setSideOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Overlay for mobile */}
      {sideOpen && (
        <div className={styles.overlay} onClick={() => setSideOpen(false)} />
      )}

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSideOpen(true)}>
            <Menu size={22} />
          </button>
          <span className={styles.topbarTitle}>RentIt Admin</span>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
