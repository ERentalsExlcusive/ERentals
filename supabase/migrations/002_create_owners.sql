-- Create owners table for Owner Portal
CREATE TABLE IF NOT EXISTS public.owners (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- Owners can read their own profile
CREATE POLICY "Owners can read own profile"
  ON public.owners
  FOR SELECT
  USING (auth.uid() = id);

-- Owners can update their own profile
CREATE POLICY "Owners can update own profile"
  ON public.owners
  FOR UPDATE
  USING (auth.uid() = id);

-- Authenticated users can create their own owner profile
CREATE POLICY "Users can create own owner profile"
  ON public.owners
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create owner_assets table (links owners to properties)
CREATE TABLE IF NOT EXISTS public.owner_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  property_slug TEXT NOT NULL,
  property_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'unavailable')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, property_slug)
);

-- Enable RLS
ALTER TABLE public.owner_assets ENABLE ROW LEVEL SECURITY;

-- Owners can read their own assets
CREATE POLICY "Owners can read own assets"
  ON public.owner_assets
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  property_slug TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in DATE,
  check_out DATE,
  guests INTEGER,
  message TEXT,
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'options_sent', 'negotiating', 'confirmed', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Owners can read their own inquiries
CREATE POLICY "Owners can read own inquiries"
  ON public.inquiries
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Owners can update their own inquiries
CREATE POLICY "Owners can update own inquiries"
  ON public.inquiries
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_owner_assets_owner_id ON public.owner_assets(owner_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_owner_id ON public.inquiries(owner_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_stage ON public.inquiries(stage);
