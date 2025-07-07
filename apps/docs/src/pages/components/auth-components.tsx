export default function AuthComponentsPage() {
  return (
    <div className="prose max-w-none">
      <h1>🧩 Authentication Components</h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-900 font-semibold mb-1">🎨 Pre-built UI Components</p>
        <p className="text-green-800">
          NextSaaS includes a complete set of authentication UI components that are production-ready,
          accessible, and fully customizable.
        </p>
      </div>

      <h2>📋 Component Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📝 Forms & Authentication</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• LoginForm - Sign in with validation</li>
            <li>• SignUpForm - Registration with organization</li>
            <li>• ForgotPasswordForm - Password reset</li>
            <li>• UpdatePasswordForm - Change password</li>
            <li>• ProfileForm - Complete profile editing</li>
          </ul>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">🏢 Organization Components</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• AccountDropdown - User menu</li>
            <li>• OrganizationSwitcher - Switch orgs</li>
            <li>• UserAvatar - Avatar with fallbacks</li>
            <li>• MembersList - Member management</li>
            <li>• InvitationForm - Invite new members</li>
          </ul>
        </div>
      </div>

      <h2>🔐 Authentication Forms</h2>

      <h3>LoginForm</h3>
      
      <p>Complete sign-in form with email/password and social login options.</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Usage</h4>
        <pre><code>{`import { LoginForm } from '@nextsaas/auth/components';

<LoginForm 
  redirectTo="/dashboard"
  showSocialLogins={true}
  showRememberMe={true}
  onSuccess={(user) => console.log('Logged in:', user)}
  onError={(error) => console.log('Error:', error)}
/>`}</code></pre>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Props</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Prop</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Default</th>
                <th className="text-left p-2">Description</th>
              </tr>
            </thead>
            <tbody className="space-y-1">
              <tr className="border-b">
                <td className="p-2"><code>redirectTo</code></td>
                <td className="p-2">string</td>
                <td className="p-2">'/dashboard'</td>
                <td className="p-2">Where to redirect after successful login</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>showSocialLogins</code></td>
                <td className="p-2">boolean</td>
                <td className="p-2">true</td>
                <td className="p-2">Show social login buttons</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>showRememberMe</code></td>
                <td className="p-2">boolean</td>
                <td className="p-2">true</td>
                <td className="p-2">Show remember me checkbox</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>onSuccess</code></td>
                <td className="p-2">function</td>
                <td className="p-2">-</td>
                <td className="p-2">Callback on successful login</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>onError</code></td>
                <td className="p-2">function</td>
                <td className="p-2">-</td>
                <td className="p-2">Callback on login error</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-blue-900 font-semibold mb-2">✨ Features</h4>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• ✅ Real-time validation with error messages</li>
          <li>• ✅ Social login buttons (Google, GitHub, Microsoft, Apple)</li>
          <li>• ✅ Remember me functionality</li>
          <li>• ✅ Loading states and error handling</li>
          <li>• ✅ Responsive design for all screen sizes</li>
          <li>• ✅ Keyboard navigation and accessibility</li>
        </ul>
      </div>

      <h3>SignUpForm</h3>
      
      <p>Registration form with organization creation and email verification.</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Usage</h4>
        <pre><code>{`import { SignUpForm } from '@nextsaas/auth/components';

<SignUpForm 
  organizationMode="multi"
  showSocialLogins={true}
  requireTerms={true}
  onSuccess={(user) => console.log('Registered:', user)}
  redirectTo="/auth/verify-email"
/>`}</code></pre>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-blue-900 font-semibold mb-2">🏢 Organization Integration</h4>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• <strong>Multi Mode:</strong> Creates organization during signup</li>
          <li>• <strong>Single Mode:</strong> Auto-creates personal organization</li>
          <li>• <strong>None Mode:</strong> No organization creation</li>
          <li>• Validates organization name and generates slug</li>
          <li>• Sets user as organization owner</li>
        </ul>
      </div>

      <h3>UpdatePasswordForm</h3>
      
      <p>Password change form with real-time strength validation.</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Usage</h4>
        <pre><code>{`import { UpdatePasswordForm } from '@nextsaas/auth/components';

<UpdatePasswordForm 
  showStrengthIndicator={true}
  requireCurrentPassword={true}
  onSuccess={() => console.log('Password updated')}
/>`}</code></pre>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="text-green-900 font-semibold mb-2">🔒 Security Features</h4>
        <ul className="text-green-800 space-y-1 text-sm">
          <li>• Real-time password strength indicator</li>
          <li>• Configurable password requirements</li>
          <li>• Current password verification</li>
          <li>• Password confirmation matching</li>
          <li>• Visual feedback for all requirements</li>
        </ul>
      </div>

      <h3>ProfileForm</h3>
      
      <p>Complete user profile editing with avatar upload and validation.</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Usage</h4>
        <pre><code>{`import { ProfileForm } from '@nextsaas/auth/components';

<ProfileForm 
  enableAvatarUpload={true}
  fields={['firstName', 'lastName', 'bio', 'phone', 'website']}
  maxAvatarSize={5} // MB
  onSuccess={(profile) => console.log('Profile updated:', profile)}
/>`}</code></pre>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <h4 className="text-purple-900 font-semibold mb-2">📸 Avatar Upload</h4>
        <ul className="text-purple-800 space-y-1 text-sm">
          <li>• Drag & drop or click to upload</li>
          <li>• Image preview before saving</li>
          <li>• Automatic resizing and optimization</li>
          <li>• File type and size validation</li>
          <li>• Fallback to user initials</li>
        </ul>
      </div>

      <h2>🏢 Organization Components</h2>

      <h3>AccountDropdown</h3>
      
      <p>User menu dropdown with organization context and navigation.</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Usage</h4>
        <pre><code>{`import { AccountDropdown } from '@nextsaas/auth/components';

<AccountDropdown 
  showOrganization={true}
  avatarUrl={user.avatar_url}
  customTrigger={<CustomButton />}
  menuItems={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' }
  ]}
/>`}</code></pre>
      </div>

      <h3>OrganizationSwitcher</h3>
      
      <p>Dropdown to switch between user's organizations.</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Usage</h4>
        <pre><code>{`import { OrganizationSwitcher } from '@nextsaas/auth/components';

<OrganizationSwitcher 
  showMemberCount={true}
  showCreateButton={true}
  onSwitch={(org) => console.log('Switched to:', org)}
  onCreateNew={() => router.push('/organizations/new')}
/>`}</code></pre>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-blue-900 font-semibold mb-2">🔄 Organization Context</h4>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Automatically updates app context when switching</li>
          <li>• Shows user's role in each organization</li>
          <li>• Displays member count for each organization</li>
          <li>• Keyboard navigation support</li>
          <li>• Loading states during organization switch</li>
        </ul>
      </div>

      <h3>MembersList</h3>
      
      <p>Complete member management with roles, invitations, and permissions.</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Usage</h4>
        <pre><code>{`import { MembersList } from '@nextsaas/auth/components';

<MembersList 
  organizationId={org.id}
  showInviteButton={true}
  showRoleEditor={true}
  allowRemoval={userRole === 'owner'}
  onInvite={(emails) => console.log('Invited:', emails)}
  onRoleChange={(userId, role) => console.log('Role changed')}
  onRemove={(userId) => console.log('Member removed')}
/>`}</code></pre>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="text-green-900 font-semibold mb-2">👥 Member Management</h4>
        <ul className="text-green-800 space-y-1 text-sm">
          <li>• View all organization members with roles</li>
          <li>• Change member roles (if permission allows)</li>
          <li>• Remove members (if permission allows)</li>
          <li>• View pending invitations</li>
          <li>• Resend or cancel invitations</li>
          <li>• Member activity status (last seen)</li>
        </ul>
      </div>

      <h3>InvitationForm</h3>
      
      <p>Invite new members to organizations with role selection.</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Usage</h4>
        <pre><code>{`import { InvitationForm } from '@nextsaas/auth/components';

<InvitationForm 
  organizationId={org.id}
  availableRoles={['admin', 'member']}
  allowMultiple={true}
  showMessage={true}
  onInvite={(invitations) => console.log('Sent:', invitations)}
/>`}</code></pre>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h4 className="text-yellow-900 font-semibold mb-2">📧 Invitation Features</h4>
        <ul className="text-yellow-800 space-y-1 text-sm">
          <li>• Bulk email invitation support</li>
          <li>• Role selection for each invitee</li>
          <li>• Optional personal message</li>
          <li>• Email validation and duplicate detection</li>
          <li>• Preview invitation email before sending</li>
        </ul>
      </div>

      <h3>UserAvatar</h3>
      
      <p>User avatar component with intelligent fallbacks.</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Usage</h4>
        <pre><code>{`import { UserAvatar } from '@nextsaas/auth/components';

<UserAvatar 
  user={user}
  size="lg"
  showOnlineStatus={true}
  fallbackToInitials={true}
  onClick={() => console.log('Avatar clicked')}
/>`}</code></pre>
      </div>

      <h2>🎨 Styling & Customization</h2>

      <h3>CSS Variables</h3>
      
      <p>Customize component appearance using CSS variables:</p>

      <pre><code>{`:root {
  /* Auth form styling */
  --auth-form-bg: #ffffff;
  --auth-form-border: #e5e7eb;
  --auth-form-radius: 0.5rem;
  
  /* Button styling */
  --auth-button-primary: #3b82f6;
  --auth-button-primary-hover: #2563eb;
  
  /* Input styling */
  --auth-input-border: #d1d5db;
  --auth-input-focus: #3b82f6;
  
  /* Error styling */
  --auth-error-color: #ef4444;
  --auth-error-bg: #fef2f2;
}`}</code></pre>

      <h3>Tailwind Classes</h3>
      
      <p>Override default styling with Tailwind classes:</p>

      <pre><code>{`<LoginForm 
  className="max-w-md mx-auto"
  formClassName="space-y-6"
  buttonClassName="w-full bg-purple-600 hover:bg-purple-700"
  inputClassName="rounded-lg border-gray-300"
/>`}</code></pre>

      <h3>Custom Themes</h3>
      
      <p>Create custom themes for different use cases:</p>

      <pre><code>{`// Dark theme
<div className="auth-dark-theme">
  <LoginForm />
</div>

// Brand theme
<div className="auth-brand-theme">
  <SignUpForm />
</div>

/* CSS */
.auth-dark-theme {
  --auth-form-bg: #1f2937;
  --auth-form-border: #374151;
  --auth-text-color: #f9fafb;
}

.auth-brand-theme {
  --auth-button-primary: #your-brand-color;
  --auth-form-radius: 1rem;
}`}</code></pre>

      <h2>♿ Accessibility Features</h2>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="text-green-900 font-semibold mb-2">🌟 Built-in Accessibility</h4>
        <ul className="text-green-800 space-y-1 text-sm">
          <li>• <strong>ARIA Labels:</strong> All form elements properly labeled</li>
          <li>• <strong>Keyboard Navigation:</strong> Full keyboard support</li>
          <li>• <strong>Screen Reader Support:</strong> Compatible with assistive technologies</li>
          <li>• <strong>Focus Management:</strong> Logical focus order and visible indicators</li>
          <li>• <strong>Color Contrast:</strong> WCAG AA compliant contrast ratios</li>
          <li>• <strong>Error Announcements:</strong> Form errors announced to screen readers</li>
          <li>• <strong>Loading States:</strong> Progress indicators for async operations</li>
        </ul>
      </div>

      <h3>Keyboard Shortcuts</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 border-b">Component</th>
              <th className="text-left p-3 border-b">Shortcut</th>
              <th className="text-left p-3 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">All Forms</td>
              <td className="p-3"><kbd>Enter</kbd></td>
              <td className="p-3">Submit form</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">All Forms</td>
              <td className="p-3"><kbd>Tab</kbd></td>
              <td className="p-3">Navigate between fields</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Dropdowns</td>
              <td className="p-3"><kbd>Arrow Keys</kbd></td>
              <td className="p-3">Navigate options</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Dropdowns</td>
              <td className="p-3"><kbd>Escape</kbd></td>
              <td className="p-3">Close dropdown</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Modals</td>
              <td className="p-3"><kbd>Escape</kbd></td>
              <td className="p-3">Close modal</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>🔧 Advanced Usage</h2>

      <h3>Custom Validation</h3>

      <pre><code>{`import { LoginForm } from '@nextsaas/auth/components';
import { z } from 'zod';

const customValidation = z.object({
  email: z.string().email().refine(
    (email) => email.endsWith('@company.com'),
    'Must use company email'
  ),
  password: z.string().min(12, 'Password must be at least 12 characters')
});

<LoginForm 
  validationSchema={customValidation}
  onValidationError={(errors) => console.log(errors)}
/>`}</code></pre>

      <h3>Custom Submit Handlers</h3>

      <pre><code>{`<SignUpForm 
  onSubmit={async (data) => {
    // Custom pre-processing
    const processedData = await preprocessUserData(data);
    
    // Custom API call
    const result = await customSignUp(processedData);
    
    // Custom post-processing
    await trackSignUpEvent(result.user);
    
    return result;
  }}
/>`}</code></pre>

      <h3>Integration with State Management</h3>

      <pre><code>{`import { useDispatch } from 'react-redux';
import { loginSuccess } from './authSlice';

function MyLoginForm() {
  const dispatch = useDispatch();
  
  return (
    <LoginForm 
      onSuccess={(user) => {
        dispatch(loginSuccess(user));
        // Additional state updates
      }}
    />
  );
}`}</code></pre>

      <h2>🚨 Error Handling</h2>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h4 className="text-red-900 font-semibold mb-2">🛠️ Built-in Error Handling</h4>
        <ul className="text-red-800 space-y-1 text-sm">
          <li>• <strong>Network Errors:</strong> Automatic retry with user feedback</li>
          <li>• <strong>Validation Errors:</strong> Real-time field-level validation</li>
          <li>• <strong>Auth Errors:</strong> User-friendly error messages</li>
          <li>• <strong>Rate Limiting:</strong> Clear messaging when limits exceeded</li>
          <li>• <strong>Server Errors:</strong> Graceful degradation with fallbacks</li>
        </ul>
      </div>

      <h3>Custom Error Handling</h3>

      <pre><code>{`<LoginForm 
  onError={(error) => {
    // Log to analytics
    analytics.track('login_error', { error: error.code });
    
    // Show custom toast
    toast.error(\`Login failed: \${error.message}\`);
    
    // Redirect on specific errors
    if (error.code === 'email_not_verified') {
      router.push('/auth/verify-email');
    }
  }}
/>`}</code></pre>

      <h2>📱 Responsive Design</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-blue-900 font-semibold mb-2">📱 Mobile-First Approach</h4>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• All components are mobile-first and responsive</li>
          <li>• Touch-friendly buttons and form elements</li>
          <li>• Optimized layouts for different screen sizes</li>
          <li>• Proper viewport handling for mobile devices</li>
          <li>• Swipe gestures for applicable components</li>
        </ul>
      </div>

      <h2>🔗 Next Steps</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
        <a href="/features/authentication" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">📖 Auth Documentation</h4>
          <p className="text-sm text-gray-600">Complete authentication system guide</p>
        </a>
        
        <a href="/features/auth-setup" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">⚙️ Setup Guide</h4>
          <p className="text-sm text-gray-600">Step-by-step authentication setup</p>
        </a>
        
        <a href="/components" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">🎨 All Components</h4>
          <p className="text-sm text-gray-600">Explore the complete component library</p>
        </a>
      </div>
    </div>
  );
}