'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Heart, MapPin, Wifi, Wind, Car, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { Listing, formatPrice, getListingImages, ROOM_TYPE_LABELS, GENDER_LABELS } from '@/lib/utils'
import styles from './RoomCard.module.css'

interface RoomCardProps {
  listing: Listing
  onSave?: (id: string, saved: boolean) => void
  isSaved?: boolean
}

const ICON_AMENITIES: Record<string, React.ReactNode> = {
  wifi: <Wifi size={12} />,
  ac: <Wind size={12} />,
  parking: <Car size={12} />,
  cctv: <Shield size={12} />,
}

export default function RoomCard({ listing, onSave, isSaved = false }: RoomCardProps) {
  const images = getListingImages(listing)
  const [currentImg, setCurrentImg] = useState(0)
  const [saved, setSaved] = useState(isSaved)
  const [imgLoaded, setImgLoaded] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const startSlideshow = () => {
    if (images.length <= 1) return
    intervalRef.current = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % images.length)
    }, 1800)
  }

  const stopSlideshow = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => () => stopSlideshow(), [])

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newSaved = !saved
    setSaved(newSaved)
    onSave?.(listing.id, newSaved)
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImg(prev => (prev - 1 + images.length) % images.length)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImg(prev => (prev + 1) % images.length)
  }

  const genderBadgeClass =
    listing.gender_preference === 'girls' ? 'badge-girls' :
    listing.gender_preference === 'boys' ? 'badge-boys' : 'badge-outline'

  const amenityKeys = (listing.amenities || []).slice(0, 4)

  return (
    <Link href={`/rooms/${listing.id}`} className={styles.card} prefetch={false}>
      {/* Image container */}
      <div
        className={styles.imageWrap}
        ref={cardRef}
        onMouseEnter={startSlideshow}
        onMouseLeave={() => { stopSlideshow(); }}
      >
        {!imgLoaded && <div className={`skeleton ${styles.imgSkeleton}`} />}
        <img
          src={images[currentImg]}
          alt={listing.title}
          className={`${styles.image} ${imgLoaded ? styles.imgVisible : ''}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />

        {/* Image navigation arrows */}
        {images.length > 1 && (
          <>
            <button className={`${styles.navBtn} ${styles.navBtnLeft}`} onClick={handlePrev} aria-label="Previous photo">
              <ChevronLeft size={16} />
            </button>
            <button className={`${styles.navBtn} ${styles.navBtnRight}`} onClick={handleNext} aria-label="Next photo">
              <ChevronRight size={16} />
            </button>
            {/* Dots */}
            <div className={styles.dots}>
              {images.slice(0, 5).map((_, i) => (
                <span key={i} className={`${styles.dot} ${i === currentImg ? styles.dotActive : ''}`} />
              ))}
            </div>
          </>
        )}

        {/* Save button */}
        <button
          className={`${styles.saveBtn} ${saved ? styles.saveBtnActive : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Remove from saved' : 'Save room'}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>

        {/* Room type badge */}
        <div className={styles.typeBadge}>
          <span className="badge badge-dark">{ROOM_TYPE_LABELS[listing.room_type]}</span>
        </div>
      </div>

      {/* Card body */}
      <div className={styles.body}>
        {/* Price */}
        <div className={styles.priceRow}>
          <div className={styles.price}>
            <span className={styles.priceSymbol}>₹</span>
            {formatPrice(listing.monthly_rent)}
            <span className={styles.priceMonth}>/mo</span>
          </div>
          <span className={`badge ${genderBadgeClass}`}>{GENDER_LABELS[listing.gender_preference]}</span>
        </div>

        {/* Title */}
        <h3 className={styles.title}>{listing.title}</h3>

        {/* Location */}
        <div className={styles.location}>
          <MapPin size={12} />
          <span>{listing.colony ? `${listing.colony}, ` : ''}{listing.city}</span>
        </div>

        {/* Amenity icons */}
        {amenityKeys.length > 0 && (
          <div className={styles.amenities}>
            {amenityKeys.map(key => (
              <span key={key} className={styles.amenityChip} title={key}>
                {ICON_AMENITIES[key] || '•'} {key.replace('_', ' ')}
              </span>
            ))}
            {(listing.amenities || []).length > 4 && (
              <span className={styles.amenityMore}>+{(listing.amenities || []).length - 4}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={styles.cardFooter}>
          <span className={styles.deposit}>Deposit: ₹{formatPrice(listing.security_deposit)}</span>
          <span className={`btn btn-primary btn-sm ${styles.viewBtn}`}>View →</span>
        </div>
      </div>
    </Link>
  )
}
