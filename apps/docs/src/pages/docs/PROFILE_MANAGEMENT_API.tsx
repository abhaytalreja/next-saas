export default function ProfileManagementAPIPage() {
  return (
    <div className="prose max-w-none">
      <h1>🔌 Profile Management API Reference</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900 font-semibold mb-1">📖 API Documentation</p>
        <p className="text-blue-800">Complete API reference for the NextSaaS Profile Management System. All endpoints support organization context and role-based access control.</p>
      </div>

      <h2>🔐 Authentication</h2>
      
      <p>All API endpoints require authentication. Include the Authorization header:</p>

      <pre><code>Authorization: Bearer &lt;access_token&gt;</code></pre>

      <h2>🌐 Base URLs</h2>

      <pre><code>{`Development: http://localhost:3000/api
Production: https://your-app.com/api`}</code></pre>

      <h2>👤 Profile Endpoints</h2>

      <h3>Get User Profile</h3>
      
      <p>Retrieve the current user's profile information.</p>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">GET</span>
          <code>/api/profile</code>
        </div>
        
        <h4 className="font-semibold mt-4 mb-2">Parameters:</h4>
        <ul className="text-sm">
          <li><code>organization_id</code> (optional): Filter profile by organization context</li>
        </ul>

        <h4 className="font-semibold mt-4 mb-2">Response:</h4>
        <pre><code>{`{
  "success": true,
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://storage.example.com/avatar.jpg",
    "bio": "Software engineer",
    "location": "San Francisco, CA",
    "timezone": "America/Los_Angeles",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z",
    "profile_completeness": 85
  },
  "organization_context": {
    "organization_id": "uuid",
    "role": "member",
    "permissions": ["profile:read", "profile:update"]
  }
}`}</code></pre>
      </div>

      <h3>Update User Profile</h3>
      
      <p>Update the current user's profile information.</p>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">PATCH</span>
          <code>/api/profile</code>
        </div>
        
        <h4 className="font-semibold mt-4 mb-2">Request Body:</h4>
        <pre><code>{`{
  "full_name": "John Smith",
  "bio": "Senior Software Engineer",
  "location": "New York, NY",
  "timezone": "America/New_York"
}`}</code></pre>

        <h4 className="font-semibold mt-4 mb-2">Validation:</h4>
        <ul className="text-sm">
          <li><code>full_name</code>: 2-100 characters</li>
          <li><code>bio</code>: 0-500 characters</li>
          <li><code>location</code>: 0-100 characters</li>
          <li><code>timezone</code>: Valid timezone identifier</li>
        </ul>
      </div>

      <h2>🖼️ Avatar Endpoints</h2>

      <h3>Upload Avatar</h3>
      
      <p>Upload a new profile avatar.</p>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">POST</span>
          <code>/api/profile/avatar</code>
        </div>
        
        <h4 className="font-semibold mt-4 mb-2">Request:</h4>
        <p className="text-sm">Multipart form data</p>
        <ul className="text-sm">
          <li><code>file</code>: Image file (JPEG, PNG, WebP, max 5MB)</li>
        </ul>

        <h4 className="font-semibold mt-4 mb-2">Response:</h4>
        <pre><code>{`{
  "success": true,
  "avatar": {
    "id": "uuid",
    "public_url": "https://storage.example.com/avatars/user-id/avatar-timestamp.webp",
    "original_filename": "profile.jpg",
    "variants": {
      "small": "https://storage.example.com/avatars/user-id/avatar-timestamp_small.webp",
      "medium": "https://storage.example.com/avatars/user-id/avatar-timestamp_medium.webp",
      "large": "https://storage.example.com/avatars/user-id/avatar-timestamp_large.webp"
    },
    "file_size": 204800,
    "width": 256,
    "height": 256,
    "is_active": false
  }
}`}</code></pre>
      </div>

      <h3>Activate Avatar</h3>
      
      <p>Set an avatar as the current active avatar.</p>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">PATCH</span>
          <code>/api/profile/avatar</code>
        </div>
        
        <h4 className="font-semibold mt-4 mb-2">Request Body:</h4>
        <pre><code>{`{
  "avatarId": "uuid",
  "action": "activate"
}`}</code></pre>
      </div>

      <h3>Delete Avatar</h3>
      
      <p>Delete a specific avatar.</p>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">DELETE</span>
          <code>/api/profile/avatar?id={`{avatarId}`}</code>
        </div>
      </div>

      <h2>📊 Activity Endpoints</h2>

      <h3>Get User Activity</h3>
      
      <p>Retrieve user activity logs.</p>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">GET</span>
          <code>/api/profile/activity</code>
        </div>
        
        <h4 className="font-semibold mt-4 mb-2">Parameters:</h4>
        <ul className="text-sm">
          <li><code>limit</code> (optional): Number of records (default: 50, max: 100)</li>
          <li><code>offset</code> (optional): Pagination offset (default: 0)</li>
          <li><code>type</code> (optional): Filter by activity type</li>
          <li><code>organization_id</code> (optional): Filter by organization</li>
        </ul>

        <h4 className="font-semibold mt-4 mb-2">Response:</h4>
        <pre><code>{`{
  "success": true,
  "activity": [
    {
      "id": "uuid",
      "activity_type": "profile",
      "action": "profile_update",
      "description": "Updated profile information",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "organization_id": "uuid",
      "created_at": "2024-01-15T12:00:00Z",
      "details": {
        "fields_updated": ["full_name", "bio"]
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}`}</code></pre>
      </div>

      <h2>⚙️ Preferences Endpoints</h2>

      <h3>Get User Preferences</h3>
      
      <p>Retrieve user preferences.</p>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">GET</span>
          <code>/api/profile/preferences</code>
        </div>
        
        <h4 className="font-semibold mt-4 mb-2">Response:</h4>
        <pre><code>{`{
  "success": true,
  "preferences": {
    "id": "uuid",
    "user_id": "uuid",
    "notifications": {
      "email_enabled": true,
      "push_enabled": false,
      "digest_frequency": "weekly"
    },
    "privacy": {
      "profile_visibility": "public",
      "email_visibility": "private",
      "activity_visibility": "organization"
    },
    "display": {
      "theme": "light",
      "language": "en",
      "timezone": "America/Los_Angeles"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
}`}</code></pre>
      </div>

      <h2>📥 Data Export Endpoints</h2>

      <h3>Request Data Export</h3>
      
      <p>Request a data export for the current user.</p>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">POST</span>
          <code>/api/profile/export</code>
        </div>
        
        <h4 className="font-semibold mt-4 mb-2">Request Body:</h4>
        <pre><code>{`{
  "format": "json",
  "include_activity": true,
  "include_preferences": true,
  "organization_id": "uuid"
}`}</code></pre>

        <h4 className="font-semibold mt-4 mb-2">Response:</h4>
        <pre><code>{`{
  "success": true,
  "export_id": "uuid",
  "status": "processing",
  "estimated_completion": "2024-01-15T13:00:00Z"
}`}</code></pre>
      </div>

      <h3>Get Export Status</h3>
      
      <p>Check the status of a data export.</p>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">GET</span>
          <code>/api/profile/export/{`{exportId}`}</code>
        </div>
        
        <h4 className="font-semibold mt-4 mb-2">Status Values:</h4>
        <ul className="text-sm">
          <li><code>processing</code>: Export is being generated</li>
          <li><code>completed</code>: Export is ready for download</li>
          <li><code>failed</code>: Export failed</li>
          <li><code>expired</code>: Export has expired</li>
        </ul>
      </div>

      <h2>🔧 Storage Endpoints</h2>

      <h3>Upload File</h3>
      
      <p>Upload a file to Backblaze B2 storage.</p>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">POST</span>
          <code>/api/storage/upload</code>
        </div>
        
        <h4 className="font-semibold mt-4 mb-2">Request:</h4>
        <p className="text-sm">Multipart form data</p>
        <ul className="text-sm">
          <li><code>file</code>: File to upload</li>
          <li><code>path</code>: Storage path</li>
        </ul>
      </div>

      <h2>❌ Error Handling</h2>
      
      <p>All endpoints return errors in the following format:</p>

      <pre><code>{`{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation message"
  }
}`}</code></pre>

      <h3>Common Error Codes</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium"><code>UNAUTHORIZED</code></h4>
          <p className="text-sm text-gray-600">Authentication required</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium"><code>FORBIDDEN</code></h4>
          <p className="text-sm text-gray-600">Insufficient permissions</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium"><code>VALIDATION_ERROR</code></h4>
          <p className="text-sm text-gray-600">Request validation failed</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium"><code>RATE_LIMITED</code></h4>
          <p className="text-sm text-gray-600">Too many requests</p>
        </div>
      </div>

      <h2>⚡ Rate Limiting</h2>
      
      <p>API endpoints are rate limited:</p>

      <ul>
        <li>Profile operations: 100 requests per minute</li>
        <li>Avatar uploads: 10 requests per minute</li>
        <li>Data exports: 5 requests per hour</li>
      </ul>

      <p>Rate limit headers are included in responses:</p>

      <pre><code>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641024000`}</code></pre>

      <h2>🔗 SDK Usage</h2>

      <h3>JavaScript/TypeScript</h3>

      <pre><code>{`import { ProfileAPI } from '@nextsaas/auth'

const profileAPI = new ProfileAPI({
  baseURL: 'https://your-app.com/api',
  token: 'your-access-token'
})

// Get profile
const profile = await profileAPI.getProfile()

// Update profile
const updatedProfile = await profileAPI.updateProfile({
  full_name: 'New Name'
})

// Upload avatar
const avatar = await profileAPI.uploadAvatar(file)`}</code></pre>

      <h3>React Hooks</h3>

      <pre><code>{`import { useProfile, useAvatar } from '@nextsaas/auth'

function ProfileComponent() {
  const { profile, updateProfile, loading } = useProfile()
  const { uploadAvatar, avatars } = useAvatar()

  const handleUpdate = async (data) => {
    await updateProfile(data)
  }

  return (
    <div>
      {loading ? 'Loading...' : profile.full_name}
    </div>
  )
}`}</code></pre>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
        <p className="text-green-900 font-semibold mb-1">📖 Complete Reference</p>
        <p className="text-green-800">This API reference provides comprehensive documentation for all profile management endpoints. For implementation guides and examples, see the <a href="/docs/PROFILE_MANAGEMENT_GUIDE" className="text-green-600 underline">Profile Management Guide</a>.</p>
      </div>
    </div>
  );
}