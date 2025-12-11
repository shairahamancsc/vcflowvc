-- supabase/migrations/20240713123456_add_handle_new_user_function.sql

-- Drop the trigger if it exists, to make the script idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function if it exists, to make the script idempotent
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    'technician', -- Default role for new users
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Create the trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed the admin user's role in the public.users table.
-- This uses an UPSERT. It will insert the row if the ID doesn't exist,
-- or update the role to 'admin' if it does.
-- You must first sign up in the application with the specified email and password
-- so that the user exists in auth.users.
INSERT INTO public.users (id, name, role, avatar_url, status)
VALUES
    ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'Shaik Anisul Rahaman', 'admin', 'https://api.dicebear.com/7.x/initials/svg?seed=Shaik%20Anisul%20Rahaman', 'Active')
ON CONFLICT (id) DO UPDATE SET
    role = 'admin';
