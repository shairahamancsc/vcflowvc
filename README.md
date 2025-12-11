# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Create Your Admin User

To log in as the administrator, you must first create the user account through the application's UI. The application code is configured to automatically grant admin privileges to a specific email address.

1.  **Sign Up**: Navigate to `/users/new` to access the new user creation form.
2.  **Use these credentials**:
    *   **Name**: `Admin User` (or any name you prefer)
    *   **Email**: `shsirahaman.csc@gmail.com`
    *   **Password**: Choose a secure password (e.g., `password`)
    *   **Role**: You can select any role; the application will override it to `admin`.

After you sign up, the application will automatically recognize your email and assign the `admin` role. You can then log in and access the Admin Dashboard.

## Supabase Row Level Security (RLS) Policies

For the database trigger to create user profiles correctly, you must enable Row Level Security (RLS) on the `users` table and create a policy that allows the trigger function (running as `postgres`) to insert records.

Go to the **Supabase Dashboard** -> **Authentication** -> **Policies**. Select the `users` table and create a new policy with the following details:

**Policy Name:** `Allow postgres user to insert`

**Allowed operation:** `INSERT`

**Target roles:** `postgres`

**USING expression:**
```sql
true
```

This ensures that the trigger function has the necessary permissions to create a user profile when a new user signs up.
