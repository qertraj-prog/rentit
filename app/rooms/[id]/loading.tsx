export default function RoomDetailLoading() {
  const shimmer = {
    background: 'linear-gradient(90deg,#e8ecf0 25%,#f2f5f8 50%,#e8ecf0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 12,
  } as React.CSSProperties

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container">
        {/* Image */}
        <div style={{ ...shimmer, borderRadius: 20, height: 380, marginBottom: 28 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...shimmer, height: 32, width: '60%' }} />
            <div style={{ ...shimmer, height: 18, width: '40%' }} />
            <div style={{ ...shimmer, height: 14, width: '80%' }} />
            <div style={{ ...shimmer, height: 14, width: '75%' }} />
            <div style={{ ...shimmer, height: 14, width: '65%' }} />
          </div>
          <div style={{ ...shimmer, width: 280, height: 200, borderRadius: 16 }} />
        </div>
      </div>
    </div>
  )
}
