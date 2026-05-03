'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Navigation, ArrowRight, Star, Users, Home, CheckCircle } from 'lucide-react'
import RoomCard from '@/components/RoomCard'
import SkeletonCard from '@/components/SkeletonCard'
import { Listing } from '@/lib/utils'
import styles from './HomeClient.module.css'

interface HomeClientProps {
  listings: Listing[]
}

const CATEGORIES = [
  { icon: '🏠', label: 'Single Room', value: 'single' },
  { icon: '🛏️', label: 'Double Room', value: 'double' },
  { icon: '🏢', label: 'PG / Hostel', value: 'pg' },
  { icon: '🏡', label: '1 BHK', value: '1bhk' },
  { icon: '🏢', label: '2 BHK', value: '2bhk' },
  { icon: '👩', label: 'Girls Only', value: 'girls' },
  { icon: '👨', label: 'Boys Only', value: 'boys' },
  { icon: '👫', label: 'Family', value: 'family' },
]

const CITIES = [
  { name: 'Noida', emoji: '🏙️', live: true },
  { name: 'Delhi', emoji: '🕌', live: false },
  { name: 'Gurgaon', emoji: '🏗️', live: false },
  { name: 'Mumbai', emoji: '🌊', live: false },
  { name: 'Bangalore', emoji: '🌿', live: false },
  { name: 'Pune', emoji: '🎓', live: false },
  { name: 'Hyderabad', emoji: '💎', live: false },
  { name: 'Chennai', emoji: '🌞', live: false },
]

const STATS = [
  { icon: <Home size={22} />, value: '50,000+', label: 'Rooms Listed' },
  { icon: <Users size={22} />, value: '1,20,000+', label: 'Happy Tenants' },
  { icon: <Star size={22} />, value: '4.8 / 5', label: 'Average Rating' },
  { icon: <CheckCircle size={22} />, value: '200+', label: 'Cities Covered' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    emoji: '🔍',
    title: 'Search Your Area',
    desc: 'Enter your city, area, or pincode to find rooms near you. Filter by budget, type, and amenities.',
  },
  {
    step: '02',
    emoji: '📞',
    title: 'Contact Owner Directly',
    desc: 'Call or WhatsApp the owner directly. No middlemen, no brokerage fees. Pure direct connect.',
  },
  {
    step: '03',
    emoji: '🏠',
    title: 'Move In Fast',
    desc: 'Visit the room, finalize the deal, and move in. All in under 10 minutes of searching.',
  },
]

