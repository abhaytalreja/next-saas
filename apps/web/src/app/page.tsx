import { Card, CardContent, Container, Heading, Text } from '@nextsaas/ui'

export default function Home() {
  return (
    <div className="min-h-full">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <Container>
          <div className="py-12">
            <Heading level={1} className="mb-4">
              Welcome to NextSaaS
            </Heading>
            <Text size="lg" className="text-gray-600 dark:text-gray-400">
              A modern SaaS starter built with Next.js 15, Turborepo, and
              TypeScript
            </Text>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">🚀 Turborepo</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Optimized monorepo with intelligent caching
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">⚡ Next.js 15</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Latest Next.js with App Router and Server Components
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">🎯 TypeScript</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Strict type checking across all workspaces
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <Heading level={2} className="mb-6">
              Quick Links
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">📦 Component Library</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Explore our comprehensive collection of UI components with
                    live demos.
                  </p>
                  <a
                    href="/components"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    View Components →
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">📚 Documentation</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Learn about the architecture, features, and best practices.
                  </p>
                  <a
                    href="http://localhost:3001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    Read Docs →
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
