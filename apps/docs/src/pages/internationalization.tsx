export default function InternationalizationPage() {
  return (
    <div className="prose max-w-none">
      <h1>Internationalization (i18n)</h1>
      
      <p className="lead">
        NextSaaS includes comprehensive internationalization support built with next-i18next and react-i18next.
        This enables your application to support multiple languages and regions out of the box.
      </p>

      <h2>Supported Languages</h2>
      <p>NextSaaS currently supports the following languages:</p>
      <ul>
        <li>🇺🇸 English (en) - Default</li>
        <li>🇪🇸 Spanish (es)</li>
        <li>🇫🇷 French (fr)</li>
        <li>🇩🇪 German (de)</li>
        <li>🇯🇵 Japanese (ja)</li>
        <li>🇨🇳 Chinese (zh)</li>
      </ul>

      <h2>Configuration</h2>
      <p>The i18n configuration is located in <code>next-i18next.config.js</code>:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  react: {
    useSuspense: false,
  },
}`}</code>
      </pre>

      <h2>Translation Files</h2>
      <p>Translation files are stored in <code>public/locales/[locale]/[namespace].json</code>:</p>
      <ul>
        <li><code>public/locales/en/common.json</code> - English translations</li>
        <li><code>public/locales/es/common.json</code> - Spanish translations</li>
        <li><code>public/locales/fr/common.json</code> - French translations</li>
        <li>And so on for other languages...</li>
      </ul>

      <h3>Translation Structure</h3>
      <p>Translations are organized in a nested structure for better organization:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "navigation": {
    "home": "Home",
    "docs": "Docs",
    "pricing": "Pricing"
  },
  "hero": {
    "title": "Build Your SaaS",
    "description": "NextSaaS is a production-ready starter kit..."
  },
  "features": {
    "title": "Everything You Need",
    "productionReady": {
      "title": "Production Ready",
      "description": "Built with best practices..."
    }
  }
}`}</code>
      </pre>

      <h2>Using Translations in Components</h2>
      
      <h3>Functional Components</h3>
      <p>Use the <code>useTranslation</code> hook in functional components:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`import { useTranslation } from 'next-i18next';

export default function MyComponent() {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
    </div>
  );
}`}</code>
      </pre>

      <h3>Server-Side Rendering</h3>
      <p>For SSR pages, include the translations in <code>getServerSideProps</code> or <code>getStaticProps</code>:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}`}</code>
      </pre>

      <h2>Language Selector Component</h2>
      <p>NextSaaS includes a <code>LanguageSelector</code> component for switching languages:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`import { LanguageSelector } from '@nextsaas/ui';

export default function Navigation() {
  return (
    <nav>
      {/* Other navigation items */}
      <LanguageSelector />
    </nav>
  );
}`}</code>
      </pre>

      <h2>Adding New Languages</h2>
      
      <h3>1. Update Configuration</h3>
      <p>Add the new locale to both configuration files:</p>
      <ul>
        <li>Add to <code>locales</code> array in <code>next-i18next.config.js</code></li>
        <li>Add to <code>supportedLocales</code> in <code>packages/config/i18n/index.ts</code></li>
      </ul>

      <h3>2. Create Translation Files</h3>
      <p>Create a new directory and translation file for your locale:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`mkdir public/locales/[new-locale]
cp public/locales/en/common.json public/locales/[new-locale]/common.json`}</code>
      </pre>

      <h3>3. Translate Content</h3>
      <p>Update the copied JSON file with translations for your target language.</p>

      <h2>Best Practices</h2>
      
      <h3>Namespace Organization</h3>
      <ul>
        <li><code>common</code> - Shared translations (navigation, buttons, etc.)</li>
        <li><code>pages</code> - Page-specific content</li>
        <li><code>forms</code> - Form labels and validation messages</li>
        <li><code>errors</code> - Error messages</li>
      </ul>

      <h3>Key Naming</h3>
      <ul>
        <li>Use descriptive, hierarchical keys: <code>hero.title</code> not <code>title1</code></li>
        <li>Group related translations: <code>navigation.home</code>, <code>navigation.about</code></li>
        <li>Use camelCase for consistency: <code>getStarted</code> not <code>get_started</code></li>
      </ul>

      <h3>Interpolation</h3>
      <p>Use interpolation for dynamic content:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`// Translation file
{
  "welcome": "Welcome, {{name}}!"
}

// Component
const { t } = useTranslation('common');
return <h1>{t('welcome', { name: user.name })}</h1>;`}</code>
      </pre>

      <h2>Locale Detection</h2>
      <p>NextSaaS automatically detects the user's preferred language using:</p>
      <ul>
        <li>URL path (e.g., <code>/es/about</code>)</li>
        <li>Accept-Language header</li>
        <li>Cookie preference</li>
        <li>Fallback to default locale (English)</li>
      </ul>

      <h2>Development Tips</h2>
      
      <h3>Missing Translations</h3>
      <p>In development mode, missing translations will show the key path, making it easy to identify what needs translation.</p>

      <h3>Hot Reloading</h3>
      <p>Translation files are hot-reloaded in development. Changes to JSON files will be reflected immediately.</p>

      <h3>TypeScript Support</h3>
      <p>Consider generating TypeScript types for your translations to get autocomplete and type safety:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`// types/i18n.ts
export interface TranslationKeys {
  'hero.title': string;
  'hero.description': string;
  'navigation.home': string;
  // ... other keys
}`}</code>
      </pre>

      <h2>Production Considerations</h2>
      
      <h3>SEO</h3>
      <ul>
        <li>Each locale gets its own URL structure</li>
        <li>Proper hreflang tags are automatically generated</li>
        <li>Search engines can index each language version</li>
      </ul>

      <h3>Performance</h3>
      <ul>
        <li>Only the current locale's translations are loaded</li>
        <li>Translations are cached for optimal performance</li>
        <li>Consider lazy loading less common namespaces</li>
      </ul>

      <h2>Testing</h2>
      <p>Test your internationalized components by switching languages:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`// Test with different locales
test('renders in Spanish', () => {
  render(<MyComponent />, { locale: 'es' });
  expect(screen.getByText('Página de Inicio')).toBeInTheDocument();
});`}</code>
      </pre>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Use the language selector in the navigation to test different languages in your local development environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}