import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ListRoomClient from './ListRoomClient'

export const metadata: Metadata = {
  title: 'List Your Room | RentIt',
  description: 'List your room, PG, or flat on RentIt for free. Reach thousands of verified tenants in Noida and beyond.',
}

export default async function ListRoomPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/list-room')
  }

  return <ListRoomClient />
}
