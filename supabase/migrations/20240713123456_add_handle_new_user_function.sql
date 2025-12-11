-- supabase/migrations/20240713123456_add_handle_new_user_function.sql

-- Create the user-profile-creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    'technician', -- Default role
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Create the trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed the admin user in auth.users
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, email_change, email_change_sent_at, reauthentication_token, reauthentication_sent_at)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0'::uuid,
  'authenticated',
  'authenticated',
  'shsirahaman.csc@gmail.com',
  crypt('password', gen_salt('bf')),
  now(),
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name": "Admin User", "role": "admin"}'::jsonb,
  false,
  now(),
  now(),
  NULL,
  NULL,
  '',
  NULL,
  '',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'shsirahaman.csc@gmail.com'
);


-- Seed the admin user's profile in public.users
INSERT INTO public.users (id, name, role, avatar_url)
VALUES ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'Shaik Anisul Rahaman', 'admin', 'https://api.dicebear.com/7.x/initials/svg?seed=Shaik+Anisul+Rahaman')
ON CONFLICT (id) DO NOTHING;
