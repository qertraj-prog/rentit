'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks/useUser'
import { Search, Heart, MessageCircle, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function TenantDashboard() {
  const { user, profile, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login?redirect=/dashboard'); return }
    // Owners/admins redirect to their dashboards
    if (profile?.role === 'owner') router.push('/dashboard/owner')
    if (profile?.role === 'admin') router.push('/admin')
  }, [user, profile, loading, router])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #FFD600', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fb', padding: '88px 0 60px' }}>
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Sora, sans-serif', color: '#0A1628', margin: 0 }}>
            Welcome, {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>Find your perfect room with RentIt</p>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { icon: <Search size={24} />, title: 'Browse Rooms', desc: 'Find rooms near you', href: '/rooms', color: '#FFD600' },
            { icon: <Heart size={24} />, title: 'Saved Rooms', desc: 'Your saved listings', href: '/rooms', color: '#f43f5e' },
            { icon: <MessageCircle size={24} />, title: 'Inquiries', desc: 'View your enquiries', href: '/rooms', color: '#8b5cf6' },
          ].map(item => (
            <Link key={item.title} href={item.href} style={{
              background: '#fff', borderRadius: 16, padding: 24,
              border: '1px solid rgba(0,0,0,0.07)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12,
              transition: 'transform 0.2s',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color === '#FFD600' ? '#92400e' : item.color }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0A1628', fontSize: 15 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, color: '#0A1628' }}>Your Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Name</span>
              <span style={{ fontWeight: 600, color: '#0A1628', fontSize: 14 }}>{profile?.full_name || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Email</span>
              <span style={{ fontWeight: 600, color: '#0A1628', fontSize: 14 }}>{user?.email || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Phone</span>
              <span style={{ fontWeight: 600, color: '#0A1628', fontSize: 14 }}>{profile?.phone || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Account type</span>
              <span style={{ fontWeight: 600, color: '#0A1628', fontSize: 14, textTransform: 'capitalize' }}>🔍 {profile?.role || 'tenant'}</span>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            marginTop: 20, width: '100%', padding: '12px', borderRadius: 10,
            border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)',
            color: '#dc2626', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    </div>
  )
}
