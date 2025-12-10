
-- This function is triggered when a new user signs up.
-- It inserts a new row into the public.users table.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, role, avatar_url, status)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    'customer',
    new.raw_user_meta_data->>'avatar_url',
    'Active'
  );
  return new;
end;
$$;

-- Drop the trigger if it exists, then create it.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
