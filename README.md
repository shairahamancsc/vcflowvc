Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Create Your Admin User

To log in as the administrator, you must first create the user account through the application's UI. The database is seeded to automatically grant admin privileges to a specific user ID.

1.  **Sign Up**: Since user creation is restricted, you'll need to create a temporary user through the UI first. Navigate to `/users/new`.
2.  **Use these credentials**:
    *   **Name**: `Shaik Anisul Rahaman`
    *   **Email**: `shsirahaman.csc@gmail.com`
    *   **Password**: `password`
    *   **Role**: `Admin`

After you sign up, the database migration will ensure this user has the `admin` role. You can then log in with these credentials.

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
