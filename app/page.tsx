import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HomeClient from './HomeClient'
import { createClient } from '@/lib/supabase/server'
import { Listing } from '@/lib/utils'

async function getFeaturedListings(): Promise<Listing[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) throw error
    return (data || []) as Listing[]
  } catch {
    // Return empty array if Supabase not configured yet
    return []
  }
}

export default async function HomePage() {
  const listings = await getFeaturedListings()

  return (
    <>
      <Navbar />
      <main className="page-main">
        <HomeClient listings={listings} />
      </main>
      <Footer />
    </>
  )
}
