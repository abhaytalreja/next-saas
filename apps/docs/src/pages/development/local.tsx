export default function DevelopmentPage() {
  return (
    <div className="prose max-w-none">
      <h1>Development Guide</h1>

      <p>This guide covers development workflows, best practices, and tips for working with NextSaaS.</p>

      <h2>Development Workflow</h2>

      <h3>Starting Development</h3>

      <pre><code>{`# Start all applications
npm run dev

# Start specific app only
npm run dev -- --filter=@nextsaas/web

# Start with debugging enabled
DEBUG=* npm run dev`}</code></pre>

      <h3>Making Changes</h3>

      <ol>
        <li><strong>Create a feature branch</strong>
          <pre><code>git checkout -b feature/your-feature-name</code></pre>
        </li>
        <li><strong>Make your changes</strong> following the coding standards</li>
        <li><strong>Test your changes</strong>
          <pre><code>{`npm run test
npm run type-check
npm run lint`}</code></pre>
        </li>
        <li><strong>Commit using conventional commits</strong>
          <pre><code>{`git add .
git commit -m "feat: add new feature"`}</code></pre>
        </li>
      </ol>

      <h2>Working with Shared Packages</h2>

      <h3>Creating New Components</h3>

      <ol>
        <li><strong>Create component directory</strong>
          <pre><code>{`mkdir packages/ui/src/components/Card
cd packages/ui/src/components/Card`}</code></pre>
        </li>
        <li><strong>Create component files</strong>
          <pre><code>touch Card.tsx index.ts</code></pre>
        </li>
        <li><strong>Write the component</strong>
          <pre><code>{`// packages/ui/src/components/Card/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined';
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default' 
}: CardProps) {
  const baseStyles = 'rounded-lg p-6';
  const variantStyles = {
    default: 'bg-white shadow-md',
    outlined: 'bg-transparent border border-gray-200'
  };

  return (
    <div className={\`\${baseStyles} \${variantStyles[variant]} \${className}\`}>
      {children}
    </div>
  );
}`}</code></pre>
        </li>
        <li><strong>Export the component</strong>
          <pre><code>{`// packages/ui/src/components/Card/index.ts
export { Card } from './Card';

// packages/ui/src/index.ts
export * from './components/Card';`}</code></pre>
        </li>
        <li><strong>Use in any app</strong>
          <pre><code>{`import { Card } from '@nextsaas/ui';

export default function MyPage() {
  return (
    <Card variant="outlined" className="max-w-md">
      <h2>Hello World</h2>
      <p>This is a card component</p>
    </Card>
  );
}`}</code></pre>
        </li>
      </ol>

      <h2>Code Standards</h2>

      <h3>TypeScript Best Practices</h3>

      <pre><code>{`// ✅ Good - Explicit types and interfaces
interface UserProps {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  metadata?: Record<string, unknown>;
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

// ❌ Avoid - Any types and unclear interfaces
const user: any = { name: 'John' };`}</code></pre>

      <h3>React Component Patterns</h3>

      <pre><code>{`// ✅ Good - Functional component with proper typing
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}`}</code></pre>

      <h2>Performance Optimization</h2>

      <h3>Code Splitting</h3>

      <pre><code>{`import dynamic from 'next/dynamic';

// Lazy load heavy components
const Chart = dynamic(() => import('./Chart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,
});`}</code></pre>

      <h3>Image Optimization</h3>

      <pre><code>{`import Image from 'next/image';

export function Avatar({ src, alt, size = 40 }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
    />
  );
}`}</code></pre>

      <h2>Debugging</h2>

      <h3>VS Code Setup</h3>

      <p>The project includes VS Code configurations for debugging Next.js apps and recommended extensions.</p>

      <h3>Console Debugging</h3>

      <pre><code>{`// Development-only debugging
if (process.env.NODE_ENV === 'development') {
  console.log('User data:', userData);
}`}</code></pre>

      <h2>Troubleshooting</h2>

      <h3>Common Issues</h3>

      <p><strong>Hot Reload Not Working</strong></p>
      <pre><code>{`# Clear Next.js cache
rm -rf apps/*/next
npm run dev`}</code></pre>

      <p><strong>TypeScript Errors</strong></p>
      <pre><code>{`# Rebuild TypeScript references
npm run type-check
npm run build`}</code></pre>

      <p><strong>Package Resolution Issues</strong></p>
      <pre><code>{`# Clear all caches
npm run clean
rm -rf node_modules
npm install`}</code></pre>

      <h3>Debug Mode</h3>

      <p>Enable debug mode for more verbose logging:</p>

      <pre><code>DEBUG=* npm run dev</code></pre>

      <p>Happy coding! 🚀</p>
    </div>
  );
}