export default function UseCasesPage() {
  return (
    <div className="prose max-w-none">
      <h1>Use Case Customization</h1>
      
      <p className="lead">
        NextSaaS includes a powerful use case customization system that allows you to quickly 
        configure your application for specific industries and business models.
      </p>

      <h2>Overview</h2>
      <p>
        The use case system provides pre-configured templates for different industries, 
        complete with customized branding, content, dashboard layouts, and feature sets.
      </p>

      <h2>Available Use Cases</h2>

      <h3>🏠 Real Estate</h3>
      <p>
        Optimized for real estate professionals, property management companies, and real estate platforms.
      </p>
      <ul>
        <li><strong>Branding:</strong> Professional blue/green color scheme</li>
        <li><strong>Features:</strong> Property listings, client management, virtual tours</li>
        <li><strong>Dashboard:</strong> Property analytics, lead tracking, market insights</li>
        <li><strong>Content:</strong> Real estate-focused copy and terminology</li>
      </ul>

      <h3>₿ Crypto/DeFi</h3>
      <p>
        Tailored for cryptocurrency platforms, DeFi protocols, and blockchain applications.
      </p>
      <ul>
        <li><strong>Branding:</strong> Modern purple/gold color scheme</li>
        <li><strong>Features:</strong> Wallet integration, trading interfaces, yield farming</li>
        <li><strong>Dashboard:</strong> Portfolio tracking, price alerts, DeFi analytics</li>
        <li><strong>Content:</strong> Crypto-native language and concepts</li>
      </ul>

      <h2>Configuration Structure</h2>
      
      <h3>Type Definitions</h3>
      <p>Located at <code>packages/types/src/use-case-config.ts</code>:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`export interface UseCaseConfig {
  industry: string;
  useCase: string;
  branding: BrandingConfig;
  content: ContentConfig;
  dashboard: DashboardConfig;
  features: FeatureConfig;
}`}</code>
      </pre>

      <h3>Configuration Files</h3>
      <p>Use case configurations are stored in <code>packages/config/use-cases/</code>:</p>
      <ul>
        <li><code>real-estate.json</code> - Real estate configuration</li>
        <li><code>crypto-defi.json</code> - Crypto/DeFi configuration</li>
      </ul>

      <h2>Using Use Cases</h2>

      <h3>Applying a Use Case</h3>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`import { applyUseCase } from '@nextsaas/config/use-cases';
import realEstateConfig from '@nextsaas/config/use-cases/real-estate.json';

// Apply use case configuration
applyUseCase(realEstateConfig);`}</code>
      </pre>

      <h3>Component Customization</h3>
      <p>Components automatically adapt to the active use case:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`import { useUseCase } from '@nextsaas/hooks';

export function DashboardCard() {
  const { config } = useUseCase();
  
  return (
    <div 
      className="card"
      style={{ 
        backgroundColor: config.branding.colors.primary 
      }}
    >
      <h3>{config.content.dashboard.title}</h3>
      <p>{config.content.dashboard.description}</p>
    </div>
  );
}`}</code>
      </pre>

      <h2>Creating Custom Use Cases</h2>

      <h3>1. Define Configuration</h3>
      <p>Create a new JSON file in <code>packages/config/use-cases/</code>:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "industry": "Healthcare",
  "useCase": "Medical Practice Management",
  "branding": {
    "colors": {
      "primary": "#2563eb",
      "secondary": "#16a34a",
      "accent": "#dc2626"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter"
    },
    "logo": {
      "url": "/logos/healthcare.svg",
      "alt": "Healthcare SaaS"
    }
  },
  "content": {
    "hero": {
      "title": "Streamline Your Medical Practice",
      "description": "Manage patients, appointments, and records..."
    }
  },
  "dashboard": {
    "layout": "healthcare",
    "widgets": [
      "patient-appointments",
      "medical-records",
      "billing-overview"
    ]
  },
  "features": {
    "enabled": [
      "patient-management",
      "appointment-scheduling",
      "billing",
      "telemedicine"
    ]
  }
}`}</code>
      </pre>

      <h3>2. Create Custom Components</h3>
      <p>Build industry-specific components:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`// components/healthcare/PatientDashboard.tsx
