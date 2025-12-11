Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Create Your Admin User

To log in as the administrator, you must first create the user account through the application's UI. The application code is configured to automatically grant admin privileges to a specific email address.

1.  **Sign Up**: Since user creation is restricted by default, you'll need to create your user through the New User page. Navigate to `/users/new`.
2.  **Use these credentials**:
    *   **Name**: `Shaik Anisul Rahaman`
    *   **Email**: `shsirahaman.csc@gmail.com`
    *   **Password**: Choose a secure password (e.g., `password`)
    *   **Role**: You can select any role; the application will override it to `admin`.

After you sign up, the application will automatically recognize your email and assign the `admin` role. You can then log in and access the Admin Dashboard.

## Supabase Row Level Security (RLS) Policies

For user profiles to be created correctly upon first login, you must enable Row Level Security (RLS) on the `users` table and create a policy that allows users to insert their own records. This is handled by a database trigger, but the RLS policy is still a good security practice.

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
