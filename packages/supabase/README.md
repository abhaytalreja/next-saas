# NextSaaS Supabase Integration

A comprehensive Supabase integration package for NextSaaS, providing authentication, database operations, real-time subscriptions, and file storage with multiple provider support (Backblaze B2, AWS S3, and Supabase Storage).

## 🚀 Features

- **Multi-Environment Support**: Separate clients for browser, server, and admin operations
- **Complete Authentication**: Email/password, OAuth, magic links, and phone authentication
- **Type-Safe Database Operations**: Full TypeScript support with generated types
- **Real-Time Subscriptions**: Live data updates and presence tracking
- **Flexible File Storage**: Support for Backblaze B2, AWS S3, and Supabase Storage
- **Row Level Security**: Built-in RLS support for multi-tenant applications
- **Error Handling**: Comprehensive error handling with custom error types
- **React Hooks**: Ready-to-use hooks for authentication and real-time features

## 📦 Installation

```bash
npm install @nextsaas/supabase
```

## 🔧 Configuration

### Environment Variables

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Storage Provider Configuration
STORAGE_PROVIDER=backblaze # or 's3' or 'supabase'

# Backblaze B2 (if using Backblaze)
BACKBLAZE_KEY_ID=your-key-id
BACKBLAZE_APPLICATION_KEY=your-app-key
BACKBLAZE_BUCKET_ID=your-bucket-id
BACKBLAZE_BUCKET_NAME=your-bucket-name

# AWS S3 (if using S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ENDPOINT=https://s3.amazonaws.com # optional

# OAuth Providers (optional)
NEXT_PUBLIC_SUPABASE_OAUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_SUPABASE_OAUTH_GITHUB_ENABLED=true
```

## 🎯 Quick Start

### Client Setup

```typescript
// Browser client
import { getSupabaseBrowserClient } from '@nextsaas/supabase';
const supabase = getSupabaseBrowserClient();

// Server client (App Router)
import { createSupabaseServerClient } from '@nextsaas/supabase';
const supabase = createSupabaseServerClient();

// Admin client (bypasses RLS)
import { getSupabaseAdminClient } from '@nextsaas/supabase';
const supabase = getSupabaseAdminClient();
```

### Authentication

```typescript
import { useAuth } from '@nextsaas/supabase';

function LoginComponent() {
  const { signIn, signUp, signOut, user, loading } = useAuth();

  const handleSignIn = async () => {
    const { data, error } = await signIn({
      email: 'user@example.com',
      password: 'password',
    });
  };

  const handleOAuth = async () => {
    await signInWithOAuth({
      provider: 'google',
      redirectTo: '/dashboard',
    });
  };

  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
    </div>
  );
}
```

### Database Operations

```typescript
import { getUserById, searchUsers, updateUserProfile } from '@nextsaas/supabase';

// Get user by ID
const { data: user, error } = await getUserById(supabase, userId);

// Search users
const { data: users, error } = await searchUsers(supabase, 'john', {
  limit: 10,
  orderBy: [{ column: 'created_at', ascending: false }],
});

// Update user profile
const { data: updated, error } = await updateUserProfile(supabase, userId, {
  name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
});
```

### Real-Time Subscriptions

```typescript
import { useRealtimeSubscription } from '@nextsaas/supabase';

function LiveComponent() {
  // Subscribe to table changes
  useRealtimeSubscription('projects', (payload) => {
    console.log('Change received:', payload);
  }, {
    event: 'INSERT',
    filter: 'organization_id=eq.123',
  });

  // Presence tracking
  const { onlineUsers, updatePresence } = usePresence({
    channelName: 'room-123',
    userInfo: {
      id: user.id,
      email: user.email,
      name: user.name,
      color: '#FF5733',
    },
  });

  return (
    <div>
      <h3>Online Users ({onlineUsers.length})</h3>
      {onlineUsers.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### File Storage

```typescript
import { StorageClient } from '@nextsaas/supabase';

// Initialize storage client
const storage = new StorageClient({
  provider: 'backblaze', // or 's3' or 'supabase'
  backblaze: {
    applicationKeyId: process.env.BACKBLAZE_KEY_ID!,
    applicationKey: process.env.BACKBLAZE_APPLICATION_KEY!,
    bucketId: process.env.BACKBLAZE_BUCKET_ID!,
    bucketName: process.env.BACKBLAZE_BUCKET_NAME!,
  },
});

// Upload file
const { data, error } = await storage.upload({
  bucket: 'avatars',
  path: `user-${userId}/avatar.jpg`,
  file: file,
  metadata: {
    userId: userId,
    uploadedAt: new Date().toISOString(),
  },
}, (progress) => {
  console.log(`Upload progress: ${progress.percentage}%`);
});

// Get signed URL
const { data: url } = await storage.createSignedUrl('avatars', path, {
  expiresIn: 3600, // 1 hour
  download: true,
});
```

## 🔒 Security

### Row Level Security (RLS)

All database operations respect RLS policies by default. Use the admin client only when necessary:

```typescript
// Regular client (respects RLS)
const supabase = getSupabaseBrowserClient();
const { data } = await supabase.from('projects').select('*');

// Admin client (bypasses RLS) - use with caution!
const adminSupabase = getSupabaseAdminClient();
const { data } = await adminSupabase.from('projects').select('*');
```

### Best Practices

1. Always use environment variables for sensitive keys
2. Never expose service role keys to the client
3. Implement proper error handling
4. Use RLS policies for data isolation
5. Validate all user inputs
6. Use signed URLs for temporary file access

## 🛠️ Advanced Usage

### Custom Error Handling

```typescript
import { withErrorHandling, SupabaseError } from '@nextsaas/supabase';

try {
  const result = await withErrorHandling(
    () => getUserById(supabase, userId),
    'Failed to fetch user'
  );
} catch (error) {
  if (error instanceof SupabaseError) {
    console.error(`Error ${error.code}: ${error.message}`);
  }
}
```

### Middleware Setup

```typescript
// middleware.ts
import { updateSession } from '@nextsaas/supabase';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### Type Generation

Generate TypeScript types from your Supabase schema:

```bash
npm run generate:types
```

## 📚 API Reference

### Authentication

- `useAuth()` - Authentication hook with all auth methods
- `useSession()` - Session management hook
- `signInWithEmail()` - Email/password authentication
- `signInWithOAuth()` - OAuth provider authentication
- `signInWithMagicLink()` - Passwordless authentication
- `signInWithPhone()` - Phone/SMS authentication

### Database

- `getUserById()` - Get user by ID
- `getUserByEmail()` - Get user by email
- `createUserProfile()` - Create user profile
- `updateUserProfile()` - Update user profile
- `getOrganizationById()` - Get organization by ID
- `createOrganizationWithOwner()` - Create organization with owner
- `getUserOrganizations()` - Get user's organizations

### Real-time

- `useRealtimeSubscription()` - Subscribe to table changes
- `usePresence()` - User presence tracking
- `useCursorPresence()` - Cursor tracking for collaboration
- `SubscriptionManager` - Low-level subscription management

### Storage

- `StorageClient` - Unified storage client
- `upload()` - Upload files with progress
- `download()` - Download files
- `createSignedUrl()` - Generate temporary URLs
- `list()` - List files in bucket
- `delete()` - Delete files

## 🤝 Contributing

See the main NextSaaS contributing guide for details.

## 📄 License

MIT