export function PatientDashboard() {
  return (
    <div className="healthcare-dashboard">
      <AppointmentWidget />
      <MedicalRecordsWidget />
      <BillingWidget />
    </div>
  );
}`}</code>
      </pre>

      <h3>3. Register Use Case</h3>
      <p>Add to the use case registry:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`// packages/config/use-cases/index.ts
export const useCases = {
  'real-estate': () => import('./real-estate.json'),
  'crypto-defi': () => import('./crypto-defi.json'),
  'healthcare': () => import('./healthcare.json'), // New use case
};`}</code>
      </pre>

      <h2>Branding Customization</h2>

      <h3>Color Schemes</h3>
      <p>Each use case can define its own color palette:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`"branding": {
  "colors": {
    "primary": "#f05a1a",      // Main brand color
    "secondary": "#1a73e8",    // Secondary actions
    "accent": "#34a853",       // Highlights and success
    "neutral": "#6b7280",      // Text and borders
    "background": "#ffffff",   // Page background
    "surface": "#f9fafb"       // Card backgrounds
  }
}`}</code>
      </pre>

      <h3>Typography</h3>
      <p>Customize fonts for different use cases:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`"typography": {
  "heading": "Poppins",     // Headings font
  "body": "Inter",          // Body text font
  "mono": "JetBrains Mono", // Code font
  "scale": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem"
  }
}`}</code>
      </pre>

      <h2>Content Customization</h2>

      <h3>Hero Section</h3>
      <p>Customize landing page content:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`"content": {
  "hero": {
    "title": "Transform Your Real Estate Business",
    "subtitle": "Manage properties, clients, and sales with ease",
    "cta": "Start Free Trial",
    "features": [
      "Property Management",
      "Client Portal", 
      "Analytics Dashboard"
    ]
  }
}`}</code>
      </pre>

      <h3>Navigation</h3>
      <p>Industry-specific navigation items:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`"navigation": {
  "primary": [
    { "label": "Properties", "href": "/properties" },
    { "label": "Clients", "href": "/clients" },
    { "label": "Analytics", "href": "/analytics" }
  ],
  "secondary": [
    { "label": "Settings", "href": "/settings" },
    { "label": "Support", "href": "/support" }
  ]
}`}</code>
      </pre>

      <h2>Dashboard Layouts</h2>

      <h3>Widget Configuration</h3>
      <p>Define dashboard widgets and their arrangement:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`"dashboard": {
  "layout": "grid",
  "columns": 3,
  "widgets": [
    {
      "id": "property-stats",
      "title": "Property Statistics",
      "size": "large",
      "position": { "row": 1, "col": 1, "span": 2 }
    },
    {
      "id": "recent-activity",
      "title": "Recent Activity", 
      "size": "medium",
      "position": { "row": 1, "col": 3 }
    }
  ]
}`}</code>
      </pre>

      <h2>Feature Toggles</h2>

      <h3>Enabling/Disabling Features</h3>
      <p>Control which features are available for each use case:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`"features": {
  "enabled": [
    "property-listings",
    "client-management", 
    "virtual-tours",
    "market-analytics"
  ],
  "disabled": [
    "inventory-management",
    "manufacturing-reports"
  ],
  "beta": [
    "ai-property-valuation"
  ]
}`}</code>
      </pre>

      <h2>Testing Use Cases</h2>

      <h3>Switch Between Configurations</h3>
      <p>Test different use cases in development:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`// Set environment variable
USE_CASE=real-estate npm run dev

// Or programmatically
import { setUseCase } from '@nextsaas/config/use-cases';
setUseCase('crypto-defi');`}</code>
      </pre>

      <h3>Visual Testing</h3>
      <p>Create visual regression tests for each use case to ensure consistency.</p>

      <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>Best Practice:</strong> Start with an existing use case template and customize it 
              rather than building from scratch. This ensures you maintain consistency with the design system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}