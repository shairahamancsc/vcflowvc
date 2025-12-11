
-- supabase/migrations/20240713000000_handle_new_user.sql

-- Drop the trigger and function if they exist to ensure idempotency
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set a secure search path
  PERFORM set_config('search_path', 'public,pg_temp', true);

  -- Insert a new user profile, defaulting the role to 'technician'
  INSERT INTO public.users (id, name, email, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    'technician', -- Default role for new users
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to call the function after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed the admin user
-- This will create the user if they don't exist, and do nothing if they do.
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, email_change, email_change_sent_at, confirmed_at, reauthentication_token, reauthentication_sent_at)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'authenticated', 'authenticated', 'shsirahaman.csc@gmail.com', crypt('password', gen_salt('bf')), now(), '', NULL, NULL, '{"provider":"email","providers":["email"]}', '{"name": "Admin User"}', false, now(), now(), NULL, NULL, '', NULL, now(), '', NULL)
ON CONFLICT (email) DO NOTHING;

-- Seed the public profile for the admin user
INSERT INTO public.users (id, name, email, role, avatar_url)
SELECT id, 'Shaik Anisul Rahaman', 'shsirahaman.csc@gmail.com', 'admin', 'https://api.dicebear.com/7.x/initials/svg?seed=Shaik%20Anisul%20Rahaman'
FROM auth.users
WHERE email = 'shsirahaman.csc@gmail.com'
ON CONFLICT (id) DO
UPDATE SET role = 'admin';
