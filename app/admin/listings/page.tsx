'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  X, MapPin, Phone, User, Home, Check, XCircle,
  Zap, Droplets, Car, UtensilsCrossed, PawPrint,
  Clock, Ruler, Building, ChevronLeft, ChevronRight
} from 'lucide-react'
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
  const [selected, setSelected] = useState<any | null>(null) // full detail modal
  const [imgIdx, setImgIdx] = useState(0)

  // Reject modal
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('listings')
      .select(`
        *,
        users(full_name, phone, email, profile_photo_url),
        listing_photos(photo_url, sort_order, is_cover)
      `)
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
    setSelected((prev: any) => prev?.id === id ? { ...prev, status: 'active' } : prev)
    fetchListings()
  }

  const confirmReject = async () => {
    if (!rejectId) return
    await supabase
      .from('listings')
      .update({ status: 'rejected', rejection_reason: rejectReason })
      .eq('id', rejectId)
    setSelected((prev: any) => prev?.id === rejectId ? { ...prev, status: 'rejected', rejection_reason: rejectReason } : prev)
    setRejectId(null)
    setRejectReason('')
    fetchListings()
  }

  const openDetail = (l: any) => {
    setSelected(l)
    setImgIdx(0)
  }

  const photos = selected?.listing_photos
    ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
    ?.map((p: any) => p.photo_url) ?? []

  const fmt = (n: number) => n?.toLocaleString('en-IN')

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Listings</h1>
        <p className={styles.pageSub}>Click any listing to see full details</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 16px', borderRadius: 999,
              border: filter === s ? '1px solid #FFD600' : '1px solid rgba(255,255,255,0.1)',
              background: filter === s ? 'rgba(255,214,0,0.1)' : 'transparent',
              color: filter === s ? '#FFD600' : 'rgba(255,255,255,0.45)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableTitle}>{listings.length} listing{listings.length !== 1 ? 's' : ''} — click any row for full details</div>
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
                  <tr
                    key={l.id}
                    onClick={() => openDetail(l)}
                    style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ color: '#fff', fontWeight: 600, maxWidth: 200 }}>
                      <span title={l.title}>{l.title?.length > 40 ? l.title.slice(0, 38) + '…' : l.title}</span>
                    </td>
                    <td>{l.city ?? '—'}</td>
                    <td style={{ textTransform: 'uppercase', fontSize: 11 }}>{l.room_type}</td>
                    <td>₹{fmt(l.monthly_rent)}</td>
                    <td>{l.users?.full_name ?? '—'}</td>
                    <td>
                      <span className={`${styles.badge} ${BADGE[l.status] ?? ''}`}>{l.status}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className={styles.actionRow}>
                        {l.status !== 'active' && (
                          <button className={styles.btnApprove} onClick={() => approve(l.id)}>✓ Approve</button>
                        )}
                        {l.status !== 'rejected' && (
                          <button className={styles.btnReject} onClick={() => { setRejectId(l.id); setRejectReason('') }}>✕ Reject</button>
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

      {/* ===== FULL DETAIL MODAL ===== */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
            overflowY: 'auto', padding: '24px 16px',
          }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
        >
          <div style={{
            maxWidth: 860, margin: '0 auto',
            background: '#0D1E36',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}>

            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>
                  {selected.title}
                </h2>
                <span className={`${styles.badge} ${BADGE[selected.status] ?? ''}`} style={{ marginTop: 6, display: 'inline-block' }}>
                  {selected.status}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: 10, cursor: 'pointer', color: '#fff' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Photos */}
            {photos.length > 0 ? (
              <div style={{ position: 'relative', background: '#000', height: 340 }}>
                <img
                  src={photos[imgIdx]}
                  alt={`Photo ${imgIdx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx(p => (p - 1 + photos.length) % photos.length)}
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    ><ChevronLeft size={20} /></button>
                    <button
                      onClick={() => setImgIdx(p => (p + 1) % photos.length)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    ><ChevronRight size={20} /></button>
                    <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                      {photos.map((_: any, i: number) => (
                        <button key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? 20 : 8, height: 8, borderRadius: 4, background: i === imgIdx ? '#FFD600' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
                      ))}
                    </div>
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
                      {imgIdx + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                📷 No photos uploaded
              </div>
            )}

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div style={{ display: 'flex', gap: 8, padding: '12px 24px', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {photos.map((url: string, i: number) => (
                  <img
                    key={i}
                    src={url}
                    onClick={() => setImgIdx(i)}
                    style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: i === imgIdx ? '2px solid #FFD600' : '2px solid transparent', flexShrink: 0 }}
                    alt={`thumb ${i+1}`}
                  />
                ))}
              </div>
            )}

            {/* Content */}
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

              {/* ── Pricing */}
              <Section title="💰 Pricing">
                <Row label="Monthly Rent"    value={`₹${fmt(selected.monthly_rent)}/mo`} bold />
                <Row label="Security Deposit" value={`₹${fmt(selected.security_deposit)}`} />
                <Row label="Available From"  value={selected.available_from ? new Date(selected.available_from).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Immediately'} />
                <Row label="Notice Period"   value={`${selected.notice_period_days ?? 30} days`} />
              </Section>

              {/* ── Location */}
              <Section title="📍 Location">
                <Row label="Address"   value={selected.address ?? '—'} />
                <Row label="Colony"    value={selected.colony ?? '—'} />
                <Row label="Landmark"  value={selected.landmark ?? '—'} />
                <Row label="City"      value={selected.city ?? '—'} />
                <Row label="State"     value={selected.state ?? '—'} />
                <Row label="Pincode"   value={selected.pincode ?? '—'} />
              </Section>

              {/* ── Room Details */}
              <Section title="🏠 Room Details">
                <Row label="Room Type"    value={selected.room_type?.toUpperCase()} />
                <Row label="Gender"       value={selected.gender_preference ?? 'any'} />
                <Row label="Size"         value={selected.room_size_sqft ? `${selected.room_size_sqft} sq ft` : '—'} />
                <Row label="Floor"        value={selected.floor_number != null ? `${selected.floor_number} / ${selected.total_floors ?? '?'}` : '—'} />
                <Row label="Furnishing"   value={selected.furnishing_type ?? '—'} />
                <Row label="Bathroom"     value={selected.bathroom_type ?? '—'} />
              </Section>

              {/* ── Amenities */}
              <Section title="✨ Amenities & Facilities">
                <Row label="Electricity"  value={selected.electricity_included ? '✅ Included' : '❌ Extra'} />
                <Row label="Water"        value={selected.water_supply ?? '—'} />
                <Row label="Parking"      value={selected.parking ? '✅ Available' : '❌ No'} />
                <Row label="Food"         value={selected.food_available ? `✅ ${selected.food_type ?? ''}` : '❌ No'} />
                <Row label="Pets"         value={selected.pets_allowed ? '✅ Allowed' : '❌ Not allowed'} />
                {selected.amenities?.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>EXTRAS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selected.amenities.map((a: string) => (
                        <span key={a} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,214,0,0.12)', color: '#FFD600', fontWeight: 600 }}>{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              {/* ── Owner */}
              <Section title="👤 Owner Info">
                <Row label="Name"    value={selected.users?.full_name ?? '—'} />
                <Row label="Phone"   value={selected.users?.phone ?? '—'} />
                <Row label="Email"   value={selected.users?.email ?? '—'} />
              </Section>

              {/* ── Meta */}
              <Section title="📊 Listing Stats">
                <Row label="Submitted"   value={new Date(selected.created_at).toLocaleString('en-IN')} />
                <Row label="Views"       value={selected.views_count ?? 0} />
                <Row label="Inquiries"   value={selected.inquiries_count ?? 0} />
                {selected.rejection_reason && <Row label="Reject Reason" value={selected.rejection_reason} red />}
              </Section>
            </div>

            {/* Description */}
            {selected.description && (
              <div style={{ padding: '0 24px 20px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8, letterSpacing: 1 }}>DESCRIPTION</div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7, margin: 0, background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10 }}>
                  {selected.description}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ padding: '16px 24px 24px', display: 'flex', gap: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {selected.status !== 'active' && (
                <button
                  className={styles.btnApprove}
                  onClick={() => approve(selected.id)}
                  style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: 15 }}
                >
                  ✅ Approve — Make Live
                </button>
              )}
              {selected.status !== 'rejected' && (
                <button
                  className={styles.btnReject}
                  onClick={() => { setRejectId(selected.id); setRejectReason('') }}
                  style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: 15 }}
                >
                  ❌ Reject
                </button>
              )}
              {selected.status === 'active' && (
                <div style={{ flex: 1, textAlign: 'center', padding: 14, borderRadius: 10, background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontWeight: 700 }}>
                  ✅ This listing is LIVE on website
                </div>
              )}
              <button
                onClick={async () => {
                  if (confirm('Kya aap sure hain? Ye listing permanently delete ho jayegi.')) {
                    await supabase.from('listings').delete().eq('id', selected.id)
                    setSelected(null)
                    fetchListings()
                  }
                }}
                style={{
                  padding: '14px', borderRadius: 10, border: '1px solid rgba(220,38,38,0.3)',
                  background: 'rgba(220,38,38,0.1)', color: '#f87171', fontWeight: 700, cursor: 'pointer'
                }}
              >
                🗑️ Delete Listing
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className={styles.modal}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>❌ Reject Listing</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px' }}>
              Reason batao (owner ko dikhega)
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

// ── Helper components ────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function Row({ label, value, bold, red }: { label: string; value: any; bold?: boolean; red?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: red ? '#f87171' : 'rgba(255,255,255,0.85)', textAlign: 'right' }}>{value ?? '—'}</span>
    </div>
  )
}
