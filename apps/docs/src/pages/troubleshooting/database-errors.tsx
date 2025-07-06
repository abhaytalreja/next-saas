export default function DatabaseErrorsTroubleshooting() {
  return (
    <div className="prose max-w-none">
      <h1>🗄️ Database Connection Issues</h1>
      
      <p className="text-lg">
        Having trouble connecting to Supabase or encountering database-related errors? This guide will help you resolve common database issues.
      </p>

      <h2>Common Issues</h2>

      <h3>1. Permission Denied Errors</h3>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
        <p className="font-semibold">Error: permission denied for schema auth</p>
        <p>This happens when trying to create functions in the auth schema without proper permissions.</p>
      </div>

      <h3>Solution</h3>
      <p>Run the database generation script with the appropriate organization mode:</p>
      <pre><code>{`npm run db:generate-sql -- --mode single`}</code></pre>

      <h3>2. Table Already Exists</h3>
      
      <p>When running migrations multiple times, you might see errors about tables or indexes already existing.</p>
      
      <h3>Solution</h3>
      <p>The latest version of our database scripts use <code>CREATE TABLE IF NOT EXISTS</code> and handle existing objects gracefully. Make sure you're using the latest version.</p>

      <h3>3. Features Column Type Mismatch</h3>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
        <p className="font-semibold">Error: column "features" is of type jsonb but expression is of type text[]</p>
      </div>

      <h3>Solution</h3>
      <p>This has been fixed in the latest version. The <code>features</code> column now uses <code>jsonb</code> type consistently.</p>

      <h2>More troubleshooting steps coming soon...</h2>
    </div>
  );
}