export default function GuardRailsPage() {
  return (
    <div className="prose max-w-none">
      <h1>Guard Rails & Quality Assurance</h1>
      
      <p className="lead">
        NextSaaS includes comprehensive guard rails and quality assurance systems to maintain 
        code consistency, enforce best practices, and prevent issues from reaching production.
      </p>

      <h2>Overview</h2>
      <p>
        The guard rails system is designed to automatically validate your code at multiple stages 
        of development, ensuring high quality and consistent standards across your entire codebase.
      </p>

      <h2>Components</h2>

      <h3>Enhanced ESLint Configuration</h3>
      <p>Strict linting rules for TypeScript, React, and accessibility:</p>
      <ul>
        <li>Zero tolerance for <code>any</code> types</li>
        <li>Enforced React hooks rules</li>
        <li>Accessibility (a11y) validation</li>
        <li>Import organization and consistency</li>
        <li>Performance optimizations</li>
      </ul>

      <h3>Pre-commit Hooks</h3>
      <p>Automated quality checks before every commit:</p>
      <ul>
        <li>Code formatting with Prettier</li>
        <li>Lint error checking</li>
        <li>TypeScript compilation</li>
        <li>Test execution</li>
        <li>Design token validation</li>
        <li>Component API validation</li>
      </ul>

      <h3>Post-commit Validation</h3>
      <p>Comprehensive validation after commits:</p>
      <ul>
        <li>Full test suite execution</li>
        <li>Bundle size analysis</li>
        <li>Security scanning</li>
        <li>Performance metrics</li>
        <li>Automatic roadmap updates</li>
      </ul>

      <h2>Configuration Files</h2>
      
      <h3>ESLint Configuration</h3>
      <p>Located at <code>packages/config/eslint/base.js</code></p>
      
      <h3>Husky Hooks</h3>
      <ul>
        <li><code>.husky/pre-commit</code> - Pre-commit validation</li>
        <li><code>.husky/post-commit</code> - Post-commit validation</li>
      </ul>

      <h3>Validation Scripts</h3>
      <ul>
        <li><code>scripts/validate-design-tokens.js</code> - Design system validation</li>
        <li><code>scripts/validate-component-apis.js</code> - Component consistency</li>
        <li><code>scripts/post-commit-validation.js</code> - Comprehensive validation</li>
      </ul>

      <h2>Quality Metrics</h2>
      
      <h3>Code Quality Standards</h3>
      <ul>
        <li><strong>ESLint:</strong> Zero errors, warnings treated as errors</li>
        <li><strong>TypeScript:</strong> Strict mode, no any types</li>
        <li><strong>Test Coverage:</strong> Minimum 80% coverage</li>
        <li><strong>Bundle Size:</strong> &lt; 250KB initial load</li>
        <li><strong>Accessibility:</strong> WCAG 2.1 AA compliance</li>
      </ul>

      <h3>Performance Targets</h3>
      <ul>
        <li><strong>Lighthouse Score:</strong> 90+ for all categories</li>
        <li><strong>Core Web Vitals:</strong> All metrics in green</li>
        <li><strong>Bundle Analysis:</strong> Regular monitoring</li>
        <li><strong>Load Time:</strong> &lt; 2s for initial page load</li>
      </ul>

      <h2>Development Workflow</h2>
      
      <h3>Before Committing</h3>
      <ol>
        <li>Write your code following established patterns</li>
        <li>Run tests locally: <code>npm test</code></li>
        <li>Check types: <code>npm run type-check</code></li>
        <li>Lint your code: <code>npm run lint</code></li>
        <li>Commit - pre-commit hooks will validate automatically</li>
      </ol>

      <h3>After Committing</h3>
      <ol>
        <li>Post-commit hooks run comprehensive validation</li>
        <li>Results are logged and added to roadmap</li>
        <li>Any failures are reported immediately</li>
        <li>Fix issues and amend commit if necessary</li>
      </ol>

      <h2>Bypassing Guard Rails</h2>
      <p>
        In rare cases where you need to bypass validation (not recommended for production):
      </p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`# Skip pre-commit hooks (use with caution)
git commit --no-verify -m "Emergency fix"

# Skip specific ESLint rules (temporary only)
// eslint-disable-next-line @typescript-eslint/no-explicit-any`}</code>
      </pre>

      <h2>Component Validation</h2>
      <p>
        All UI components are automatically validated for:
      </p>
      <ul>
        <li>Required props (className, data-testid)</li>
        <li>Accessibility requirements</li>
        <li>TypeScript prop interfaces</li>
        <li>JSDoc documentation</li>
        <li>Usage examples</li>
      </ul>

      <h2>Design Token Validation</h2>
      <p>
        Design tokens are validated for:
      </p>
      <ul>
        <li>Consistent color palette</li>
        <li>Proper spacing scale</li>
        <li>Typography hierarchy</li>
        <li>Component design consistency</li>
      </ul>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> Guard rails are designed to help maintain quality. 
              If you find them too restrictive, consider updating the configuration rather than bypassing them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}