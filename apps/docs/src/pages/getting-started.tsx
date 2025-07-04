export default function GettingStartedPage() {
  return (
    <div className="prose max-w-none">
      <h1>Getting Started with NextSaaS</h1>

      <p>Welcome to NextSaaS! This guide will help you get up and running with your new SaaS project in under 5 minutes.</p>

      <h2>Prerequisites</h2>

      <p>Before you begin, ensure you have:</p>

      <ul>
        <li><strong>Node.js</strong> 18+ installed</li>
        <li><strong>npm</strong> 10.9.2+</li>
        <li><strong>Git</strong> for version control</li>
        <li>A code editor (VS Code recommended)</li>
      </ul>

      <h2>Installation Steps</h2>

      <h3>1. Clone and Install</h3>

      <pre><code>{`# Clone the repository
git clone <your-repo-url>
cd next-saas

# Install dependencies
npm install`}</code></pre>

      <h3>2. Environment Setup</h3>

      <p>Create your environment file:</p>

      <pre><code>cp .env.example .env.local</code></pre>

      <p>Then edit <code>.env.local</code> with your actual values:</p>

      <pre><code>{`# Database (if using Supabase)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secret-key"

# Add other services as needed
STRIPE_SECRET_KEY=""
RESEND_API_KEY=""`}</code></pre>

      <h3>3. Start Development</h3>

      <pre><code>npm run dev</code></pre>

      <p>This starts all applications:</p>
      <ul>
        <li><strong>Web App</strong>: <a href="http://localhost:3000">http://localhost:3000</a></li>
        <li><strong>Documentation</strong>: <a href="http://localhost:3001">http://localhost:3001</a> (you are here!)</li>
        <li><strong>Landing Page</strong>: <a href="http://localhost:3002">http://localhost:3002</a></li>
      </ul>

      <h2>Project Structure</h2>

      <pre><code>{`next-saas/
├── apps/
│   ├── web/        # Main SaaS application
│   ├── docs/       # Documentation (you are here!)
│   └── landing/    # Marketing site
├── packages/
│   ├── ui/         # Shared React components
│   ├── auth/       # Authentication utilities
│   ├── database/   # Database client & schemas
│   ├── config/     # Shared configurations
│   ├── types/      # TypeScript definitions
│   └── utils/      # Utility functions`}</code></pre>

      <h2>Verify Setup</h2>

      <p>After running <code>npm run dev</code>, you should see:</p>

      <ul>
        <li>✅ All three applications starting up</li>
        <li>✅ No TypeScript errors</li>
        <li>✅ Hot reloading working in all apps</li>
      </ul>

      <h2>Next Steps</h2>

      <ol>
        <li><strong>Explore the Apps</strong>: Visit each application URL</li>
        <li><strong>Set up Database</strong>: Configure your preferred database</li>
        <li><strong>Customize UI</strong>: Modify components in <code>packages/ui</code></li>
        <li><strong>Add Features</strong>: Start building your SaaS functionality</li>
      </ol>

      <h2>Common Commands</h2>

      <pre><code>{`# Development
npm run dev              # Start all apps
npm run build           # Build all apps
npm run lint            # Lint code
npm run format          # Format code

# Working with specific apps
npm run dev -- --filter=@nextsaas/web
npm run build -- --filter=@nextsaas/web

# Adding dependencies
npm install <package> --workspace=@nextsaas/web`}</code></pre>

      <h2>Troubleshooting</h2>

      <h3>Port Already in Use</h3>

      <p>If you get port conflicts:</p>

      <pre><code>{`# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9`}</code></pre>

      <h3>Tailwind CSS Issues</h3>

      <p>If you see <code>tailwindcss-animate</code> errors:</p>

      <pre><code>{`npm install tailwindcss-animate
npm run dev`}</code></pre>

      <h3>Module Resolution Issues</h3>

      <pre><code>{`# Clear caches and reinstall
npm run clean
rm -rf node_modules
npm install`}</code></pre>

      <h2>Getting Help</h2>

      <ul>
        <li>Check the <a href="/development">Development Guide</a> for detailed workflows</li>
        <li>Understand the project structure</li>
        <li>Visit deployment guide when ready to ship</li>
      </ul>

      <p>Ready to build your SaaS? Let's go! 🚀</p>
    </div>
  );
}