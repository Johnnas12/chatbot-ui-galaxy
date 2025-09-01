# Chatbot UI Galaxy

A modern, feature-rich chatbot interface with Supabase authentication, real-time chat persistence, and user-based session management.

## Features

- 🔐 **Supabase Authentication** - Secure user login/signup with session management
- 💬 **Real-time Chat** - Live chat updates across devices with Supabase real-time
- 📱 **User-based Sessions** - Each user has their own private chat history
- 🎨 **Modern UI** - Beautiful, responsive design with dark/light theme support
- 📝 **Session Management** - Create, delete, and organize chat sessions
- 🔄 **Real-time Updates** - Chat sessions sync instantly across all devices
- 🛡️ **Route Protection** - Secure routes with automatic authentication redirects
- ⚙️ **Settings Panel** - User settings with logout functionality
- 📊 **Session History** - Persistent chat history with timestamps

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Supabase account and project

### Environment Setup

1. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Set up your Supabase database by running the migration:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `supabase/migrations/20241201000000_create_chat_sessions.sql`
   - Execute the SQL

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Database Schema

The application uses a `chat_sessions` table with the following structure:

- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `title` (Text) - Chat session title
- `timestamp` (Timestamptz) - Session creation time
- `messages` (JSONB) - Array of chat messages
- `created_at` (Timestamptz) - Record creation time
- `updated_at` (Timestamptz) - Record update time

## API Configuration

Edit the API configuration in `src/hooks/useChat.tsx`:

```typescript
const API_CONFIG = {
  baseUrl: "http://localhost:8000",
  endpoint: "/suggest-tools-enhanced",
  model: "local-model",
} as const;
```

## Features in Detail

### Authentication
- Secure login/signup with Supabase Auth
- Automatic session persistence
- Route protection for authenticated users
- Automatic redirects for unauthenticated users

### Real-time Chat
- Live message updates using Supabase real-time subscriptions
- Cross-device synchronization
- Optimistic UI updates for better user experience

### Session Management
- Create new chat sessions
- Delete individual sessions
- Automatic session title generation from first message
- Session history with timestamps

### User Interface
- Responsive sidebar with navigation
- Theme toggle (dark/light mode)
- User information display
- Settings dropdown with logout option

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

## License

This project is licensed under the MIT License.