import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A1628 0%, #0D2144 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      gap: '24px',
    }}>
      {/* Animated 404 */}
      <div style={{ fontSize: 'clamp(6rem, 20vw, 10rem)', fontWeight: 900, fontFamily: 'Sora, sans-serif', color: '#FFD600', lineHeight: 1, letterSpacing: '-4px' }}>
        404
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: 420 }}>
        <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif', margin: 0 }}>
          Yeh room nahi mila!
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>
          Shayad listing remove ho gayi, ya URL galat hai. Koi baat nahi — hazaron aur rooms available hain!
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
        <Link href="/rooms" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '14px 28px', borderRadius: '12px',
          background: '#FFD600', color: '#0A1628',
          fontWeight: 800, fontSize: '15px', textDecoration: 'none',
          fontFamily: 'Sora, sans-serif',
        }}>
          <Search size={18} /> Browse Rooms
        </Link>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '14px 28px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.8)',
          fontWeight: 700, fontSize: '15px', textDecoration: 'none',
        }}>
          <Home size={18} /> Go Home
        </Link>
      </div>

      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginTop: '8px' }}>
        🏠 RentIt — 10 minute mei room delivery
      </p>
    </div>
  )
}
