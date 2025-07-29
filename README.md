# NextSaaS - Modern SaaS Starter Kit

<div align="center">
  <h1>🚀 NextSaaS</h1>
  <p>
    <strong>Production-ready SaaS starter kit built with Next.js 15, TypeScript, and Turborepo</strong>
  </p>
  <p>
    Build your SaaS faster with a modern monorepo architecture, shared components, and best practices baked in.
  </p>
</div>

---

## 🎯 What is NextSaaS?

NextSaaS is a comprehensive starter kit designed to accelerate SaaS development. It provides a production-ready monorepo setup with three pre-configured applications (web app, documentation site, and landing page) along with shared packages for UI components, authentication, database integration, and utilities.

### Why NextSaaS?

- **Save weeks of setup time** - Everything is pre-configured and ready to go
- **Modern tech stack** - Latest versions of Next.js, React, and TypeScript
- **Scalable architecture** - Monorepo structure that grows with your project
- **Best practices built-in** - ESLint, Prettier, TypeScript strict mode, and more
- **Developer experience focused** - Fast builds, hot reloading, and great tooling

## ✨ Features

- 🏗️ **Turborepo** - High-performance build system with smart caching
- ⚡ **Next.js 15** - Latest features including App Router and Server Components
- 🎯 **TypeScript** - Strict type checking across all packages
- 🎨 **Tailwind CSS** - Utility-first CSS with custom design system
- 🧱 **Shared Packages** - Reusable code across all applications
- 🔐 **Authentication Ready** - Pre-configured auth package structure
- ⚙️ **Configuration System** - Type-safe, environment-aware configuration management
- 🔒 **Secret Management** - Built-in utilities for secure secret handling
- 🌍 **i18n Support** - Internationalization ready with 15+ languages
- 📚 **Documentation Site** - Beautiful docs with complete setup guides
- 🚀 **Landing Page** - Marketing site with shared components
- 🛠️ **Developer Tools** - ESLint, Prettier, Husky pre-commit hooks
- 📦 **Package Management** - NPM workspaces for dependency management
- 🔌 **Automatic Port Management** - Smart port detection and fallback for development servers
- 🗄️ **Database Ready** - Multi-tenant architecture with Supabase integration
- 🔒 **Row Level Security** - Built-in data isolation and security policies
- 📊 **Migration System** - Version-controlled database schema evolution
- 🧪 **Comprehensive Testing** - Unit, integration, e2e, visual, and accessibility testing built-in
- 🎯 **Quality Gates** - Mandatory testing requirements for all new features
- 🤖 **Test Automation** - CI/CD pipeline with automated test execution and reporting
- 👤 **Comprehensive Profile Management** - Universal profile system that adapts to single-user, organization-based, and multi-tenant SaaS applications
- 🖼️ **Avatar Management** - Integrated Backblaze B2 cloud storage with automatic image processing and variants
- 📧 **Enterprise Email System** - Dual-provider architecture (Resend + SendGrid) with React Email templates, campaign management, and GDPR compliance
- 📊 **Activity Tracking** - Comprehensive audit trails with organization context and GDPR compliance
- 🏢 **Multi-Tenant Organizations** - Organization-specific profiles with role-based permissions and context switching
- 📥 **Data Export & Deletion** - GDPR-compliant data export and secure account deletion with grace periods
- 📱 **Mobile-First Design** - Touch-optimized interfaces with responsive design
- ♿ **Accessibility Excellence** - WCAG 2.1 AA compliance with screen reader support
- 🔒 **GDPR Compliance** - Data export, deletion workflows, and privacy controls
- 👨‍💼 **Admin Dashboard** - Comprehensive admin interface with user management, analytics, system monitoring, and security controls

## 📁 Project Structure

