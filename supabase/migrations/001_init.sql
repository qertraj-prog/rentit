-- ============================================================
-- RentIt Database Schema
-- Paste this into Supabase SQL Editor and run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extends auth.users)
-- ============================================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'tenant' CHECK (role IN ('tenant', 'owner', 'admin')),
  profile_photo_url TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles visible to all" ON public.users
  FOR SELECT USING (true);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- LISTINGS
-- ============================================================
CREATE TABLE public.listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  room_type TEXT NOT NULL CHECK (room_type IN ('single', 'double', 'triple', '1bhk', '2bhk', 'pg')),
  gender_preference TEXT DEFAULT 'any' CHECK (gender_preference IN ('boys', 'girls', 'any', 'family')),
  monthly_rent INTEGER NOT NULL,
  security_deposit INTEGER DEFAULT 0,
  available_from DATE,
  address TEXT,
  pincode TEXT,
  city TEXT,
  state TEXT,
  colony TEXT,
  landmark TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  room_size_sqft INTEGER,
  floor_number INTEGER,
  total_floors INTEGER,
  furnishing_type TEXT DEFAULT 'unfurnished' CHECK (furnishing_type IN ('fully_furnished', 'semi_furnished', 'unfurnished')),
  bathroom_type TEXT DEFAULT 'shared' CHECK (bathroom_type IN ('attached', 'shared')),
  electricity_included BOOLEAN DEFAULT FALSE,
  water_supply TEXT DEFAULT '24x7' CHECK (water_supply IN ('24x7', 'limited')),
  parking BOOLEAN DEFAULT FALSE,
  notice_period_days INTEGER DEFAULT 30,
  food_available BOOLEAN DEFAULT FALSE,
  food_type TEXT CHECK (food_type IN ('veg', 'non_veg', 'both')),
  pets_allowed BOOLEAN DEFAULT FALSE,
  amenities JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'rejected', 'rented')),
  rejection_reason TEXT,
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings
CREATE POLICY "Active listings are publicly visible" ON public.listings
  FOR SELECT USING (status = 'active');

-- Owners can view all their own listings
CREATE POLICY "Owners can view their own listings" ON public.listings
  FOR SELECT USING (auth.uid() = owner_id);

-- Owners can insert listings
CREATE POLICY "Owners can insert their own listings" ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own listings
CREATE POLICY "Owners can update their own listings" ON public.listings
  FOR UPDATE USING (auth.uid() = owner_id);

-- Owners can delete their own listings
CREATE POLICY "Owners can delete their own listings" ON public.listings
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================================
-- LISTING PHOTOS
-- ============================================================
CREATE TABLE public.listing_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('room', 'bathroom', 'kitchen', 'balcony', 'building', 'other')),
  sort_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos of active listings are public" ON public.listing_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND (status = 'active' OR owner_id = auth.uid())
    )
  );

CREATE POLICY "Owners can manage their listing photos" ON public.listing_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND owner_id = auth.uid()
    )
  );

-- ============================================================
-- SAVED ROOMS
-- ============================================================
CREATE TABLE public.saved_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, listing_id)
);

ALTER TABLE public.saved_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can manage their saved rooms" ON public.saved_rooms
  FOR ALL USING (auth.uid() = tenant_id);

-- ============================================================
-- INQUIRIES
-- ============================================================
CREATE TABLE public.inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view their own inquiries" ON public.inquiries
  FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Owners can view inquiries for their listings" ON public.inquiries
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, listing_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly visible" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Tenants can create and update their reviews" ON public.reviews
  FOR ALL USING (auth.uid() = tenant_id);

-- ============================================================
-- STORAGE BUCKETS (run separately if needed)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true);
-- CREATE POLICY "Public read for listing-photos" ON storage.objects FOR SELECT USING (bucket_id = 'listing-photos');
-- CREATE POLICY "Auth users can upload listing-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA (sample listings for testing)
-- ============================================================
-- Note: Replace owner_id with a real user UUID after creating an account

INSERT INTO public.listings (
  id, owner_id, title, description, room_type, gender_preference,
  monthly_rent, security_deposit, available_from,
  address, pincode, city, state, colony, landmark,
  latitude, longitude,
  room_size_sqft, floor_number, total_floors,
  furnishing_type, bathroom_type, electricity_included, water_supply,
  parking, notice_period_days, food_available, pets_allowed,
  amenities, status
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',  -- replace with real owner_id
  'Spacious Single Room in Sector 62, Noida',
  'Well-ventilated, fully furnished single room in a peaceful society. Walking distance from metro.',
  'single', 'boys',
  8500, 17000, '2024-02-01',
  'H-45, Sector 62, Noida', '201309', 'Noida', 'Uttar Pradesh', 'Sector 62', 'Near Noida Electronic City Metro',
  28.6238, 77.3654,
  150, 3, 5,
  'fully_furnished', 'attached', true, '24x7',
  true, 30, false, false,
  '["wifi", "ac", "geyser", "washing_machine", "cctv", "lift"]', 'active'
),
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'Cozy 1BHK Flat in Lajpat Nagar, Delhi',
  'Beautiful 1BHK with modular kitchen and balcony. Perfect for working professionals or couples.',
  '1bhk', 'any',
  18000, 36000, '2024-02-15',
  'B-12, Lajpat Nagar Part 2, New Delhi', '110024', 'New Delhi', 'Delhi', 'Lajpat Nagar', 'Near Lajpat Nagar Market',
  28.5665, 77.2431,
  450, 2, 4,
  'semi_furnished', 'attached', false, '24x7',
  false, 30, false, true,
  '["wifi", "geyser", "fridge", "tv", "parking"]', 'active'
),
(
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'Girls PG in Koramangala, Bangalore',
  'Safe and secure girls PG with home-cooked meals. 24x7 security and CCTV.',
  'pg', 'girls',
  7000, 14000, '2024-01-20',
  '23, 5th Block, Koramangala, Bangalore', '560095', 'Bangalore', 'Karnataka', 'Koramangala 5th Block', 'Near Forum Mall',
  12.9352, 77.6245,
  100, 1, 3,
  'fully_furnished', 'shared', true, '24x7',
  false, 15, true, false,
  '["wifi", "ac", "geyser", "washing_machine", "cctv", "security_guard", "kitchen"]', 'active'
);
