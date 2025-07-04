#!/bin/bash

# NextSaaS Setup Script
# This script sets up the development environment for NextSaaS

set -e

echo "🚀 Setting up NextSaaS development environment..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check npm version
NPM_VERSION=$(npm -v)
echo "✅ npm version: $NPM_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment files
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual environment variables"
fi

# Set up git hooks
echo "🔧 Setting up git hooks..."
npx husky || echo "Git hooks setup skipped"

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npm run db:generate --workspace=@nextsaas/database || true

# Build packages
echo "🏗️  Building packages..."
npm run build --workspace=@nextsaas/ui
npm run build --workspace=@nextsaas/auth

echo ""
echo "✨ Setup complete! You can now run:"
echo "  npm run dev    - Start development servers"
echo "  npm run build  - Build all applications"
echo "  npm run lint   - Run linters"
echo "  npm run test   - Run tests"
echo ""
echo "📚 Check out the documentation at http://localhost:3001"
echo "🎨 View the landing page at http://localhost:3002"
echo "🚀 Access the main app at http://localhost:3000"