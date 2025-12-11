-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set a secure search_path
  PERFORM set_config('search_path', 'public,pg_temp', true);

  INSERT INTO public.users (id, name, email, role, avatar_url, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'avatar_url',
    'Active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists, to make the script idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed the admin user in auth.users
INSERT INTO
  auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_token,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    email_change,
    email_change_sent_at,
    reauthentication_token,
    reauthentication_sent_at
  )
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
    'authenticated',
    'authenticated',
    'shsirahaman.csc@gmail.com',
    crypt('password', gen_salt('bf')),
    now(),
    '',
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"name": "Admin User", "role": "admin"}',
    false,
    now(),
    now(),
    NULL,
    NULL,
    '',
    NULL,
    '',
    NULL
  ) ON CONFLICT (email) DO NOTHING;

-- Seed the public.users profile for the admin user
INSERT INTO
  public.users (id, name, email, role, status)
VALUES
  (
    'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
    'Admin User',
    'shsirahaman.csc@gmail.com',
    'admin',
    'Active'
  ) ON CONFLICT (id) DO NOTHING;
