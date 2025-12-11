-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set a secure search_path for the function
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Drop the trigger if it exists, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add the status column if it doesn't exist
ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
