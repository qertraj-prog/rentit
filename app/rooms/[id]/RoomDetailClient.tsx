'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Phone, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight,
  X, MapPin, Calendar, Ruler, Building, Zap, Droplets, Car,
  UtensilsCrossed, PawPrint, Clock, ArrowLeft, Flag, Copy, Check
} from 'lucide-react'
import RoomCard from '@/components/RoomCard'
import {
  Listing, formatPrice, getListingImages, ROOM_TYPE_LABELS,
  GENDER_LABELS, FURNISHING_LABELS, AMENITY_CONFIG
} from '@/lib/utils'
import styles from './RoomDetailClient.module.css'

interface RoomDetailClientProps {
  listing: Listing
  similar: Listing[]
}

export default function RoomDetailClient({ listing, similar }: RoomDetailClientProps) {
  const images = getListingImages(listing)
  const [currentImg, setCurrentImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  // Save to recently viewed
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rentit_recent')
      const recent: Listing[] = raw ? JSON.parse(raw) : []
      const filtered = recent.filter(r => r.id !== listing.id)
      filtered.unshift(listing)
      localStorage.setItem('rentit_recent', JSON.stringify(filtered.slice(0, 6)))
    } catch {}
  }, [listing])

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return
    if (e.key === 'ArrowRight') setCurrentImg(p => (p + 1) % images.length)
    if (e.key === 'ArrowLeft') setCurrentImg(p => (p - 1 + images.length) % images.length)
    if (e.key === 'Escape') setLightboxOpen(false)
  }, [lightboxOpen, images.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: listing.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const whatsappMsg = encodeURIComponent(
    `Hi, I saw your room on RentIt. Is "${listing.title}" still available? Please let me know the details.`
  )
  const whatsappUrl = listing.users?.phone
    ? `https://wa.me/91${listing.users.phone.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`
    : `https://wa.me/?text=${whatsappMsg}`

  const ownerPhone = listing.users?.phone || 'Not available'

  // Info rows
  const infoRows = [
    { icon: <Ruler size={16} />, label: 'Room Size', value: listing.room_size_sqft ? `${listing.room_size_sqft} sq ft` : 'N/A' },
    { icon: <Building size={16} />, label: 'Floor', value: listing.floor_number != null && listing.total_floors != null ? `${listing.floor_number} of ${listing.total_floors} floors` : listing.floor_number != null ? `Floor ${listing.floor_number}` : 'N/A' },
    { icon: <Zap size={16} />, label: 'Electricity', value: listing.electricity_included ? 'Included in rent' : 'Extra (metered)' },
    { icon: <Droplets size={16} />, label: 'Water Supply', value: listing.water_supply === '24x7' ? '24×7 supply' : 'Limited hours' },
    { icon: <Car size={16} />, label: 'Parking', value: listing.parking ? 'Available' : 'Not available' },
    { icon: <UtensilsCrossed size={16} />, label: 'Food', value: listing.food_available ? `Available (${listing.food_type || 'ask owner'})` : 'Not included' },
    { icon: <PawPrint size={16} />, label: 'Pets', value: listing.pets_allowed ? 'Allowed' : 'Not allowed' },
    { icon: <Clock size={16} />, label: 'Notice Period', value: listing.notice_period_days ? `${listing.notice_period_days} days` : 'N/A' },
  ]

  const memberSince = listing.users?.created_at
    ? new Date(listing.users.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently joined'

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Back button */}
        <Link href="/rooms" className={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Search
        </Link>
      </div>

      {/* ============ PHOTO GALLERY ============ */}
      <div className={styles.gallerySection}>
        <div className="container">
          <div className={styles.galleryGrid}>
            {/* Main photo */}
            <div className={styles.mainPhoto} onClick={() => setLightboxOpen(true)}>
              <img src={images[0]} alt={listing.title} className={styles.mainImg} />
              <div className={styles.photoOverlay}>
                <span className={styles.viewAllPhotos}>📸 View All {images.length} Photos</span>
              </div>
            </div>

            {/* Thumbnail grid */}
            {images.length > 1 && (
              <div className={styles.thumbGrid}>
                {images.slice(1, 5).map((img, i) => (
                  <div
                    key={i}
                    className={`${styles.thumb} ${i === 3 && images.length > 5 ? styles.thumbMore : ''}`}
                    onClick={() => { setCurrentImg(i + 1); setLightboxOpen(true); }}
                  >
                    <img src={img} alt={`Photo ${i + 2}`} className={styles.thumbImg} />
                    {i === 3 && images.length > 5 && (
                      <div className={styles.thumbMoreOverlay}>+{images.length - 5}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="container">
        <div className={styles.contentGrid}>
          {/* Left — Room details */}
          <div className={styles.detailCol}>
            {/* Title + action row */}
            <div className={styles.titleRow}>
              <div>
                <div className={styles.badgeRow}>
                  <span className="badge badge-yellow">{ROOM_TYPE_LABELS[listing.room_type]}</span>
                  <span className={`badge ${listing.gender_preference === 'girls' ? 'badge-girls' : listing.gender_preference === 'boys' ? 'badge-boys' : 'badge-outline'}`}>
                    {GENDER_LABELS[listing.gender_preference]}
                  </span>
                  <span className="badge badge-success">Active</span>
                </div>
                <h1 className={styles.title}>{listing.title}</h1>
                <div className={styles.locationRow}>
                  <MapPin size={15} />
                  <span>{listing.address || [listing.colony, listing.city, listing.state].filter(Boolean).join(', ')}</span>
                </div>
              </div>
              <div className={styles.titleActions}>
                <button
                  className={`${styles.actionBtn} ${saved ? styles.actionBtnSaved : ''}`}
                  onClick={() => setSaved(v => !v)}
                  aria-label={saved ? 'Remove from saved' : 'Save room'}
                >
                  <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
                </button>
                <button className={styles.actionBtn} onClick={handleShare} aria-label="Share room">
                  {copied ? <Check size={20} color="var(--success)" /> : <Share2 size={20} />}
                </button>
                <button className={styles.actionBtn} aria-label="Report listing">
                  <Flag size={20} />
                </button>
              </div>
            </div>

            {/* Price card */}
            <div className={styles.priceCard}>
              <div>
                <div className={styles.priceMain}>
                  <span className={styles.priceCurrency}>₹</span>
                  <span className={styles.priceAmount}>{formatPrice(listing.monthly_rent)}</span>
                  <span className={styles.priceUnit}>/month</span>
                </div>
                <div className={styles.depositLine}>
                  Security Deposit: <strong>₹{formatPrice(listing.security_deposit)}</strong>
                </div>
              </div>
              <div className={styles.availRow}>
                <Calendar size={15} />
                <span>Available from {listing.available_from
                  ? new Date(listing.available_from).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Immediately'
                }</span>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>About this room</h2>
                <p className={styles.description}>{listing.description}</p>
              </div>
            )}

            {/* Room Details */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Room Details</h2>
              <div className={styles.infoGrid}>
                {infoRows.map(row => (
                  <div key={row.label} className={styles.infoRow}>
                    <div className={styles.infoIcon}>{row.icon}</div>
                    <div>
                      <div className={styles.infoLabel}>{row.label}</div>
                      <div className={styles.infoValue}>{row.value}</div>
                    </div>
                  </div>
                ))}
                <div className={styles.infoRow}>
                  <div className={styles.infoIcon}><Building size={16} /></div>
                  <div>
                    <div className={styles.infoLabel}>Furnishing</div>
                    <div className={styles.infoValue}>{FURNISHING_LABELS[listing.furnishing_type]}</div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoIcon}>🚿</div>
                  <div>
                    <div className={styles.infoLabel}>Bathroom</div>
                    <div className={styles.infoValue}>{listing.bathroom_type === 'attached' ? 'Attached' : 'Shared'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Amenities</h2>
                <div className={styles.amenityGrid}>
                  {listing.amenities.map(key => {
                    const cfg = AMENITY_CONFIG[key]
                    return cfg ? (
                      <div key={key} className={styles.amenityItem}>
                        <span className={styles.amenityIcon}>{cfg.icon}</span>
                        <span className={styles.amenityLabel}>{cfg.label}</span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Map */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Location</h2>
              {listing.latitude && listing.longitude ? (
                <div className={styles.mapWrap}>
                  <iframe
                    title="Room Location Map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.longitude - 0.01}%2C${listing.latitude - 0.01}%2C${listing.longitude + 0.01}%2C${listing.latitude + 0.01}&layer=mapnik&marker=${listing.latitude}%2C${listing.longitude}`}
                    className={styles.mapIframe}
                    loading="lazy"
                  />
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=15/${listing.latitude}/${listing.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapLink}
                  >
                    Open in Maps ↗
                  </a>
                </div>
              ) : (
                <div className={styles.mapPlaceholder}>
                  <MapPin size={24} />
                  <p>{listing.address || listing.city}</p>
                  <p className="text-sm text-muted">{listing.landmark}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right — Sticky owner card + CTA */}
          <aside className={styles.sideCol}>
            <div className={styles.ownerCard}>
              {/* Owner */}
              <div className={styles.ownerHeader}>
                <div className={styles.ownerAvatar}>
                  {listing.users?.profile_photo_url ? (
                    <img src={listing.users.profile_photo_url} alt="Owner" className={styles.ownerAvatarImg} />
                  ) : (
                    <span className={styles.ownerAvatarPlaceholder}>
                      {(listing.users?.full_name || 'O').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className={styles.ownerName}>{listing.users?.full_name || 'Room Owner'}</div>
                  <div className={styles.ownerMeta}>Member since {memberSince}</div>
                  <div className={styles.ownerMeta}>⭐ 4.8 · Response rate: 95%</div>
                </div>
              </div>

              <div className={styles.divider} />

              {/* Contact buttons */}
              <div className={styles.ctaButtons}>
                <a
                  href={`tel:${ownerPhone}`}
                  className={`btn btn-primary btn-lg w-full ${styles.callBtn}`}
                  id="call-owner-btn"
                >
                  <Phone size={18} />
                  {ownerPhone !== 'Not available' ? `Call Owner: ${ownerPhone}` : 'Call Owner'}
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn ${styles.waBtn}`}
                  id="whatsapp-btn"
                >
                  <MessageCircle size={18} />
                  WhatsApp Owner
                </a>
              </div>

              <div className={styles.divider} />

              {/* Quick facts */}
              <div className={styles.quickFacts}>
                <div className={styles.quickFact}>
                  <span className={styles.quickFactLabel}>Monthly Rent</span>
                  <span className={styles.quickFactValue}>₹{formatPrice(listing.monthly_rent)}</span>
                </div>
                <div className={styles.quickFact}>
                  <span className={styles.quickFactLabel}>Security</span>
                  <span className={styles.quickFactValue}>₹{formatPrice(listing.security_deposit)}</span>
                </div>
                <div className={styles.quickFact}>
                  <span className={styles.quickFactLabel}>Notice</span>
                  <span className={styles.quickFactValue}>{listing.notice_period_days} days</span>
                </div>
                <div className={styles.quickFact}>
                  <span className={styles.quickFactLabel}>Bathroom</span>
                  <span className={styles.quickFactValue}>{listing.bathroom_type === 'attached' ? 'Attached' : 'Shared'}</span>
                </div>
              </div>

              <div className={styles.safetyNote}>
                🔒 Your contact details are private. Only the owner can see your name.
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Rooms */}
        {similar.length > 0 && (
          <section className={styles.similarSection}>
            <div className="section-header">
              <div>
                <h2>Similar Rooms</h2>
                <p className="text-muted mt-1">You might also like these</p>
              </div>
              <Link href={`/rooms?type=${listing.room_type}&q=${listing.city}`} className="btn btn-outline btn-sm">
                See More
              </Link>
            </div>
            <div className="grid-auto">
              {similar.map(l => <RoomCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className={styles.lightbox} role="dialog" aria-modal aria-label="Photo gallery">
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Close gallery">
            <X size={24} />
          </button>
          <button
            className={`${styles.lightboxNav} ${styles.lightboxNavLeft}`}
            onClick={() => setCurrentImg(p => (p - 1 + images.length) % images.length)}
            aria-label="Previous photo"
          >
            <ChevronLeft size={28} />
          </button>
          <div className={styles.lightboxImgWrap}>
            <img src={images[currentImg]} alt={`Photo ${currentImg + 1}`} className={styles.lightboxImg} />
          </div>
          <button
            className={`${styles.lightboxNav} ${styles.lightboxNavRight}`}
            onClick={() => setCurrentImg(p => (p + 1) % images.length)}
            aria-label="Next photo"
          >
            <ChevronRight size={28} />
          </button>
          <div className={styles.lightboxDots}>
            {images.map((_, i) => (
              <button
                key={i}
                className={`${styles.lightboxDot} ${i === currentImg ? styles.lightboxDotActive : ''}`}
                onClick={() => setCurrentImg(i)}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
          <div className={styles.lightboxCounter}>{currentImg + 1} / {images.length}</div>
        </div>
      )}
    </div>
  )
}
