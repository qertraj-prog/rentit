import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://rentit.vercel.app'),
  title: {
    default: 'RentIt — 10 minute mei room delivery',
    template: '%s | RentIt',
  },
  description: "Find your perfect room, flat, or PG in minutes. India's fastest room rental marketplace. No brokerage. Direct owner contact.",
  keywords: 'room for rent, PG accommodation, flat for rent, 1BHK rent, paying guest, room rental Noida, room rental India, RentIt',
  authors: [{ name: 'RentIt' }],
  creator: 'RentIt',
  openGraph: {
    title: 'RentIt — 10 minute mei room delivery',
    description: "Find your perfect room, flat, or PG in minutes. No brokerage.",
    type: 'website',
    locale: 'en_IN',
    siteName: 'RentIt',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentIt — 10 minute mei room delivery',
    description: "India's fastest room rental marketplace.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load fonts with display=swap — non-blocking */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
        />
        <meta name="theme-color" content="#0A1628" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0A1628',
              color: '#fff',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              borderRadius: '12px',
              padding: '12px 20px',
              border: '1px solid rgba(255,255,255,0.08)',
            },
            success: { iconTheme: { primary: '#FFD600', secondary: '#0A1628' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
