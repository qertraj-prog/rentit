import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import RoomDetailClient from './RoomDetailClient'
import { createClient } from '@/lib/supabase/server'
import { Listing } from '@/lib/utils'

async function getListing(id: string): Promise<Listing | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(*), users(*)')
      .eq('id', id)
      .single()
    if (error) return null
    // Increment view count
    await supabase.rpc('increment_views', { listing_id: id }).catch(() => {})
    return data as Listing
  } catch {
    return null
  }
}

async function getSimilarListings(listing: Listing): Promise<Listing[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('listings')
      .select('*, listing_photos(*)')
      .eq('status', 'active')
      .eq('room_type', listing.room_type)
      .eq('city', listing.city || '')
      .neq('id', listing.id)
      .limit(4)
    return (data || []) as Listing[]
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) return { title: 'Room Not Found — RentIt' }
  return {
    title: `${listing.title} — ₹${listing.monthly_rent}/mo | RentIt`,
    description: `${listing.room_type} in ${listing.city}. ${listing.description || 'Verified listing on RentIt — 10 minute mei room delivery.'}`,
  }
}

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) notFound()

  const similar = await getSimilarListings(listing)

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg)' }}>
        <RoomDetailClient listing={listing} similar={similar} />
      </main>
      <Footer />
    </>
  )
}
