-- Add status column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into public.users, ensuring status is set
  INSERT INTO public.users (id, name, role, avatar_url, status)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    'technician', -- Default role for new users
    new.raw_user_meta_data->>'avatar_url',
    'Active' -- Default status
  );
  RETURN new;
END;
$$;

-- Drop the existing trigger to avoid errors, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
