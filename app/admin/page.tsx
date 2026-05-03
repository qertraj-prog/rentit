import { createClient } from '@/lib/supabase/server'
import styles from './admin.module.css'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Parallel stats fetches
  const [
    { count: totalListings },
    { count: pendingListings },
    { count: activeListings },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  // Recent pending listings
  const { data: pending } = await supabase
    .from('listings')
    .select('id, title, city, room_type, monthly_rent, created_at, users(full_name, phone)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10)

  const STATS = [
    { emoji: '🏠', val: totalListings ?? 0,  label: 'Total Listings' },
    { emoji: '⏳', val: pendingListings ?? 0, label: 'Pending Review' },
    { emoji: '✅', val: activeListings ?? 0,  label: 'Active Listings' },
    { emoji: '👥', val: totalUsers ?? 0,      label: 'Total Users'    },
  ]

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSub}>Overview of RentIt platform activity</p>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {STATS.map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIcon}>{s.emoji}</div>
            <div className={styles.statVal}>{s.val}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending listings quick table */}
      <div className={styles.tableWrap}>
        <div className={styles.tableTitle}>
          ⏳ Pending Listings
          <a href="/admin/listings" style={{ fontSize: 12, color: '#FFD600', textDecoration: 'none' }}>
            View all →
          </a>
        </div>
        {!pending || pending.length === 0 ? (
          <div className={styles.empty}>🎉 No listings pending review</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>City</th>
                  <th>Type</th>
                  <th>Rent</th>
                  <th>Owner</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((l: any) => (
                  <tr key={l.id}>
                    <td style={{ color: '#fff', fontWeight: 600, maxWidth: 220 }}>
                      <a href={`/admin/listings/${l.id}`} style={{ color: '#FFD600', textDecoration: 'none' }}>
                        {l.title}
                      </a>
                    </td>
                    <td>{l.city ?? '—'}</td>
                    <td style={{ textTransform: 'uppercase', fontSize: 11 }}>{l.room_type}</td>
                    <td>₹{Number(l.monthly_rent).toLocaleString('en-IN')}</td>
                    <td>{(l.users as any)?.full_name ?? '—'}</td>
                    <td>{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
