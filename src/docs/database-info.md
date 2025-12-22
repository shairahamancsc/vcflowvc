# How to Connect and Query Supabase

This document explains how to interact with your Supabase database within this Next.js application.

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

Once you have a `supabase` client object, you can use its methods to query your tables. This is the standard way to interact with the database in this project. You do not need to write raw SQL.

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

### Fetching a Single Record

To get a single client by their ID:

```javascript
const clientId = 'some-client-id';
const { data: client, error } = await supabase
  .from('clients')
  .select('*')
  .eq('id', clientId)
  .single();
```

### Inserting a Record

To add a new client:

```javascript
const { data: newClient, error } = await supabase
  .from('clients')
  .insert({
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '555-010-0123',
    address: '123 Innovation Drive'
  })
  .select()
  .single();
```

This method is safer and better integrated with the Next.js application than writing raw SQL queries.

## Fixing "violates row-level security policy" Errors

If you encounter an error like `new row violates row-level security policy for table "clients"`, it means your database security rules are blocking an action.

For the customer portal OTP login to work, you need a policy that allows anyone to create a new client profile when they use a new phone number.

Go to the **Supabase Dashboard** -> **SQL Editor** -> **New query** and run the following command to create the required policy:

```sql
CREATE POLICY "Allow public insert for new clients"
ON public.clients
FOR INSERT
WITH CHECK (true);
```

This will solve the error.
