
-- Add the status column to the users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';

--
-- Create or replace the function to handle new user creation
--
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set a secure search_path
  PERFORM set_config('search_path', 'public,pg_temp', true);

  INSERT INTO public.users (id, name, role, avatar_url, status)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    'technician',
    new.raw_user_meta_data->>'avatar_url',
    'Active'
  );
  RETURN new;
END;
$$;

--
-- Drop the trigger if it exists, then create it
--
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--
-- Seed the admin user in public.users
-- This will create the user if they don't exist, or update their role to admin if they do.
-- The user must first be created via the application's sign-up flow.
--
INSERT INTO public.users (id, name, role, avatar_url, status)
VALUES
  ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
   'Shaik Anisul Rahaman',
   'admin',
   'https://api.dicebear.com/7.x/initials/svg?seed=Shaik%20Anisul%20Rahaman',
   'Active')
ON CONFLICT (id) DO UPDATE
  SET role = 'admin';
