-- Setup storage buckets for the real-time collaborative platform
-- This script creates the necessary storage buckets and sets up proper permissions

-- Create workspace-logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workspace-logos',
  'workspace-logos',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create profile-pictures bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create file-banners bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'file-banners',
  'file-banners',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for workspace-logos bucket
-- Allow authenticated users to upload workspace logos
CREATE POLICY "Allow authenticated users to upload workspace logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'workspace-logos' AND auth.role() = 'authenticated'
);

-- Allow public to view workspace logos
CREATE POLICY "Allow public to view workspace logos" ON storage.objects
FOR SELECT USING (bucket_id = 'workspace-logos');

-- Allow users to update their own workspace logos
CREATE POLICY "Allow users to update workspace logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'workspace-logos' AND auth.role() = 'authenticated'
);

-- Allow users to delete their own workspace logos
CREATE POLICY "Allow users to delete workspace logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'workspace-logos' AND auth.role() = 'authenticated'
);

-- Set up storage policies for profile-pictures bucket
-- Allow authenticated users to upload profile pictures
CREATE POLICY "Allow authenticated users to upload profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' AND auth.role() = 'authenticated'
);

-- Allow public to view profile pictures
CREATE POLICY "Allow public to view profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

-- Allow users to update their own profile pictures
CREATE POLICY "Allow users to update profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-pictures' AND auth.role() = 'authenticated'
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Allow users to delete profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-pictures' AND auth.role() = 'authenticated'
);

-- Set up storage policies for file-banners bucket
-- Allow authenticated users to upload file banners
CREATE POLICY "Allow authenticated users to upload file banners" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'file-banners' AND auth.role() = 'authenticated'
);

-- Allow public to view file banners
CREATE POLICY "Allow public to view file banners" ON storage.objects
FOR SELECT USING (bucket_id = 'file-banners');

-- Allow users to update their own file banners
CREATE POLICY "Allow users to update file banners" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'file-banners' AND auth.role() = 'authenticated'
);

-- Allow users to delete their own file banners
CREATE POLICY "Allow users to delete file banners" ON storage.objects
FOR DELETE USING (
  bucket_id = 'file-banners' AND auth.role() = 'authenticated'
); 