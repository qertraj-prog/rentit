-- ============================================================
-- RentIt Migration 003 — Helper RPCs & Storage
-- Run in Supabase SQL Editor AFTER 001 and 002
-- ============================================================

-- increment_views: safely increment listing view count
CREATE OR REPLACE FUNCTION public.increment_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.listings
  SET views_count = views_count + 1,
      updated_at  = NOW()
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- increment_inquiries: called when a tenant contacts owner
CREATE OR REPLACE FUNCTION public.increment_inquiries(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.listings
  SET inquiries_count = inquiries_count + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STORAGE BUCKET for listing photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-photos',
  'listing-photos',
  true,
  5242880,  -- 5MB max per file
  ARRAY['image/jpeg','image/png','image/webp','image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public read listing photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-photos');

-- Authenticated users can upload
CREATE POLICY "Auth users upload listing photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

-- Users can delete their own uploaded files
CREATE POLICY "Users delete own listing photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- MAKE YOURSELF ADMIN (run with your real email after signup)
-- ============================================================
-- UPDATE public.users SET role = 'admin' WHERE email = 'qertraj@gmail.com';
