import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchClient from './SearchClient'
import { createClient } from '@/lib/supabase/server'
import { Listing } from '@/lib/utils'
import SkeletonCard from '@/components/SkeletonCard'

interface SearchParams {
  q?: string
  type?: string
  gender?: string
  furnishing?: string
  bathroom?: string
  min?: string
  max?: string
  amenities?: string
  sort?: string
  lat?: string
  lng?: string
}

async function getListings(params: SearchParams): Promise<Listing[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('listings')
      .select('*, listing_photos(*)')
      .eq('status', 'active')

    if (params.type) query = query.eq('room_type', params.type)
    if (params.gender) query = query.eq('gender_preference', params.gender)
    if (params.furnishing) query = query.eq('furnishing_type', params.furnishing)
    if (params.bathroom) query = query.eq('bathroom_type', params.bathroom)
    if (params.min) query = query.gte('monthly_rent', parseInt(params.min))
    if (params.max) query = query.lte('monthly_rent', parseInt(params.max))
    if (params.q) {
      query = query.or(`city.ilike.%${params.q}%,colony.ilike.%${params.q}%,address.ilike.%${params.q}%,pincode.ilike.%${params.q}%,title.ilike.%${params.q}%`)
    }

    const sortBy = params.sort || 'newest'
    if (sortBy === 'price_asc') query = query.order('monthly_rent', { ascending: true })
    else if (sortBy === 'price_desc') query = query.order('monthly_rent', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    query = query.limit(40)
    const { data, error } = await query
    if (error) throw error
    return (data || []) as Listing[]
  } catch {
    return []
  }
}

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const listings = await getListings(params)

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg)' }}>
        <SearchClient listings={listings} params={params} />
      </main>
      <Footer />
    </>
  )
}
