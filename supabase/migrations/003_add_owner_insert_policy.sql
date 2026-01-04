-- Add INSERT policy for owners table (missed in initial migration)
CREATE POLICY IF NOT EXISTS "Users can create own owner profile"
  ON public.owners
  FOR INSERT
  WITH CHECK (auth.uid() = id);
