export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to NextSaaS
        </h1>
        <p className="text-center text-lg mb-8">
          A modern SaaS starter built with Next.js 15, Turborepo, and TypeScript
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">🚀 Turborepo</h2>
            <p>Optimized monorepo with intelligent caching</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">⚡ Next.js 15</h2>
            <p>Latest Next.js with App Router and Server Components</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">🎯 TypeScript</h2>
            <p>Strict type checking across all workspaces</p>
          </div>
        </div>
      </div>
    </main>
  )
}