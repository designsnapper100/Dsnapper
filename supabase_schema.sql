-- Create the audits table
CREATE TABLE IF NOT EXISTS public.audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  thumbnail_url TEXT,
  project_name TEXT,
  analysis_data JSONB,
  
  -- Add constraints or indexes if needed
  CONSTRAINT audits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can insert their own audits
CREATE POLICY "Users can insert their own audits" 
ON public.audits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create Policy: Users can view their own audits
CREATE POLICY "Users can view their own audits" 
ON public.audits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create Policy: Users can update their own audits
CREATE POLICY "Users can update their own audits" 
ON public.audits 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create Policy: Users can delete their own audits
CREATE POLICY "Users can delete their own audits" 
ON public.audits 
FOR DELETE 
USING (auth.uid() = user_id);

-- Storage bucket setup (if not already existing, though usually done via UI)
-- We assume a bucket named 'audit-images' exists. 
-- You might need to create this bucket in the Supabase Dashboard -> Storage.

-- Policy to allow authenticated users to upload images to 'audit-images' bucket
-- Note: You might need to adjust this if using a different bucket name.
-- 
-- CREATE POLICY "Allow authenticated uploads"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'audit-images');
-- 
-- CREATE POLICY "Allow public read access"
-- ON storage.objects
-- FOR SELECT
-- TO public
-- USING (bucket_id = 'audit-images');
