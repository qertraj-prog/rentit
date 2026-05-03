'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useRouter } from 'next/navigation'
import {
  PlusCircle, Eye, Pencil, Trash2, Clock, CheckCircle,
  XCircle, PauseCircle, Home, AlertCircle
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import styles from './owner.module.css'

const STATUS_LABEL: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pending:  { label: 'Pending Review', icon: <Clock size={13} />,       cls: 'pending'  },
  active:   { label: 'Live',           icon: <CheckCircle size={13} />, cls: 'active'   },
  rejected: { label: 'Rejected',       icon: <XCircle size={13} />,     cls: 'rejected' },
  paused:   { label: 'Paused',         icon: <PauseCircle size={13} />, cls: 'paused'   },
  rented:   { label: 'Rented Out',     icon: <Home size={13} />,        cls: 'rented'   },
}

export default function OwnerDashboard() {
  const { user, profile, loading: authLoading } = useUser()
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login?redirect=/dashboard/owner'); return }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('listings')
      .select('*, listing_photos(*)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setListings(data ?? []); setLoading(false) })
  }, [user])

  const handleDelete = async (id: string) => {
    if (!confirm('Kya aap sure hain? Yeh listing permanently delete ho jayegi.')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
    setDeleting(null)
  }

  const counts = {
    total:    listings.length,
    active:   listings.filter(l => l.status === 'active').length,
    pending:  listings.filter(l => l.status === 'pending').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
  }

  if (authLoading || loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading your listings…</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Listings</h1>
          <p className={styles.sub}>Manage all your property listings</p>
        </div>
        <Link href="/list-room" className={`btn btn-primary ${styles.addBtn}`}>
          <PlusCircle size={17} /> Add New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{counts.total}</span>
          <span className={styles.statLbl}>Total</span>
        </div>
        <div className={`${styles.stat} ${styles.statActive}`}>
          <span className={styles.statNum}>{counts.active}</span>
          <span className={styles.statLbl}>Live</span>
        </div>
        <div className={`${styles.stat} ${styles.statPending}`}>
          <span className={styles.statNum}>{counts.pending}</span>
          <span className={styles.statLbl}>Pending</span>
        </div>
        <div className={`${styles.stat} ${styles.statRejected}`}>
          <span className={styles.statNum}>{counts.rejected}</span>
          <span className={styles.statLbl}>Rejected</span>
        </div>
      </div>

      {/* Empty state */}
      {listings.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏠</div>
          <h3>Koi listing nahi hai abhi</h3>
          <p>Apni pehli property list karo aur tenants se connected ho jao!</p>
          <Link href="/list-room" className="btn btn-primary">
            <PlusCircle size={16} /> List Your First Room
          </Link>
        </div>
      )}

      {/* Listings */}
      <div className={styles.listGrid}>
        {listings.map(listing => {
          const status = STATUS_LABEL[listing.status] ?? STATUS_LABEL.pending
          const coverPhoto = listing.listing_photos?.[0]?.photo_url
          const isRejected = listing.status === 'rejected'

          return (
            <div key={listing.id} className={styles.card}>
              {/* Photo */}
              <div className={styles.cardImg}>
                {coverPhoto ? (
                  <img src={coverPhoto} alt={listing.title} />
                ) : (
                  <div className={styles.cardImgPlaceholder}>🏠</div>
                )}
                <span className={`${styles.statusBadge} ${styles[status.cls]}`}>
                  {status.icon} {status.label}
                </span>
              </div>

              {/* Content */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{listing.title}</h3>
                <p className={styles.cardLoc}>
                  📍 {[listing.colony, listing.city].filter(Boolean).join(', ') || 'Location not set'}
                </p>
                <div className={styles.cardMeta}>
                  <span className={styles.cardPrice}>₹{formatPrice(listing.monthly_rent)}<span>/mo</span></span>
                  <span className={styles.cardType}>{listing.room_type?.toUpperCase()}</span>
                </div>

                {/* Rejection reason */}
                {isRejected && listing.rejection_reason && (
                  <div className={styles.rejectionNote}>
                    <AlertCircle size={13} />
                    <span>{listing.rejection_reason}</span>
                  </div>
                )}

                {/* Stats */}
                <div className={styles.cardStats}>
                  <span>👁 {listing.views_count ?? 0} views</span>
                  <span>💬 {listing.inquiries_count ?? 0} inquiries</span>
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  {listing.status === 'active' && (
                    <Link href={`/rooms/${listing.id}`} className={styles.actionView}>
                      <Eye size={14} /> View
                    </Link>
                  )}
                  <button
                    className={styles.actionDelete}
                    onClick={() => handleDelete(listing.id)}
                    disabled={deleting === listing.id}
                  >
                    <Trash2 size={14} />
                    {deleting === listing.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
