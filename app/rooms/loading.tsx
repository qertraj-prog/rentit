export default function RoomsLoading() {
  return (
    <div style={{ padding: '20px 0', background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container">
        {/* Search bar skeleton */}
        <div style={{ height: 56, borderRadius: 16, background: 'linear-gradient(90deg,#e8ecf0 25%,#f2f5f8 50%,#e8ecf0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 24 }} />
        {/* Grid skeleton */}
        <div className="grid-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ height: 200, background: 'linear-gradient(90deg,#e8ecf0 25%,#f2f5f8 50%,#e8ecf0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ height: 18, borderRadius: 8, width: '70%', background: 'linear-gradient(90deg,#e8ecf0 25%,#f2f5f8 50%,#e8ecf0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ height: 14, borderRadius: 8, width: '50%', background: 'linear-gradient(90deg,#e8ecf0 25%,#f2f5f8 50%,#e8ecf0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ height: 22, borderRadius: 8, width: '40%', background: 'linear-gradient(90deg,#e8ecf0 25%,#f2f5f8 50%,#e8ecf0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
