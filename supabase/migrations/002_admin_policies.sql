-- ============================================================
-- RentIt Admin RLS Policies
-- Run this in Supabase SQL Editor AFTER 001_init.sql
-- ============================================================

-- Admins can view ALL listings (any status)
CREATE POLICY "Admins can view all listings" ON public.listings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update any listing (approve / reject / pause)
CREATE POLICY "Admins can update any listing" ON public.listings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can delete any listing
CREATE POLICY "Admins can delete any listing" ON public.listings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can view ALL users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update any user (block, change role)
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can view all listing photos
CREATE POLICY "Admins can view all listing photos" ON public.listing_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- HOW TO MAKE YOURSELF ADMIN
-- Run this after creating your account, replacing the email:
-- ============================================================
-- UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
