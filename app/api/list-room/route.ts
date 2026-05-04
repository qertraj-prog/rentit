import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const formData = await req.formData()

    // Extract listing fields
    const listing = {
      title:               formData.get('title') as string,
      description:         formData.get('description') as string || null,
      room_type:           formData.get('room_type') as string,
      gender_preference:   formData.get('gender_preference') as string,
      monthly_rent:        parseInt(formData.get('monthly_rent') as string),
      security_deposit:    parseInt(formData.get('security_deposit') as string) || 0,
      available_from:      formData.get('available_from') as string || null,
      notice_period_days:  parseInt(formData.get('notice_period_days') as string) || 30,
      address:             formData.get('address') as string || null,
      city:                formData.get('city') as string || null,
      state:               formData.get('state') as string || null,
      colony:              formData.get('colony') as string || null,
      landmark:            formData.get('landmark') as string || null,
      pincode:             formData.get('pincode') as string || null,
      floor_number:        parseInt(formData.get('floor_number') as string) || null,
      total_floors:        parseInt(formData.get('total_floors') as string) || null,
      room_size_sqft:      parseInt(formData.get('room_size_sqft') as string) || null,
      furnishing_type:     formData.get('furnishing_type') as string,
      bathroom_type:       formData.get('bathroom_type') as string,
      electricity_included: formData.get('electricity_included') === 'true',
      water_supply:        formData.get('water_supply') as string || '24x7',
      parking:             formData.get('parking') === 'true',
      food_available:      formData.get('food_available') === 'true',
      food_type:           formData.get('food_type') as string || null,
      pets_allowed:        formData.get('pets_allowed') === 'true',
      amenities:           JSON.parse(formData.get('amenities') as string || '[]'),
      status:              'pending' as const,
    }

    // Validate required fields
    if (!listing.title || !listing.room_type || !listing.monthly_rent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if Supabase is configured
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

    if (!isSupabaseConfigured) {
      // Dev mode — just return success without inserting
      return NextResponse.json({ ok: true, id: 'dev-mode-listing', dev: true })
    }

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    // Build insert data — attach owner_id if logged in
    const listingData: Record<string, unknown> = { ...listing }
    if (user) listingData.owner_id = user.id

    // Use service role key if available (bypasses RLS for listing submissions)
    // This allows owners to submit even when RLS would block anon inserts
    const insertClient = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { cookies: { getAll: () => [], setAll: () => {} } }
        )
      : supabase

    const { data, error } = await insertClient
      .from('listings')
      .insert(listingData)
      .select('id')
      .single()

    if (error) {
      console.error('Listing insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Upload photos if provided
    const photos = formData.getAll('photos') as File[]
    if (photos.length > 0 && data?.id) {
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        if (!file || file.size === 0) continue
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${data.id}/${i}-${Date.now()}.${ext}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(path, file, { contentType: file.type, upsert: false })

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('listing-photos')
            .getPublicUrl(path)

          await supabase.from('listing_photos').insert({
            listing_id: data.id,
            photo_url:  urlData.publicUrl,
            sort_order: i,
            is_cover:   i === 0,
            category:   'room',
          })
        }
      }
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    console.error('List room API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
