# How to Connect and Query Supabase

This document explains how to interact with your Supabase database within this Next.js application.

## Fixing "violates row-level security policy" Errors

If you encounter an error like `new row violates row-level security policy for table "clients"`, it means your database security rules are blocking an action.

**This is the most common issue and requires a manual fix in your Supabase dashboard.**

For the customer portal OTP login to work, you must create a policy that allows anyone to create a new client profile when they use a new phone number.

Go to the **Supabase Dashboard** -> **SQL Editor** -> **New query** and run the following command:

```sql
CREATE POLICY "Allow public insert for new clients"
ON public.clients
FOR INSERT
WITH CHECK (true);
```

This will solve the error.

## Connecting to Supabase

You do not use a direct SQL query to establish a connection to the database. The connection is managed automatically by the Supabase client library.

Helper functions have been created to give you a pre-configured Supabase client instance:

-   **For Server Components (RSC) and Server Actions:**
    ```javascript
    import { createClient } from '@/lib/supabase/server';
    const supabase = createClient();
    ```

-   **For Client Components (`'use client'`):**
    ```javascript
    import { createClient } from '@/lib/supabase/client';
    const supabase = createClient();
    ```

These functions use the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your environment variables to connect securely.

## How to Query Data

Once you have a `supabase` client object, you can use its methods to query your tables.

### Fetching All Records from a Table

To get all rows from the `clients` table:

```javascript
const { data: clients, error } = await supabase.from('clients').select('*');

if (error) {
  console.error('Error fetching clients:', error);
} else {
  console.log('Clients:', clients);
}
```

### Inserting a Record

To add a new client:

```javascript
const { data: newClient, error } = await supabase
  .from('clients')
  .insert({
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+919876543210',
    address: '42, MG Road, Bangalore'
  })
  .select()
  .single();
```
