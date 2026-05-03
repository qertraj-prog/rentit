'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A1628 0%, #0D2144 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        gap: '20px',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        <div style={{ fontSize: '4rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'Sora, sans-serif' }}>
          Kuch gadbad ho gayi
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', maxWidth: 380, lineHeight: 1.7, margin: 0 }}>
          Unexpected error aaya. Dobara try karo — shayad kaam kare.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px', borderRadius: '10px', border: 'none',
              background: '#FFD600', color: '#0A1628', fontWeight: 800,
              fontSize: '14px', cursor: 'pointer', fontFamily: 'Sora, sans-serif',
            }}
          >
            🔄 Try Again
          </button>
          <Link href="/" style={{
            padding: '12px 24px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.8)', fontWeight: 600,
            fontSize: '14px', textDecoration: 'none', display: 'inline-block',
          }}>
            🏠 Go Home
          </Link>
        </div>
      </body>
    </html>
  )
}
