'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from '../admin.module.css'

const STATUS_OPTIONS = ['all', 'pending', 'active', 'rejected', 'paused', 'rented']

const BADGE: Record<string, string> = {
  pending:  styles.badgePending,
  active:   styles.badgeActive,
  rejected: styles.badgeRejected,
  paused:   styles.badgePaused,
  rented:   styles.badgeRented,
}

export default function AdminListingsPage() {
  const supabase = createClient()
  const [filter, setFilter] = useState('all')
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Reject modal
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('listings')
      .select('id, title, city, room_type, monthly_rent, status, created_at, users(full_name, phone)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setListings(data ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchListings() }, [fetchListings])

  const approve = async (id: string) => {
    await supabase.from('listings').update({ status: 'active' }).eq('id', id)
    fetchListings()
  }

  const confirmReject = async () => {
    if (!rejectId) return
    await supabase
      .from('listings')
      .update({ status: 'rejected', rejection_reason: rejectReason })
      .eq('id', rejectId)
    setRejectId(null)
    setRejectReason('')
    fetchListings()
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Listings</h1>
        <p className={styles.pageSub}>Review, approve and manage all property listings</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
              border: filter === s ? '1px solid #FFD600' : '1px solid rgba(255,255,255,0.1)',
              background: filter === s ? 'rgba(255,214,0,0.1)' : 'transparent',
              color: filter === s ? '#FFD600' : 'rgba(255,255,255,0.45)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableTitle}>
          {listings.length} listing{listings.length !== 1 ? 's' : ''}
        </div>
        {loading ? (
          <div className={styles.loading}>Loading…</div>
        ) : listings.length === 0 ? (
          <div className={styles.empty}>No listings found</div>
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l: any) => (
                  <tr key={l.id}>
                    <td style={{ color: '#fff', fontWeight: 600, maxWidth: 200 }}>
                      <span title={l.title}>{l.title?.length > 40 ? l.title.slice(0, 38) + '…' : l.title}</span>
                    </td>
                    <td>{l.city ?? '—'}</td>
                    <td style={{ textTransform: 'uppercase', fontSize: 11 }}>{l.room_type}</td>
                    <td>₹{Number(l.monthly_rent).toLocaleString('en-IN')}</td>
                    <td>{l.users?.full_name ?? '—'}</td>
                    <td>
                      <span className={`${styles.badge} ${BADGE[l.status] ?? ''}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionRow}>
                        {l.status !== 'active' && (
                          <button className={styles.btnApprove} onClick={() => approve(l.id)}>
                            Approve
                          </button>
                        )}
                        {l.status !== 'rejected' && (
                          <button className={styles.btnReject} onClick={() => { setRejectId(l.id); setRejectReason('') }}>
                            Reject
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

      {/* Reject reason modal */}
      {rejectId && (
        <div className={styles.modal}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>❌ Reject Listing</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Provide a reason (optional — owner will see this)
            </p>
            <textarea
              className={styles.modalTextarea}
              placeholder="e.g. Photos missing, incorrect pricing, duplicate listing…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setRejectId(null)}>Cancel</button>
              <button className={styles.btnConfirmReject} onClick={confirmReject}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
