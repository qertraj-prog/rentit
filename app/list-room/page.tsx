import type { Metadata } from 'next'
import ListRoomClient from './ListRoomClient'

export const metadata: Metadata = {
  title: 'List Your Room | RentIt',
  description: 'List your room, PG, or flat on RentIt for free. Reach thousands of verified tenants in Noida and beyond.',
}

export default function ListRoomPage() {
  return <ListRoomClient />
}
