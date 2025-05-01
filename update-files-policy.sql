-- Update the RLS policy to allow anonymous uploads
DROP POLICY IF EXISTS "Users can insert their own files" ON files;

-- Create a new policy that allows both authenticated and anonymous uploads
CREATE POLICY "Anyone can upload files" 
ON files FOR INSERT 
WITH CHECK (
  -- Allow authenticated users to upload their own files
  (auth.uid() = user_id) 
  OR 
  -- Allow anonymous uploads with user_id as null
  (user_id IS NULL)
);
