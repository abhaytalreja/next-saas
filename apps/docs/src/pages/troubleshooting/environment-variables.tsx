export default function EnvironmentVariablesTroubleshooting() {
  return (
    <div className="prose max-w-none">
      <h1>🔐 Environment Variables Not Loading</h1>
      
      <p className="text-lg">
        Having issues with environment variables not being recognized? This guide covers common causes and solutions.
      </p>

      <h2>Common Symptoms</h2>
      
      <ul>
        <li><code>Error: Invalid Supabase configuration</code></li>
        <li>Environment variables showing as <code>undefined</code></li>
        <li>Different behavior between apps in the monorepo</li>
        <li>Variables work in one app but not another</li>
      </ul>

      <h2>Issue #1: Turborepo Not Passing Environment Variables</h2>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
        <p className="font-semibold text-red-800">Most Common Issue</p>
        <p className="text-red-700">
          By default, Turborepo only passes certain environment variables to child processes. 
          You need to explicitly declare which variables should be available.
        </p>
      </div>

      <h3>Solution</h3>

      <p>Add your environment variables to the <code>globalEnv</code> array in <code>turbo.json</code>:</p>

      <pre className="language-json"><code>{`{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    // ... task configuration
  },
  "globalEnv": [
    "NODE_ENV",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_ORGANIZATION_MODE",
    "DATABASE_URL",
    // Add any other environment variables your apps need
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL"
  ]
}`}</code></pre>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
        <p className="font-semibold">💡 Pro Tip</p>
        <p>
          Any environment variable that starts with <code>NEXT_PUBLIC_</code> should be added to this list if you want it available in all apps.
        </p>
      </div>

      <h2>Issue #2: Wrong .env File Location</h2>

      <h3>Correct Structure</h3>

      <p>In a Turborepo monorepo, environment variables should be in the <strong>root directory</strong>:</p>

      <pre><code>{`next-saas/
├── .env.local          # ✅ Correct location
├── .env.example        # ✅ Template file
├── apps/
│   ├── web/
│   │   └── .env.local  # ❌ Don't put .env files here
│   └── landing/
│       └── .env.local  # ❌ Don't put .env files here
└── packages/`}</code></pre>

      <h2>Issue #3: Environment Variables Not Loaded After Changes</h2>

      <h3>Solution</h3>

      <p>After modifying environment variables or <code>turbo.json</code>:</p>

      <ol>
        <li>Stop the development server (<code>Ctrl+C</code>)</li>
        <li>Clear Turborepo cache: <code>npx turbo clean</code></li>
        <li>Restart from the root directory: <code>npm run dev</code></li>
      </ol>

      <h2>Issue #4: Vercel Deployment Missing Environment Variables</h2>

      <h3>Solution</h3>

      <p>When deploying to Vercel, you need to add environment variables for each app:</p>

      <ol>
        <li>Go to your Vercel dashboard</li>
        <li>Select your project</li>
        <li>Go to Settings → Environment Variables</li>
        <li>Add all variables from your <code>.env.local</code></li>
        <li>Make sure to add them for all environments (Production, Preview, Development)</li>
      </ol>

      <h2>Debugging Steps</h2>

      <h3>1. Verify Environment Variables Are Set</h3>

      <p>Add this temporary debug code to check if variables are loaded:</p>

      <pre className="language-typescript"><code>{`// In any page or API route
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));`}</code></pre>

      <h3>2. Check turbo.json Configuration</h3>

      <pre className="language-bash"><code>{`# From root directory
cat turbo.json | grep -A 10 globalEnv`}</code></pre>

      <h3>3. Verify .env.local File</h3>

      <pre className="language-bash"><code>{`# Check if file exists and has correct permissions
ls -la .env.local

# Verify Supabase variables are set (without showing sensitive values)
grep SUPABASE .env.local | cut -d'=' -f1`}</code></pre>

      <h2>Complete Checklist</h2>

      <div className="bg-gray-50 rounded-lg p-6 my-6">
        <p className="font-semibold mb-3">Run through this checklist to resolve environment variable issues:</p>
        
        <ul className="space-y-2">
          <li className="flex items-start">
            <input type="checkbox" className="mt-1 mr-2" />
            <span><code>.env.local</code> file exists in the root directory</span>
          </li>
          <li className="flex items-start">
            <input type="checkbox" className="mt-1 mr-2" />
            <span>All required variables are in <code>.env.local</code> (check <code>.env.example</code>)</span>
          </li>
          <li className="flex items-start">
            <input type="checkbox" className="mt-1 mr-2" />
            <span>Variables are added to <code>globalEnv</code> in <code>turbo.json</code></span>
          </li>
          <li className="flex items-start">
            <input type="checkbox" className="mt-1 mr-2" />
            <span>Development server was restarted after changes</span>
          </li>
          <li className="flex items-start">
            <input type="checkbox" className="mt-1 mr-2" />
            <span>Running <code>npm run dev</code> from the root directory</span>
          </li>
          <li className="flex items-start">
            <input type="checkbox" className="mt-1 mr-2" />
            <span>No typos in variable names (case-sensitive!)</span>
          </li>
        </ul>
      </div>

      <h2>Prevention</h2>

      <p>To prevent this issue for new developers:</p>

      <ol>
        <li>Keep <code>.env.example</code> up to date with all required variables</li>
        <li>Add new environment variables to <code>turbo.json</code> immediately</li>
        <li>Document any special environment variable requirements in the README</li>
        <li>Consider adding a setup script that validates environment variables</li>
      </ol>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="font-semibold text-green-800">✅ Still Having Issues?</p>
        <p className="text-green-700">
          If you've followed all these steps and still have problems, please <a href="https://github.com/abhaytalreja/next-saas/issues/new/choose" target="_blank" rel="noopener noreferrer" className="underline font-medium">create a bug report</a>.
        </p>
        <p className="text-green-700 text-sm mt-2">
          Our issue template will guide you through providing all the necessary information for us to help you quickly.
        </p>
      </div>
    </div>
  );
}