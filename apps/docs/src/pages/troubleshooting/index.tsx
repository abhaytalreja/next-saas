export default function TroubleshootingIndex() {
  return (
    <div className="prose max-w-none">
      <h1>🔧 Troubleshooting Guide</h1>
      
      <p className="text-lg">
        Running into issues? This guide covers common problems and their solutions. 
        If you can't find your issue here, please <a href="https://github.com/abhaytalreja/next-saas/issues" target="_blank" rel="noopener noreferrer">open an issue</a> on GitHub.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
        <p className="font-semibold">💡 Quick Tip</p>
        <p>Most issues can be resolved by:</p>
        <ul className="mt-2">
          <li>Ensuring all environment variables are set correctly</li>
          <li>Running <code>npm install</code> from the root directory</li>
          <li>Restarting the development server</li>
          <li>Clearing Next.js cache with <code>rm -rf apps/*/next</code></li>
        </ul>
      </div>

      <h2>Common Issues</h2>

      <div className="grid gap-4 not-prose">
        <a href="/troubleshooting/environment-variables" className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2">🔐 Environment Variables Not Loading</h3>
          <p className="text-gray-600">Supabase configuration errors, missing environment variables in Turborepo</p>
          <p className="text-sm text-blue-600 mt-2">View solution →</p>
        </a>

        <a href="/troubleshooting/database-errors" className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2">🗄️ Database Connection Issues</h3>
          <p className="text-gray-600">Cannot connect to Supabase, RLS policy errors, migration failures</p>
          <p className="text-sm text-blue-600 mt-2">View solution →</p>
        </a>

        <a href="/troubleshooting/build-errors" className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2">🏗️ Build & Compilation Errors</h3>
          <p className="text-gray-600">TypeScript errors, module resolution issues, build failures</p>
          <p className="text-sm text-blue-600 mt-2">View solution →</p>
        </a>

        <a href="/troubleshooting/port-conflicts" className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2">🔌 Port Already in Use</h3>
          <p className="text-gray-600">Development server port conflicts, automatic port detection issues</p>
          <p className="text-sm text-blue-600 mt-2">View solution →</p>
        </a>

        <a href="/troubleshooting/authentication" className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2">🔑 Authentication Problems</h3>
          <p className="text-gray-600">Login issues, session problems, OAuth configuration</p>
          <p className="text-sm text-blue-600 mt-2">View solution →</p>
        </a>

        <a href="/troubleshooting/deployment" className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2">🚀 Deployment Issues</h3>
          <p className="text-gray-600">Vercel deployment errors, environment variable configuration in production</p>
          <p className="text-sm text-blue-600 mt-2">View solution →</p>
        </a>
      </div>

      <h2>Getting Help</h2>

      <div className="bg-gray-50 rounded-lg p-6 mt-6">
        <h3 className="font-semibold mb-3">Still stuck? Here's how to get help:</h3>
        
        <ol className="space-y-3">
          <li>
            <strong>Search existing issues:</strong> Check if someone else has encountered the same problem on our <a href="https://github.com/abhaytalreja/next-saas/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a>
          </li>
          <li>
            <strong>Discord community:</strong> Join our <a href="https://discord.gg/yourdiscord" target="_blank" rel="noopener noreferrer">Discord server</a> for real-time help
          </li>
          <li>
            <strong>Create a new issue:</strong> If you've found a bug, please <a href="https://github.com/abhaytalreja/next-saas/issues/new/choose" target="_blank" rel="noopener noreferrer">create a detailed issue</a> with:
            <ul className="mt-2 ml-4">
              <li>Steps to reproduce</li>
              <li>Expected behavior</li>
              <li>Actual behavior</li>
              <li>Error messages/logs</li>
              <li>Your environment (OS, Node version, etc.)</li>
            </ul>
          </li>
        </ol>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="font-semibold text-yellow-800">🤝 Contributing</p>
        <p className="text-yellow-700">
          Found a solution to a problem not listed here? We'd love your contribution! 
          Please submit a PR to add it to this troubleshooting guide.
        </p>
      </div>
    </div>
  );
}