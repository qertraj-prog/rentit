'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  Search, MapPin, Menu, X, Home, LogIn,
  PlusCircle, LayoutDashboard, LogOut,
  ShieldCheck, ListChecks, User
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, profile, loading } = useUser()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setIsMenuOpen(false); setUserMenuOpen(false) }, [pathname])

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) router.push(`/rooms?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const isAdmin  = profile?.role === 'admin'
  const isOwner  = profile?.role === 'owner'
  const isLoggedIn = !!user && !loading

  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="RentIt Home">
            <span className={styles.logoIcon}>🏠</span>
            <span className={styles.logoText}>RentIt</span>
          </Link>

          {/* Search */}
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

          {/* Right actions */}
          <div className={styles.actions}>
            {/* Owner: List Room */}
            {(isOwner || isAdmin || !isLoggedIn) && (
              <Link href="/list-room" className={`btn btn-outline ${styles.listBtn}`}>
                <PlusCircle size={15} />
                <span>List Room</span>
              </Link>
            )}

            {/* Not logged in */}
            {!isLoggedIn && !loading && (
              <Link href="/login" className={`btn btn-primary btn-sm ${styles.loginBtn}`}>
                <LogIn size={15} />
                <span>Login</span>
              </Link>
            )}

            {/* Logged in — avatar + dropdown */}
            {isLoggedIn && (
              <div className={styles.userMenuWrap} ref={userMenuRef}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setUserMenuOpen(v => !v)}
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  {profile?.profile_photo_url ? (
                    <img src={profile.profile_photo_url} alt="Avatar" className={styles.avatarImg} />
                  ) : (
                    <span className={styles.avatarInitials}>{initials}</span>
                  )}
                  {isAdmin && <span className={styles.adminDot} title="Admin" />}
                </button>

                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownName}>{profile?.full_name || 'User'}</div>
                      <div className={styles.dropdownRole}>
                        {isAdmin ? '🛡️ Admin' : isOwner ? '🏠 Owner' : '🔍 Tenant'}
                      </div>
                    </div>

                    <div className={styles.dropdownDivider} />

                    {/* Tenant */}
                    {!isOwner && !isAdmin && (
                      <Link href="/dashboard" className={styles.dropdownItem}>
                        <User size={15} /> My Account
                      </Link>
                    )}

                    {/* Owner */}
                    {isOwner && (
                      <>
                        <Link href="/dashboard/owner" className={styles.dropdownItem}>
                          <ListChecks size={15} /> My Listings
                        </Link>
                        <Link href="/list-room" className={styles.dropdownItem}>
                          <PlusCircle size={15} /> Add New Listing
                        </Link>
                      </>
                    )}

                    {/* Admin */}
                    {isAdmin && (
                      <Link href="/admin" className={styles.dropdownItem}>
                        <ShieldCheck size={15} /> Admin Panel
                      </Link>
                    )}

                    <Link href="/rooms" className={styles.dropdownItem}>
                      <Search size={15} /> Browse Rooms
                    </Link>

                    <div className={styles.dropdownDivider} />

                    <button className={`${styles.dropdownItem} ${styles.dropdownLogout}`} onClick={handleLogout}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
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
        <div ref={menuRef} className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`} aria-hidden={!isMenuOpen}>
          <div className={styles.mobileMenuInner}>
            <form onSubmit={handleSearch} className={styles.mobileSearch}>
              <div className={styles.searchInputWrap}>
                <MapPin size={16} className={styles.searchIcon} />
                <input type="text" placeholder="Search city, area..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={styles.searchInput} />
                <button type="submit" className={styles.searchBtn}><Search size={16} /></button>
              </div>
            </form>

            {isLoggedIn && (
              <div className={styles.mobileUser}>
                <span className={styles.mobileUserName}>{profile?.full_name || user?.email}</span>
                <span className={styles.mobileUserRole}>{isAdmin ? '🛡️ Admin' : isOwner ? '🏠 Owner' : '🔍 Tenant'}</span>
              </div>
            )}

            <Link href="/" className={styles.mobileLink}><Home size={18} /> Home</Link>
            <Link href="/rooms" className={styles.mobileLink}><Search size={18} /> Browse Rooms</Link>

            {(!isLoggedIn || isOwner || isAdmin) && (
              <Link href="/list-room" className={styles.mobileLink}><PlusCircle size={18} /> List Your Room</Link>
            )}

            {isOwner && (
              <Link href="/dashboard/owner" className={styles.mobileLink}><ListChecks size={18} /> My Listings</Link>
            )}

            {isAdmin && (
              <Link href="/admin" className={styles.mobileLink}><ShieldCheck size={18} /> Admin Panel</Link>
            )}

            {!isLoggedIn && !loading ? (
              <Link href="/login" className={`btn btn-primary w-full ${styles.mobileLoginBtn}`}>
                <LogIn size={16} /> Login / Signup
              </Link>
            ) : (
              <button className={`btn btn-outline w-full ${styles.mobileLoginBtn}`} onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className={`overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} aria-hidden />
    </>
  )
}
