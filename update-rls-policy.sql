-- Temporarily disable RLS for the files table for development
ALTER TABLE files DISABLE ROW LEVEL SECURITY;

-- Alternatively, create a more permissive policy
-- DROP POLICY IF EXISTS "Users can insert their own files" ON files;
-- CREATE POLICY "Allow all operations on files" ON files FOR ALL USING (true);
