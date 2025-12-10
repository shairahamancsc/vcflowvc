-- Create the function to handle new user creation
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, email, role, avatar_url, status)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    'customer', -- Default role for new users
    new.raw_user_meta_data->>'avatar_url',
    'Active'
  );
  return new;
end;
$$;

-- Create the trigger to call the function on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
