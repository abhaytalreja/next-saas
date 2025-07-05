export default function SetupMethodsPage() {
  return (
    <div className="prose max-w-none">
      <h1>🚀 Setup Methods</h1>
      
      <p>
        There are two ways to use NextSaaS depending on your needs. Choose the method 
        that best fits your workflow.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-8">
        <div className="border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🔄 Method 1: Fork + Private Repo</h3>
          <p className="text-gray-600 mb-4">
            Best if you want to receive upstream updates and contribute back
          </p>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Keep your code private</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Pull future updates from NextSaaS</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Contribute improvements back</span>
            </li>
          </ul>
        </div>

        <div className="border-2 border-purple-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">📋 Method 2: Use as Template</h3>
          <p className="text-gray-600 mb-4">
            Best for complete ownership and customization
          </p>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Start fresh with no git history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Complete independence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">⚠</span>
              <span>Manual updates only</span>
            </li>
          </ul>
        </div>
      </div>

      <h2>🔄 Method 1: Fork + Add Upstream Remote</h2>
      
      <p>
        This method allows you to maintain a private repository while still being able 
        to pull updates from the original NextSaaS repository.
      </p>

      <h3>Step 1: Clone the Repository</h3>
      
      <pre><code>{`git clone https://github.com/nextsaas/nextsaas.git my-saas
cd my-saas`}</code></pre>

      <h3>Step 2: Create Your Private Repository</h3>
      
      <ol>
        <li>Create a new <strong>private</strong> repository on GitHub (don't initialize it)</li>
        <li>Update your remotes:</li>
      </ol>

      <pre><code>{`# Rename the original remote to 'upstream'
git remote rename origin upstream

# Add your private repo as 'origin'
git remote add origin https://github.com/yourusername/your-private-repo.git

# Push to your private repo
git push -u origin main`}</code></pre>

      <h3>Step 3: Verify Your Setup</h3>
      
      <pre><code>{`git remote -v
# You should see:
# origin    https://github.com/yourusername/your-private-repo.git (fetch)
# origin    https://github.com/yourusername/your-private-repo.git (push)
# upstream  https://github.com/nextsaas/nextsaas.git (fetch)
# upstream  https://github.com/nextsaas/nextsaas.git (push)`}</code></pre>

      <h3>Step 4: Pull Future Updates</h3>
      
      <p>When NextSaaS releases updates, you can pull them into your project:</p>
      
      <pre><code>{`# Fetch the latest changes
git fetch upstream

# Merge updates into your main branch
git checkout main
git merge upstream/main

# Resolve any conflicts if needed
# Then push to your private repo
git push origin main`}</code></pre>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip: Use a Separate Branch</h4>
        <p className="text-blue-800">
          Keep your customizations on a separate branch (e.g., <code>custom</code>) and 
          periodically merge <code>main</code> into it. This makes managing conflicts easier.
        </p>
      </div>

      <h2>📋 Method 2: Use as Template</h2>
      
      <p>
        This method gives you a completely independent copy with no connection to the 
        original repository.
      </p>

      <h3>Option A: Using GitHub's Template Feature</h3>
      
      <ol className="space-y-3">
        <li>
          Go to the NextSaaS repository on GitHub
        </li>
        <li>
          Click the <strong>"Use this template"</strong> button
        </li>
        <li>
          Choose a name for your repository
        </li>
        <li>
          Select <strong>"Private"</strong> for visibility
        </li>
        <li>
          Click <strong>"Create repository from template"</strong>
        </li>
      </ol>

      <h3>Option B: Manual Clone</h3>
      
      <pre><code>{`# Clone without git history
git clone --depth 1 https://github.com/nextsaas/nextsaas.git my-saas
cd my-saas

# Remove the original git repository
rm -rf .git

# Initialize your own repository
git init
git add .
git commit -m "Initial commit from NextSaaS template"

# Create your GitHub repo and push
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main`}</code></pre>

      <h2>🤔 Which Method Should I Choose?</h2>

      <div className="bg-gray-50 rounded-lg p-6 my-6">
        <h3 className="font-semibold mb-4">Decision Matrix</h3>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Consideration</th>
              <th className="text-center py-2">Fork + Remote</th>
              <th className="text-center py-2">Template</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">Want automatic updates?</td>
              <td className="text-center">✅</td>
              <td className="text-center">❌</td>
            </tr>
            <tr className="border-b">
              <td className="py-3">Need complete independence?</td>
              <td className="text-center">❌</td>
              <td className="text-center">✅</td>
            </tr>
            <tr className="border-b">
              <td className="py-3">Planning major customizations?</td>
              <td className="text-center">⚠️</td>
              <td className="text-center">✅</td>
            </tr>
            <tr className="border-b">
              <td className="py-3">Want to contribute back?</td>
              <td className="text-center">✅</td>
              <td className="text-center">❌</td>
            </tr>
            <tr className="border-b">
              <td className="py-3">Simpler git history?</td>
              <td className="text-center">❌</td>
              <td className="text-center">✅</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Choose Fork + Remote if:</h3>
      <ul>
        <li>You want to benefit from ongoing NextSaaS improvements</li>
        <li>You're building a relatively standard SaaS application</li>
        <li>You might want to contribute improvements back</li>
        <li>You're comfortable with git merge conflicts</li>
      </ul>

      <h3>Choose Template if:</h3>
      <ul>
        <li>You're planning significant architectural changes</li>
        <li>You want complete control over your codebase</li>
        <li>You prefer to manually review and apply updates</li>
        <li>You want a cleaner git history</li>
      </ul>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
        <h3 className="text-yellow-900 font-semibold mb-2">⚡ Quick Recommendation</h3>
        <p className="text-yellow-800">
          <strong>For most users:</strong> Start with Method 1 (Fork + Remote). You can always 
          disconnect from upstream later if needed, but you can't easily reconnect if you start 
          with Method 2.
        </p>
      </div>

      <h2>🚀 Next Steps</h2>

      <p>
        Once you've set up your repository using either method, continue with the 
        <a href="/quickstart" className="text-blue-600 font-semibold"> 5-minute quick start guide</a> to 
        get your development environment running.
      </p>
    </div>
  );
}