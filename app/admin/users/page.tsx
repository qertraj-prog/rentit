'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from '../admin.module.css'

const ROLE_OPTIONS = ['all', 'tenant', 'owner', 'admin']

const ROLE_BADGE: Record<string, string> = {
  admin:  styles.roleAdmin,
  owner:  styles.roleOwner,
  tenant: styles.roleTenant,
}

export default function AdminUsersPage() {
  const supabase = createClient()
  const [roleFilter, setRoleFilter] = useState('all')
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
    const { data } = await q
    setUsers(data ?? [])
    setLoading(false)
  }, [roleFilter])

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

      {/* Role filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {ROLE_OPTIONS.map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
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
