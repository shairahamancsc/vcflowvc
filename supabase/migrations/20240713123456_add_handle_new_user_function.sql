
-- Add the status column to the users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, role, avatar_url, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    'technician',
    NEW.raw_user_meta_data->>'avatar_url',
    'Active'
  );
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed the admin user with the correct role using an UPSERT
WITH user_row AS (
  SELECT id, email, raw_user_meta_data->>'name' AS name, raw_user_meta_data->>'avatar_url' AS avatar_url
  FROM auth.users
  WHERE email = 'shsirahaman.csc@gmail.com'
)
INSERT INTO public.users (id, name, role, avatar_url, status)
SELECT id, COALESCE(name, 'Shaik Anisul Rahaman'), 'admin', COALESCE(avatar_url, ''), 'Active'
FROM user_row
ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      status = EXCLUDED.status,
      name = COALESCE(public.users.name, EXCLUDED.name),
      avatar_url = COALESCE(public.users.avatar_url, EXCLUDED.avatar_url);

-- Grant usage on the public schema to the necessary roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant select permissions on tables to the necessary roles
GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT UPDATE ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT DELETE ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;

-- Grant permissions for sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;
