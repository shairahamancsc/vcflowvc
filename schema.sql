-- Create the 'users' table to store public-facing user data
-- This table will be linked to the authentication users.
CREATE TABLE
  public.users (
    id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    name TEXT NULL,
    role TEXT NULL,
    avatar_url TEXT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
  );

-- Function to automatically create a user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user () RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    'customer', -- Default role for new users
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user ();

-- Create the 'clients' table
CREATE TABLE
  public.clients (
    id UUID DEFAULT gen_random_uuid () NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT clients_pkey PRIMARY KEY (id)
  );

-- Create the 'dealers' table
CREATE TABLE
  public.dealers (
    id UUID DEFAULT gen_random_uuid () NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT dealers_pkey PRIMARY KEY (id)
  );

-- Create the 'service_requests' table
CREATE TABLE
  public.service_requests (
    id TEXT DEFAULT ('REQ-' || LPAD(CAST(NEXTVAL('service_requests_id_seq') AS TEXT), 3, '0')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    client_id UUID NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    assigned_to_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    ai_summary TEXT NULL,
    ai_sentiment TEXT NULL,
    CONSTRAINT service_requests_pkey PRIMARY KEY (id),
    CONSTRAINT service_requests_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
    CONSTRAINT service_requests_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES users (id) ON DELETE SET NULL
  );

-- Create a sequence for the service request ID
CREATE SEQUENCE service_requests_id_seq
  START WITH 1
  INCREMENT BY 1;
  
-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- USERS table
-- Allow users to read their own profile.
CREATE POLICY "Users can read their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile.
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- CLIENTS, DEALERS, SERVICE_REQUESTS tables
-- Allow authenticated users (admins and technicians) to perform all actions.
-- For a production app, you might want more granular rules,
-- e.g., technicians can only see requests assigned to them.
CREATE POLICY "Allow all actions for authenticated users"
  ON public.clients FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all actions for authenticated users"
  ON public.dealers FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all actions for authenticated users"
  ON public.service_requests FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');