```
next-saas/
├── apps/                    # Application workspaces
│   ├── web/                # Main SaaS application (Next.js 15)
│   ├── docs/               # Documentation site (Next.js + MDX)
│   └── landing/            # Marketing landing page
├── packages/               # Shared packages
│   ├── ui/                 # Shared React components
│   ├── auth/               # Authentication utilities
│   ├── admin/              # Admin dashboard and management system
│   ├── database/           # Database client and schemas
│   ├── config/             # Configuration system with validation
│   ├── tsconfig/           # Base TypeScript configurations
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utility functions
├── .github/                # GitHub Actions workflows
├── .husky/                 # Git hooks
├── .vscode/                # VS Code workspace settings
├── scripts/                # Build and development scripts
└── turbo.json             # Turborepo configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 10.9.2+
- Git
- Supabase account (free tier works great)

### Quick Links

- 📖 **[Full Documentation](http://localhost:3001)** - Comprehensive guides and tutorials
- ⚡ **[5-Minute Quick Start](http://localhost:3001/quickstart)** - Get up and running fast
- 🔄 **[Setup Methods](http://localhost:3001/setup-methods)** - Choose how to use this template

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/abhaytalreja/next-saas.git
   cd next-saas
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up the database**

   First, choose your organization mode:

   ```bash
   # Generate database schema (choose one mode)
   npm run db:generate-sql -- --mode single  # Recommended default
   # OR: npm run db:generate-sql -- --mode none   # For personal tools
   # OR: npm run db:generate-sql -- --mode multi  # For enterprise B2B
   ```

   Then apply the generated SQL to your Supabase project and set:

   ```bash
   NEXT_PUBLIC_ORGANIZATION_MODE=single  # Match your chosen mode
   ```

5. **Start development servers**

   ```bash
   npm run dev
   ```

   Your applications will be available at:
   - 🌐 **Web App**: http://localhost:3000 (auto-detects next available port if occupied)
   - 📚 **Documentation**: http://localhost:3001 (auto-detects next available port if occupied)
   - 🚀 **Landing Page**: http://localhost:3002 (auto-detects next available port if occupied)

## 📝 Development Guide

### Available Scripts

```bash
# Development
npm run dev              # Start all apps in development mode
npm run dev -- --filter=@nextsaas/web    # Start specific app

# Building
npm run build            # Build all apps and packages
npm run build -- --filter=@nextsaas/web  # Build specific app

# Code Quality
npm run lint             # Lint all workspaces
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Run TypeScript type checking

# Testing (All features MUST meet testing requirements)
npm run test            # Run all tests (✅ 57 tests passing)
npm run test:watch      # Run tests in watch mode
npm run test:unit       # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:e2e        # Run end-to-end tests
npm run test:coverage   # Generate coverage report
npm run test:a11y       # Run accessibility tests
npm run test:visual     # Run visual regression tests

# Database
npm run db:setup        # Complete database setup (migrations + seeds)
npm run db:migrate up   # Run database migrations
npm run db:seed run     # Seed the database

# Maintenance
npm run clean           # Clean all build artifacts
```

### Adding Dependencies

```bash
# Add to root (shared across all workspaces)
npm install <package>

# Add to specific app
npm install <package> --workspace=@nextsaas/web

# Add to specific package
npm install <package> --workspace=@nextsaas/ui

# Add as dev dependency
npm install -D <package> --workspace=@nextsaas/web
```

### Creating New Components

1. **Create component in UI package**

   ```bash
   # Create new component
   mkdir packages/ui/src/components/MyComponent
   touch packages/ui/src/components/MyComponent/MyComponent.tsx
   touch packages/ui/src/components/MyComponent/index.ts
   ```

2. **Export from UI package**

   ```typescript
   // packages/ui/src/index.ts
   export * from './components/MyComponent'
   ```

3. **Use in any app**
   ```typescript
   import { MyComponent } from '@nextsaas/ui'
   ```

### Working with Shared Packages

Each package in the `packages/` directory is available to all apps:

- **@nextsaas/ui** - Shared React components
- **@nextsaas/auth** - Authentication logic and hooks
- **@nextsaas/database** - Database client, schemas, and migrations
- **@nextsaas/email** - Enterprise email system with React Email templates, campaign management, and provider integration
- **@nextsaas/config** - Shared ESLint, TypeScript, Tailwind configs
- **@nextsaas/types** - Shared TypeScript type definitions
- **@nextsaas/utils** - Shared utility functions

## 🏗️ Architecture Decisions

### Monorepo with Turborepo

We use Turborepo for:

- **Incremental builds** - Only rebuild what changed
- **Parallel execution** - Run tasks concurrently
- **Remote caching** - Share build cache across team
- **Task orchestration** - Smart dependency management

### Next.js 15 App Router

All applications use the latest Next.js features:

- Server Components by default
- Streaming and Suspense
- Server Actions
- Parallel and intercepted routes
- Built-in SEO optimization

### TypeScript Strict Mode

All packages use strict TypeScript configuration:

- No implicit any
- Strict null checks
- Exact optional property types
- No unused locals/parameters

### Tailwind CSS Design System

Centralized design tokens in `packages/config/tailwind`:

- Custom color palette
- Typography scale
- Spacing system
- Component variants

## 🔧 Configuration

### Port Management

All Next.js applications include automatic port management. If the default port is occupied, the app will automatically find the next available port:

```bash
# Default ports:
# Web: 3000, Docs: 3001, Landing: 3002

