// Listing type matching DB schema
export interface Listing {
  id: string
  owner_id: string
  title: string
  description: string | null
  room_type: 'single' | 'double' | 'triple' | '1bhk' | '2bhk' | 'pg'
  gender_preference: 'boys' | 'girls' | 'any' | 'family'
  monthly_rent: number
  security_deposit: number
  available_from: string | null
  address: string | null
  pincode: string | null
  city: string | null
  state: string | null
  colony: string | null
  landmark: string | null
  latitude: number | null
  longitude: number | null
  room_size_sqft: number | null
  floor_number: number | null
  total_floors: number | null
  furnishing_type: 'fully_furnished' | 'semi_furnished' | 'unfurnished'
  bathroom_type: 'attached' | 'shared'
  electricity_included: boolean
  water_supply: '24x7' | 'limited'
  parking: boolean
  notice_period_days: number
  food_available: boolean
  food_type: 'veg' | 'non_veg' | 'both' | null
  pets_allowed: boolean
  amenities: string[]
  status: 'pending' | 'active' | 'paused' | 'rejected' | 'rented'
  rejection_reason: string | null
  views_count: number
  inquiries_count: number
  saves_count: number
  created_at: string
  updated_at: string
  // Joined
  listing_photos?: ListingPhoto[]
  users?: UserProfile
}

export interface ListingPhoto {
  id: string
  listing_id: string
  photo_url: string
  category: 'room' | 'bathroom' | 'kitchen' | 'balcony' | 'building' | 'other'
  sort_order: number
  is_cover: boolean
}

export interface UserProfile {
  id: string
  email: string | null
  phone: string | null
  full_name: string | null
  role: 'tenant' | 'owner' | 'admin'
  profile_photo_url: string | null
  is_blocked: boolean
  created_at: string
}

// Amenity display config
export const AMENITY_CONFIG: Record<string, { label: string; icon: string }> = {
  wifi: { label: 'WiFi', icon: '📶' },
  ac: { label: 'AC', icon: '❄️' },
  geyser: { label: 'Geyser', icon: '🚿' },
  washing_machine: { label: 'Washing Machine', icon: '🫧' },
  fridge: { label: 'Fridge', icon: '🧊' },
  tv: { label: 'TV', icon: '📺' },
  parking: { label: 'Parking', icon: '🚗' },
  cctv: { label: 'CCTV', icon: '📷' },
  security_guard: { label: 'Security Guard', icon: '💂' },
  lift: { label: 'Lift', icon: '🛗' },
  kitchen: { label: 'Kitchen', icon: '🍳' },
  gas_stove: { label: 'Gas Stove', icon: '🔥' },
  balcony: { label: 'Balcony', icon: '🏙️' },
  terrace: { label: 'Terrace', icon: '🌿' },
  water_24x7: { label: 'Water 24x7', icon: '💧' },
  electricity_backup: { label: 'Power Backup', icon: '⚡' },
}

export const ROOM_TYPE_LABELS: Record<string, string> = {
  single: 'Single Room',
  double: 'Double Room',
  triple: 'Triple Sharing',
  '1bhk': '1 BHK',
  '2bhk': '2 BHK',
  pg: 'PG/Hostel',
}

export const GENDER_LABELS: Record<string, string> = {
  boys: 'Boys Only',
  girls: 'Girls Only',
  any: 'Any Gender',
  family: 'Family Only',
}

export const FURNISHING_LABELS: Record<string, string> = {
  fully_furnished: 'Fully Furnished',
  semi_furnished: 'Semi Furnished',
  unfurnished: 'Unfurnished',
}

// Format price with Indian number system
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN').format(price)
}

// Placeholder images for listings without photos
export const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
]

export function getListingCoverImage(listing: Listing): string {
  const cover = listing.listing_photos?.find(p => p.is_cover)
  if (cover) return cover.photo_url
  if (listing.listing_photos && listing.listing_photos.length > 0) {
    return listing.listing_photos[0].photo_url
  }
  // Deterministic placeholder based on listing id
  const idx = listing.id ? listing.id.charCodeAt(0) % PLACEHOLDER_IMAGES.length : 0
  return PLACEHOLDER_IMAGES[idx]
}

export function getListingImages(listing: Listing): string[] {
  if (listing.listing_photos && listing.listing_photos.length > 0) {
    return listing.listing_photos
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(p => p.photo_url)
  }
  return PLACEHOLDER_IMAGES.slice(0, 4)
}
