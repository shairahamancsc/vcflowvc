Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Supabase Row Level Security (RLS) Policies

For user profiles to be created correctly upon first login, you must enable Row Level Security (RLS) on the `users` table and create a policy that allows users to insert their own records.

Go to the **Supabase Dashboard** -> **Authentication** -> **Policies**. Select the `users` table and create a new policy with the following details:

**Policy Name:** `Allow individual user create for own record`

**Allowed operation:** `INSERT`

**Target roles:** `authenticated`

**USING expression:**
```sql
auth.uid() = id
```

This ensures that a user can only create a profile for themselves, which is a secure and necessary step for the application to function correctly.

# vcflowvc
