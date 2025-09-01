# Database Setup Guide

## Setting up the chat_sessions table in Supabase

1. **Run the migration in Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `supabase/migrations/20241201000000_create_chat_sessions.sql`
   - Execute the SQL

2. **Or use Supabase CLI (if you have it installed):**
   ```bash
   supabase db push
   ```

3. **Verify the table was created:**
   - Go to Table Editor in your Supabase dashboard
   - You should see a `chat_sessions` table with the following columns:
     - `id` (UUID, Primary Key)
     - `user_id` (UUID, Foreign Key to auth.users)
     - `title` (Text)
     - `timestamp` (Timestamptz)
     - `messages` (JSONB)
     - `created_at` (Timestamptz)
     - `updated_at` (Timestamptz)

4. **Enable Real-time:**
   - The migration automatically enables real-time for the chat_sessions table
   - You can verify this in the Database > Replication settings

## Features Added:

✅ **User-based chat sessions** - Each user only sees their own chats
✅ **Real-time updates** - Chat sessions update in real-time across devices
✅ **Session persistence** - All chat data is stored in Supabase
✅ **Row Level Security** - Users can only access their own data
✅ **Settings functionality** - Logout button in sidebar
✅ **Route protection** - Unauthenticated users are redirected to login
✅ **Session deletion** - Users can delete individual chat sessions

## Environment Variables:

Make sure you have these environment variables set in your `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
