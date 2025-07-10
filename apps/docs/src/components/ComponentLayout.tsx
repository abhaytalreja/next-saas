import React from 'react'

interface ComponentLayoutProps {
  title: string
  description: string
  examples: Array<{
    title: string
    code: string
    component: React.ReactNode
  }>
}

export function ComponentLayout({
  title,
  description,
  examples,
}: ComponentLayoutProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-lg text-gray-600">{description}</p>
      </div>

      <div className="space-y-12">
        {examples.map((example, index) => (
          <div key={index} className="space-y-4">
            <h2 className="text-xl font-semibold">{example.title}</h2>
            <div className="border rounded-lg overflow-hidden">
              <div className="p-6 bg-white">{example.component}</div>
              <div className="border-t bg-gray-50 p-4">
                <pre className="text-sm overflow-x-auto">
                  <code>{example.code}</code>
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
