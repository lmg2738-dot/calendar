# Supabase Integration Guide

AI Smart Planner is ready to be connected to Supabase for persistent data storage. Follow these steps to set it up:

## 1. Create a Supabase Project
Go to [Supabase](https://supabase.com/) and create a new project.

## 2. Create the Database Schema
In the Supabase SQL Editor, run the following SQL to create the `events` table:

```sql
create table events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  start timestamp with time zone not null,
  end timestamp with time zone not null,
  priority text check (priority in ('high', 'medium', 'low')) default 'medium',
  description text,
  is_ai_generated boolean default false,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Note: Ensure uuid-ossp extension is enabled if not already
-- create extension if not exists "uuid-ossp";
```

## 3. Set Up Environment Variables
Copy the API credentials from your Supabase project settings (**Settings > API**) and add them to your environment variables (in AI Studio, go to **Settings > Secrets**):

| Secret Name | Value |
|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your `anon` public key |

## 4. Authentication (Optional)
This app is designed to work with or without authentication. If you want to enable multi-user support, you can integrate Supabase Auth. The `userId` field is already included in the `saveEvent` logic structure.

## 5. Deployment
Once the secrets are added, the app will automatically switch from `localStorage` to your real Supabase database.
