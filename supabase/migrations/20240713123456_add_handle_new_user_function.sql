
-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role');
  return new;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed the admin user
-- Ensure email is unique before using ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS auth_users_email_key ON auth.users (email);

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, email_change, email_change_sent_at, reauthentication_token, reauthentication_sent_at)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0'::uuid, 'authenticated', 'authenticated', 'shsirahaman.csc@gmail.com', crypt('password', gen_salt('bf')), now(), '', NULL, NULL, '{"provider":"email","providers":["email"]}', '{"name": "Admin User", "role": "admin"}', false, now(), now(), NULL, NULL, '', NULL, '', NULL)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (id, name, role, avatar_url, status)
VALUES
  ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0'::uuid, 'Admin User', 'admin', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx3b21hbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc2NTIzMzE2N3ww&ixlib=rb-4.1.0&q=80&w=1080', 'Active')
ON CONFLICT (id) DO NOTHING;