export default function HomeClient({ listings }: HomeClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<Listing[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Load recently viewed from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rentit_recent')
      if (raw) {
        const parsed = JSON.parse(raw) as Listing[]
        setRecentlyViewed(parsed.slice(0, 4))
      }
    } catch {}
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (activeCategory) {
      if (['girls', 'boys', 'family'].includes(activeCategory)) {
        params.set('gender', activeCategory)
      } else {
        params.set('type', activeCategory)
      }
    }
    router.push(`/rooms?${params.toString()}`)
  }

  const handleCategoryClick = (value: string) => {
    setActiveCategory(prev => prev === value ? null : value)
    const params = new URLSearchParams()
    if (['girls', 'boys', 'family'].includes(value)) {
      params.set('gender', value)
    } else {
      params.set('type', value)
    }
    router.push(`/rooms?${params.toString()}`)
  }

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        setIsLocating(false)
        const { latitude, longitude } = position.coords
        router.push(`/rooms?lat=${latitude}&lng=${longitude}`)
      },
      () => {
        setIsLocating(false)
        alert('Unable to detect location. Please search manually.')
      },
      { timeout: 8000 }
    )
  }

  return (
    <>
      {/* ============ HERO ============ */}
      <section className={styles.hero}>
        {/* Animated background particles */}
        <div className={styles.particles} aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroTag}>
            <span className={styles.heroTagDot} />
            ⚡ India&apos;s Fastest Room Rental Platform
          </div>

          <h1 className={styles.heroHeadline}>
            <span className={styles.heroLine1}>10 minute mei</span>
            <span className={styles.heroLine2}>
              room <span className={styles.heroYellow}>delivery</span>
            </span>
          </h1>

          <p className={styles.heroSubtext}>
            Find single rooms, flats, PGs & hostels near you — instantly.<br />
            No brokerage. Direct owner contact. Zero hassle.
          </p>

          {/* Search box */}
          <form className={styles.heroSearch} onSubmit={handleSearch}>
            <div className={styles.heroSearchInner}>
              <MapPin size={18} className={styles.heroSearchIcon} />
              <input
                type="text"
                placeholder="Enter city, area or pincode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.heroInput}
                aria-label="Search location"
              />
              <button
                type="button"
                className={styles.locateBtn}
                onClick={handleAutoDetect}
                disabled={isLocating}
                title="Use my location"
                aria-label="Detect my location"
              >
                <Navigation size={16} className={isLocating ? styles.spin : ''} />
                <span className={styles.locateBtnText}>
                  {isLocating ? 'Locating...' : 'Near Me'}
                </span>
              </button>
              <button type="submit" className={styles.heroSearchBtn} aria-label="Search rooms">
                <Search size={18} />
                <span>Search Rooms</span>
              </button>
            </div>
          </form>

          {/* Quick city pills */}
          <div className={styles.citiesRow}>
            <span className={styles.citiesLabel}>Cities:</span>
            {CITIES.map(city => (
              city.live ? (
                <button
                  key={city.name}
                  className={`${styles.cityPill} ${styles.cityPillLive}`}
                  onClick={() => router.push(`/rooms?q=${encodeURIComponent(city.name)}`)}
                >
                  <span className={styles.cityLiveDot} />
                  <span>{city.emoji}</span>
                  <span>{city.name}</span>
                </button>
              ) : (
                <div key={city.name} className={`${styles.cityPill} ${styles.cityPillSoon}`}>
                  <span>{city.emoji}</span>
                  <span>{city.name}</span>
                  <span className={styles.soonBadge}>Soon</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Wave separator */}
        <div className={styles.heroWave} aria-hidden>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 80L60 69.3C120 58.7 240 37.3 360 26.7C480 16 600 16 720 26.7C840 37.3 960 58.7 1080 64C1200 69.3 1320 58.7 1380 53.3L1440 48V80H0Z" fill="#F5F7FA" />
          </svg>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className={styles.statsSection}>
        <div className={`container ${styles.statsGrid}`}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className={`section ${styles.categoriesSection}`}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Browse by Category</h2>
              <p className="text-muted mt-1">What are you looking for?</p>
            </div>
          </div>

          <div className={`scroll-x ${styles.categoryScroll}`}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className={`${styles.categoryChip} ${activeCategory === cat.value ? styles.categoryChipActive : ''}`}
                onClick={() => handleCategoryClick(cat.value)}
              >
                <span className={styles.categoryEmoji}>{cat.icon}</span>
                <span className={styles.categoryLabel}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED LISTINGS ============ */}
      <section className={`section ${styles.listingsSection}`}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Featured Rooms</h2>
              <p className="text-muted mt-1">Verified rooms ready for you to move in</p>
            </div>
            <Link href="/rooms" className={`btn btn-outline btn-sm ${styles.viewAllBtn}`}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {listings.length === 0 ? (
            // Show skeletons if no data (Supabase not configured yet)
            <div className="grid-auto">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid-auto">
              {listings.map(listing => (
                <RoomCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          <div className={styles.viewAllRow}>
            <Link href="/rooms" className="btn btn-primary btn-lg">
              Explore All Rooms <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className={`section ${styles.howSection}`}>
        <div className="container">
          <div className={styles.howHeader}>
            <h2>How RentIt Works</h2>
            <p className="text-muted mt-1">Simple. Fast. No brokerage.</p>
          </div>

          <div className={styles.howGrid}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className={styles.howCard}>
                <div className={styles.howStep}>{step.step}</div>
                <div className={styles.howEmoji}>{step.emoji}</div>
                <h3 className={styles.howTitle}>{step.title}</h3>
                <p className={styles.howDesc}>{step.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className={styles.howArrow} aria-hidden>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ RECENTLY VIEWED ============ */}
      {recentlyViewed.length > 0 && (
        <section className={`section ${styles.recentSection}`}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2>Recently Viewed</h2>
                <p className="text-muted mt-1">Continue where you left off</p>
              </div>
            </div>
            <div className="grid-auto">
              {recentlyViewed.map(listing => (
                <RoomCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ LIST ROOM CTA ============ */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaLeft}>
              <div className={styles.ctaEmoji}>🏠</div>
              <div>
                <h2 className={styles.ctaTitle}>Have a room to rent?</h2>
                <p className={styles.ctaDesc}>
                  List it for free on RentIt. Get verified tenants in days, not months. Zero brokerage.
                </p>
                <ul className={styles.ctaFeatures}>
                  <li><CheckCircle size={14} className={styles.checkIcon} /> Free listing — no hidden fees</li>
                  <li><CheckCircle size={14} className={styles.checkIcon} /> Reach 1 lakh+ active tenants</li>
                  <li><CheckCircle size={14} className={styles.checkIcon} /> Manage everything from dashboard</li>
                </ul>
              </div>
            </div>
            <div className={styles.ctaRight}>
              <Link href="/list-room" className="btn btn-primary btn-lg">
                List Your Room — Free 🎉
              </Link>
              <p className={styles.ctaNote}>Takes less than 5 minutes</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