# If port 3002 is busy, landing will use 3003, 3004, etc.
npm run dev
```

See [Port Management Documentation](./docs/PORT_MANAGEMENT.md) for more details.

### Configuration System

NextSaaS includes a comprehensive configuration management system:

```typescript
import { initializeGlobalConfig, config } from '@nextsaas/config'

// Initialize configuration
await initializeGlobalConfig()

// Access configuration
const dbConfig = config.database()
const isFeatureEnabled = config.feature('aiIntegration')
```

Features:

- **Type-safe** - Full TypeScript support with auto-generated types
- **Environment-aware** - Separate configs for dev/staging/prod/test
- **Validated** - Runtime validation using Zod schemas
- **Secure** - Built-in secret management and encryption
- **CLI Tools** - Manage configuration via command line

### Environment Variables

Use the configuration CLI to set up your environment:

```bash
# Interactive setup
npx nextsaas-config setup --interactive

# Or create from template
npx nextsaas-config init --env production
```

Example `.env.local`:

```env
# Database
DATABASE_URL=your_database_url

# Authentication
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret

# Third-party services
STRIPE_SECRET_KEY=your_stripe_key
SENDGRID_API_KEY=your_sendgrid_key

# Add more as needed...
```

### VS Code Setup

Recommended extensions are listed in `.vscode/extensions.json`. VS Code will prompt you to install them when opening the project.

### Git Hooks

Pre-commit hooks are set up with Husky and lint-staged to:

- Run ESLint on staged files
- Format code with Prettier
- Run type checking

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure the following:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

3. Set up separate projects for each app:
   - Web app: `apps/web`
   - Docs: `apps/docs`
   - Landing: `apps/landing`

### Environment Variables

Make sure to add all environment variables in your deployment platform.

## 🗄️ Database Architecture

NextSaaS supports three organization modes to fit different use cases:

### Organization Modes

| Mode         | Use Case                           | Example Apps                         |
| ------------ | ---------------------------------- | ------------------------------------ |
| **`none`**   | Personal tools, individual apps    | Todo list, journal, personal finance |
| **`single`** | Small teams, freelancers (default) | Project management, invoicing        |
| **`multi`**  | Enterprise B2B SaaS                | Slack, Notion, GitHub                |

### Key Features

- **Multi-tenant architecture** - Data isolation per user or organization
- **Row Level Security (RLS)** - PostgreSQL-level security policies
- **Flexible schema** - Adapts based on organization mode
- **Type-safe queries** - Full TypeScript support
- **Migration system** - Version-controlled schema changes

### Documentation

- 📊 **[Database Schema Guide](./docs/DATABASE_SCHEMA.md)** - Complete schema documentation for all modes
- 🔄 **[Organization Modes Comparison](./docs/ORGANIZATION_MODES_COMPARISON.md)** - Detailed comparison and migration guide
- 🚀 **[Database Setup Guide](./docs/DATABASE_SETUP.md)** - Step-by-step setup instructions
- 🔌 **[Supabase Integration](./docs/SUPABASE_INTEGRATION.md)** - Supabase-specific configuration
- 👨‍💼 **[Admin System Setup](./docs/admin-setup-guide.md)** - Complete admin dashboard setup and configuration
- 📖 **[Admin User Guide](./docs/admin-user-guide.md)** - How to use the admin dashboard
- 🔧 **[Admin API Reference](./docs/admin-api-reference.md)** - Admin API endpoints documentation
- 🔐 **[Admin Security](./ADMIN_SECURITY.md)** - Security architecture and best practices

## 📚 Documentation

Comprehensive documentation is available at http://localhost:3001 when running the development server:

- **Getting Started** - Set up your development environment
- **Development Guide** - Best practices and workflows
- **Architecture Overview** - Understand the project structure
- **Deployment Guide** - Deploy to production

Additional documentation files:

- [Profile Management Guide](./docs/PROFILE_MANAGEMENT_GUIDE.md) - Complete profile system guide
- [Profile Management API](./docs/PROFILE_MANAGEMENT_API.md) - Detailed API documentation
- [Enterprise Authentication Guide](./docs/ENTERPRISE_AUTHENTICATION_GUIDE.md) - Enterprise features
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Port Management](./docs/PORT_MANAGEMENT.md) - Automatic port configuration
- [Configuration System](./packages/config/README.md) - Type-safe configuration
- [UI Components](./packages/ui/README.md) - Shared component library
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute

### 🧪 Testing & Quality Standards

**Test Infrastructure Overhaul (July 2025)** ✅ **COMPLETE**

- ✅ **Comprehensive Jest configuration** with module resolution fixes for all packages
- ✅ **Global mock system** for Supabase, DOM APIs, and external dependencies
- ✅ **57 tests passing** across core functionality with proper async/await handling
- ✅ **Services testing**: ActivityService (36/36 tests), AvatarService (4/4 tests)
- ✅ **Hook testing**: useUserPreferences comprehensive testing (11/11 tests)
- ✅ **Component testing**: LoginForm and SignupForm with realistic mocking patterns
- ✅ **Test environment enhancements** with Node.js polyfills and proper test separation

**Documentation & Standards**:

- **[Feature Testing Requirements](./FEATURE_TESTING_REQUIREMENTS.md)** - Mandatory testing standards for all new features
- **[Feature Testing Checklist](./FEATURE_TESTING_CHECKLIST.md)** - Quick reference checklist for developers
- **[E2E Database Setup Guide](./docs/e2e-database-setup.md)** - Complete E2E test database setup and management
- [Authentication Testing Guide](./AUTH_TESTING_GUIDE.md) - Complete auth testing workflows
- [Multi-Tenant Testing Guide](./MULTI_TENANT_TESTING_GUIDE.md) - Multi-tenancy testing patterns

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Live Demo

**Production Deployments** (deployed to Vercel):

- 🚀 **Web App**: [next-saas-web.vercel.app](https://next-saas-web.vercel.app)
- 📚 **Documentation**: [next-saas-docs.vercel.app](https://next-saas-docs.vercel.app)
- 🌟 **Landing Page**: [next-saas-landing.vercel.app](https://next-saas-landing.vercel.app)

**Local Development**:

- Web App: http://localhost:3000
- Documentation: http://localhost:3001
- Landing Page: http://localhost:3002

## 🔗 Links

- [Issues](https://github.com/abhaytalreja/next-saas/issues)
- [Pull Requests](https://github.com/abhaytalreja/next-saas/pulls)
- [Contributing Guide](./CONTRIBUTING.md)
- [License](./LICENSE)

## 🙏 Acknowledgments

Built with these amazing open source projects:

- [Next.js](https://nextjs.org/)
- [Turborepo](https://turbo.build/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

<div align="center">
  <p>
    <strong>Ready to build your SaaS? Let's go! 🚀</strong>
  </p>
</div>

## 📊 Project Status

### 🧪 UI Component Library

![Test Coverage](https://img.shields.io/badge/coverage-92.5%25-4c1) ![Tests](https://img.shields.io/badge/tests-74%20passing-4c1) ![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-4c1) ![Components](https://img.shields.io/badge/components-43+-blue) ![Build](https://img.shields.io/badge/build-passing-4c1)

### 🔐 Authentication System

![Auth Status](https://img.shields.io/badge/auth-complete-4c1) ![Multi%20Tenant](https://img.shields.io/badge/multi--tenant-enabled-4c1) ![OAuth](https://img.shields.io/badge/OAuth-4%20providers-4c1) ![Security](https://img.shields.io/badge/security-enterprise--grade-4c1)

### 📈 Progress Summary

- ✅ **Foundation Complete**: Core architecture, auth, and UI systems
- ✅ **Production Ready**: Comprehensive testing and monitoring
- 🔄 **Next Phase**: Payment integration and advanced features

[View detailed test report](./packages/ui/TEST_STATUS.md) | [E2E Database Setup](./docs/e2e-database-setup.md) | [Authentication Testing Guide](./AUTH_TESTING_GUIDE.md) | [Multi-Tenant Setup](./MULTI_TENANT_TESTING_GUIDE.md)
