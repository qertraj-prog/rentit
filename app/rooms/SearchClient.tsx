'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react'
import RoomCard from '@/components/RoomCard'
import SkeletonCard from '@/components/SkeletonCard'
import { Listing } from '@/lib/utils'
import styles from './SearchClient.module.css'

interface SearchClientProps {
  listings: Listing[]
  params: Record<string, string | undefined>
}

const ROOM_TYPES = [
  { value: 'single', label: '🏠 Single Room' },
  { value: 'double', label: '🛏️ Double Room' },
  { value: 'triple', label: '👥 Triple Sharing' },
  { value: '1bhk', label: '🏡 1 BHK' },
  { value: '2bhk', label: '🏢 2 BHK' },
  { value: 'pg', label: '🏫 PG/Hostel' },
]

const GENDERS = [
  { value: 'boys', label: '👨 Boys' },
  { value: 'girls', label: '👩 Girls' },
  { value: 'any', label: '👫 Any' },
  { value: 'family', label: '🏡 Family' },
]

const FURNISHINGS = [
  { value: 'fully_furnished', label: 'Fully Furnished' },
  { value: 'semi_furnished', label: 'Semi Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
]

const BATHROOMS = [
  { value: 'attached', label: 'Attached' },
  { value: 'shared', label: 'Shared' },
]

const AMENITY_OPTIONS = [
  { value: 'wifi', label: '📶 WiFi' },
  { value: 'ac', label: '❄️ AC' },
  { value: 'geyser', label: '🚿 Geyser' },
  { value: 'washing_machine', label: '🫧 Washing Machine' },
  { value: 'parking', label: '🚗 Parking' },
  { value: 'cctv', label: '📷 CCTV' },
  { value: 'lift', label: '🛗 Lift' },
  { value: 'kitchen', label: '🍳 Kitchen' },
  { value: 'security_guard', label: '💂 Security Guard' },
  { value: 'fridge', label: '🧊 Fridge' },
  { value: 'tv', label: '📺 TV' },
  { value: 'balcony', label: '🏙️ Balcony' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={styles.filterSection}>
      <button className={styles.filterSectionHeader} onClick={() => setOpen(v => !v)}>
        <span>{title}</span>
        <ChevronDown size={16} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </button>
      {open && <div className={styles.filterSectionBody}>{children}</div>}
    </div>
  )
}

export default function SearchClient({ listings, params }: SearchClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Local filter state
  const [localMin, setLocalMin] = useState(params.min || '1000')
  const [localMax, setLocalMax] = useState(params.max || '25000')
  const [searchInput, setSearchInput] = useState(params.q || '')

  const updateParam = useCallback((key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      p.delete(key)
    } else {
      p.set(key, value)
    }
    router.push(`/rooms?${p.toString()}`)
  }, [router, searchParams])

  const toggleArrayParam = (key: string, value: string) => {
    const current = (searchParams.get(key) || '').split(',').filter(Boolean)
    const idx = current.indexOf(value)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(value)
    updateParam(key, current.join(',') || null)
  }

  const isParamActive = (key: string, value: string) => {
    return (searchParams.get(key) || '').split(',').includes(value)
  }

  const handlePriceApply = () => {
    const p = new URLSearchParams(searchParams.toString())
    p.set('min', localMin)
    p.set('max', localMax)
    router.push(`/rooms?${p.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/rooms')
  }

  const hasFilters = Array.from(searchParams.entries()).length > 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('q', searchInput)
  }

  const Filters = (
    <div className={styles.filterPanel}>
      {/* Header */}
      <div className={styles.filterHeader}>
        <h3 className={styles.filterTitle}>
          <SlidersHorizontal size={18} /> Filters
        </h3>
        {hasFilters && (
          <button className={`btn btn-ghost btn-sm ${styles.clearBtn}`} onClick={clearAllFilters}>
            Clear All
          </button>
        )}
        <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)} aria-label="Close filters">
          <X size={20} />
        </button>
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className={styles.priceInputs}>
          <div className={styles.priceField}>
            <label className="label">Min (₹)</label>
            <input
              type="number"
              className="input"
              value={localMin}
              min={1000}
              max={25000}
              step={500}
              onChange={e => setLocalMin(e.target.value)}
            />
          </div>
          <div className={styles.priceDash}>—</div>
          <div className={styles.priceField}>
            <label className="label">Max (₹)</label>
            <input
              type="number"
              className="input"
              value={localMax}
              min={1000}
              max={50000}
              step={500}
              onChange={e => setLocalMax(e.target.value)}
            />
          </div>
        </div>
        <button className={`btn btn-dark w-full ${styles.applyBtn}`} onClick={handlePriceApply}>
          Apply
        </button>
      </FilterSection>

      {/* Room Type */}
      <FilterSection title="Room Type">
        <div className={styles.checkList}>
          {ROOM_TYPES.map(rt => (
            <label key={rt.value} className={styles.checkItem}>
              <input
                type="checkbox"
                checked={isParamActive('type', rt.value)}
                onChange={() => toggleArrayParam('type', rt.value)}
                className={styles.checkbox}
              />
              <span>{rt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Gender */}
      <FilterSection title="Gender Preference">
        <div className={styles.pillGroup}>
          {GENDERS.map(g => (
            <button
              key={g.value}
              className={`${styles.pill} ${isParamActive('gender', g.value) ? styles.pillActive : ''}`}
              onClick={() => toggleArrayParam('gender', g.value)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Furnishing */}
      <FilterSection title="Furnishing">
        <div className={styles.pillGroup}>
          {FURNISHINGS.map(f => (
            <button
              key={f.value}
              className={`${styles.pill} ${isParamActive('furnishing', f.value) ? styles.pillActive : ''}`}
              onClick={() => toggleArrayParam('furnishing', f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Bathroom */}
      <FilterSection title="Bathroom">
        <div className={styles.pillGroup}>
          {BATHROOMS.map(b => (
            <button
              key={b.value}
              className={`${styles.pill} ${isParamActive('bathroom', b.value) ? styles.pillActive : ''}`}
              onClick={() => toggleArrayParam('bathroom', b.value)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection title="Amenities" defaultOpen={false}>
        <div className={styles.checkList}>
          {AMENITY_OPTIONS.map(a => (
            <label key={a.value} className={styles.checkItem}>
              <input
                type="checkbox"
                checked={isParamActive('amenities', a.value)}
                onChange={() => toggleArrayParam('amenities', a.value)}
                className={styles.checkbox}
              />
              <span>{a.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  )

  const resultCount = listings.length

  return (
    <div className={styles.pageWrap}>
      {/* Mobile top bar */}
      <div className={styles.mobileTopBar}>
        <form onSubmit={handleSearch} className={styles.mobileSearch}>
          <Search size={16} className={styles.mobileSearchIcon} />
          <input
            type="text"
            placeholder="Search city, area or pincode..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className={styles.mobileSearchInput}
          />
        </form>
        <button
          className={`btn btn-outline btn-sm ${styles.filterToggleBtn}`}
          onClick={() => setDrawerOpen(true)}
        >
          <SlidersHorizontal size={15} />
          Filters {hasFilters && <span className={styles.filterBadge} />}
        </button>
      </div>

      <div className={`container ${styles.layout}`}>
        {/* Sidebar — desktop only */}
        <aside className={styles.sidebar}>
          {Filters}
        </aside>

        {/* Main content */}
        <div className={styles.main}>
          {/* Sort + results count bar */}
          <div className={styles.sortBar}>
            <p className={styles.resultCount}>
              <strong>{resultCount}</strong> rooms found
              {params.q && <> for <strong>&quot;{params.q}&quot;</strong></>}
            </p>
            <div className={styles.sortWrap}>
              <label className="label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Sort by:</label>
              <select
                className={`input ${styles.sortSelect}`}
                value={params.sort || 'newest'}
                onChange={e => updateParam('sort', e.target.value)}
              >
                {SORT_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className={styles.activeFilters}>
              {params.q && (
                <span className={`badge badge-dark ${styles.filterTag}`}>
                  📍 {params.q}
                  <button onClick={() => updateParam('q', null)} className={styles.filterTagClose}><X size={12} /></button>
                </span>
              )}
              {params.type && (
                <span className={`badge badge-yellow ${styles.filterTag}`}>
                  Type: {params.type}
                  <button onClick={() => updateParam('type', null)} className={styles.filterTagClose}><X size={12} /></button>
                </span>
              )}
              {params.gender && (
                <span className={`badge badge-outline ${styles.filterTag}`}>
                  {params.gender}
                  <button onClick={() => updateParam('gender', null)} className={styles.filterTagClose}><X size={12} /></button>
                </span>
              )}
              {(params.min || params.max) && (
                <span className={`badge badge-outline ${styles.filterTag}`}>
                  ₹{params.min || '1k'}–₹{params.max || '25k'}
                  <button onClick={() => { updateParam('min', null); updateParam('max', null); }} className={styles.filterTagClose}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {resultCount === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyEmoji}>🏠</div>
              <h3>No rooms found</h3>
              <p>Try adjusting your filters or searching a different area.</p>
              <button className="btn btn-primary" onClick={clearAllFilters}>Clear All Filters</button>
            </div>
          ) : (
            <div className="grid-auto">
              {listings.map(listing => (
                <RoomCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div className={`overlay ${drawerOpen ? 'active' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHandle} />
        {Filters}
      </div>
    </div>
  )
}
