import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span>🏠</span>
            <span className={styles.logoText}>RentIt</span>
          </Link>
          <p className={styles.tagline}>10 minute mei room delivery</p>
          <p className={styles.desc}>
            India&apos;s fastest room rental marketplace. Find single rooms, flats, PGs and more — verified and ready to move in.
          </p>
          <div className={styles.socials}>
            <a href="#" aria-label="Instagram" className={styles.socialBtn}>📸</a>
            <a href="#" aria-label="Twitter" className={styles.socialBtn}>🐦</a>
            <a href="#" aria-label="Facebook" className={styles.socialBtn}>👤</a>
            <a href="#" aria-label="WhatsApp" className={styles.socialBtn}>💬</a>
          </div>
        </div>

        {/* Links */}
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>For Tenants</h4>
            <Link href="/rooms" className={styles.link}>Browse Rooms</Link>
            <Link href="/rooms?type=pg" className={styles.link}>Find PG</Link>
            <Link href="/rooms?type=1bhk" className={styles.link}>1BHK Flats</Link>
            <Link href="/rooms?type=2bhk" className={styles.link}>2BHK Flats</Link>
            <Link href="/dashboard/tenant" className={styles.link}>My Dashboard</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>For Owners</h4>
            <Link href="/list-room" className={styles.link}>List Your Room</Link>
            <Link href="/dashboard/owner" className={styles.link}>Owner Dashboard</Link>
            <Link href="#" className={styles.link}>Pricing</Link>
            <Link href="#" className={styles.link}>Owner Guide</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Company</h4>
            <Link href="#" className={styles.link}>About Us</Link>
            <Link href="#" className={styles.link}>Contact</Link>
            <Link href="#" className={styles.link}>Blog</Link>
            <Link href="#" className={styles.link}>Careers</Link>
            <Link href="#" className={styles.link}>Press</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Support</h4>
            <Link href="#" className={styles.link}>Help Center</Link>
            <Link href="#" className={styles.link}>Privacy Policy</Link>
            <Link href="#" className={styles.link}>Terms of Service</Link>
            <Link href="#" className={styles.link}>Report a Problem</Link>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className={styles.ctaBanner}>
        <div className={`container ${styles.ctaInner}`}>
          <div>
            <h3 className={styles.ctaTitle}>Have a room to rent?</h3>
            <p className={styles.ctaDesc}>List it for free and get tenants in days</p>
          </div>
          <Link href="/list-room" className={`btn btn-primary btn-lg`}>
            🏠 List Your Room — Free
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomInner}`}>
          <p className={styles.copyright}>© 2024 RentIt. Made with ❤️ in India</p>
          <div className={styles.bottomLinks}>
            <Link href="#" className={styles.bottomLink}>Privacy</Link>
            <Link href="#" className={styles.bottomLink}>Terms</Link>
            <Link href="#" className={styles.bottomLink}>Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
