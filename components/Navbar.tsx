'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Menu, X, Home, LogIn, PlusCircle } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/rooms?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="RentIt Home">
            <span className={styles.logoIcon}>🏠</span>
            <span className={styles.logoText}>RentIt</span>
          </Link>

          {/* Search bar — hidden on mobile, visible on md+ */}
          <form className={styles.searchForm} onSubmit={handleSearch} role="search">
            <div className={styles.searchInputWrap}>
              <MapPin size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search city, area or pincode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Search location"
              />
              <button type="submit" className={styles.searchBtn} aria-label="Search">
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Right nav actions */}
          <div className={styles.actions}>
            <Link href="/list-room" className={`btn btn-outline ${styles.listBtn}`}>
              <PlusCircle size={15} />
              <span>List Room</span>
            </Link>
            <Link href="/login" className={`btn btn-primary btn-sm ${styles.loginBtn}`}>
              <LogIn size={15} />
              <span>Login</span>
            </Link>
            <button
              className={`btn-icon ${styles.menuBtn}`}
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          ref={menuRef}
          className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}
          aria-hidden={!isMenuOpen}
        >
          <div className={styles.mobileMenuInner}>
            <form onSubmit={handleSearch} className={styles.mobileSearch}>
              <div className={styles.searchInputWrap}>
                <MapPin size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search city, area or pincode..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchBtn}>
                  <Search size={16} />
                </button>
              </div>
            </form>
            <Link href="/" className={styles.mobileLink}>
              <Home size={18} /> Home
            </Link>
            <Link href="/rooms" className={styles.mobileLink}>
              <Search size={18} /> Browse Rooms
            </Link>
            <Link href="/list-room" className={styles.mobileLink}>
              <PlusCircle size={18} /> List Your Room
            </Link>
            <Link href="/login" className={`btn btn-primary w-full ${styles.mobileLoginBtn}`}>
              <LogIn size={16} /> Login / Signup
            </Link>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      <div
        className={`overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden
      />
    </>
  )
}
