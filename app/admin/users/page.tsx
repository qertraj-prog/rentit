'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from '../admin.module.css'

const ROLE_OPTIONS = ['all', 'tenant', 'owner', 'admin']

const TIME_OPTIONS = [
  { id: 'all_time', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last_7_days', label: 'Last 7 Days' },
  { id: 'last_30_days', label: 'Last 30 Days' },
]

const ROLE_BADGE: Record<string, string> = {
  admin:  styles.roleAdmin,
  owner:  styles.roleOwner,
  tenant: styles.roleTenant,
}

export default function AdminUsersPage() {
  const supabase = createClient()
  const [roleFilter, setRoleFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all_time')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('users')
      .select('id, full_name, email, phone, role, is_blocked, created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (roleFilter !== 'all') q = q.eq('role', roleFilter)

    // Time filter logic
    const now = new Date()
    if (timeFilter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      q = q.gte('created_at', today.toISOString())
    } else if (timeFilter === 'yesterday') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      q = q.gte('created_at', yesterday.toISOString()).lt('created_at', today.toISOString())
    } else if (timeFilter === 'last_7_days') {
      const last7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
      q = q.gte('created_at', last7.toISOString())
    } else if (timeFilter === 'last_30_days') {
      const last30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
      q = q.gte('created_at', last30.toISOString())
    }

    const { data } = await q
    setUsers(data ?? [])
    setLoading(false)
  }, [roleFilter, timeFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const setRole = async (id: string, role: string) => {
    await supabase.from('users').update({ role }).eq('id', id)
    fetchUsers()
  }

  const toggleBlock = async (id: string, blocked: boolean) => {
    await supabase.from('users').update({ is_blocked: !blocked }).eq('id', id)
    fetchUsers()
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Users</h1>
        <p className={styles.pageSub}>Manage tenants, owners and admins</p>
      </div>

      {/* Filters Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        
        {/* Role Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginRight: 8 }}>Role</span>
          {ROLE_OPTIONS.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '6px 16px', borderRadius: 999,
                border: roleFilter === r ? '1px solid #FFD600' : '1px solid rgba(255,255,255,0.1)',
                background: roleFilter === r ? 'rgba(255,214,0,0.1)' : 'transparent',
                color: roleFilter === r ? '#FFD600' : 'rgba(255,255,255,0.45)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Time Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginRight: 8 }}>Time</span>
          {TIME_OPTIONS.map(t => (
            <button
              key={t.id}
              onClick={() => setTimeFilter(t.id)}
              style={{
                padding: '6px 16px', borderRadius: 999,
                border: timeFilter === t.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                background: timeFilter === t.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: timeFilter === t.id ? '#3b82f6' : 'rgba(255,255,255,0.45)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableTitle}>
          {users.length} user{users.length !== 1 ? 's' : ''}
        </div>
        {loading ? (
          <div className={styles.loading}>Loading…</div>
        ) : users.length === 0 ? (
          <div className={styles.empty}>No users found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td style={{ color: '#fff', fontWeight: 600 }}>{u.full_name || '—'}</td>
                    <td style={{ fontSize: 12 }}>{u.email || '—'}</td>
                    <td style={{ fontSize: 12 }}>{u.phone || '—'}</td>
                    <td>
                      <span className={`${styles.badge} ${ROLE_BADGE[u.role] ?? ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.is_blocked
                        ? <span className={`${styles.badge} ${styles.badgeRejected}`}>Blocked</span>
                        : <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
                      }
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {new Date(u.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div className={styles.actionRow}>
                        {/* Promote to owner */}
                        {u.role === 'tenant' && (
                          <button className={styles.btnApprove} onClick={() => setRole(u.id, 'owner')}>
                            → Owner
                          </button>
                        )}
                        {/* Make admin */}
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => setRole(u.id, 'admin')}
                            style={{
                              padding: '5px 10px', borderRadius: 7,
                              border: '1px solid rgba(255,214,0,0.3)',
                              background: 'rgba(255,214,0,0.08)',
                              color: '#FFD600', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            → Admin
                          </button>
                        )}
                        {/* Block / Unblock */}
                        {u.is_blocked ? (
                          <button className={styles.btnUnblock} onClick={() => toggleBlock(u.id, true)}>
                            Unblock
                          </button>
                        ) : (
                          <button className={styles.btnBlock} onClick={() => toggleBlock(u.id, false)}>
                            Block
                          </button>
                        )}
                      </div>
                    </td>
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
