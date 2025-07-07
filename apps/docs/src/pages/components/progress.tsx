import React from 'react'

export default function ProgressPage() {
  return (
    <div className="prose max-w-none">
      <h1>Progress</h1>
      <p className="text-lg text-gray-600">
        Show progress of tasks and processes with visual indicators.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Progress } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Basic Usage</h2>
      <p>Simple progress bar showing completion percentage.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <div className="text-sm text-gray-600">45% Complete</div>
        </div>
      </div>

      <pre>
        <code>{`<Progress value={45} />`}</code>
      </pre>

      <h2>Different Values</h2>
      <p>Progress bars with various completion levels.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Getting Started</span>
              <span>25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>In Progress</span>
              <span>60%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Almost Done</span>
              <span>85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Complete</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Progress value={25} />
<Progress value={60} />
<Progress value={85} />
<Progress value={100} color="success" />`}</code>
      </pre>

      <h2>Colors</h2>
      <p>Different color variants for various contexts.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm mb-2">Primary</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="text-sm mb-2">Success</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="text-sm mb-2">Warning</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="text-sm mb-2">Error</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Progress value={70} color="primary" />
<Progress value={70} color="success" />
<Progress value={70} color="warning" />
<Progress value={70} color="error" />`}</code>
      </pre>

      <h2>Sizes</h2>
      <p>Different sizes for various use cases.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm mb-2">Small</div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-blue-600 h-1 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="text-sm mb-2">Default</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="text-sm mb-2">Large</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Progress value={65} size="sm" />
<Progress value={65} size="default" />
<Progress value={65} size="lg" />`}</code>
      </pre>

      <h2>Striped</h2>
      <p>Progress bar with striped pattern.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm mb-2">Striped</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500" style={{ 
                width: '60%',
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)',
                backgroundSize: '1rem 1rem'
              }}></div>
            </div>
          </div>
          
          <div>
            <div className="text-sm mb-2">Animated Striped</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 animate-pulse" style={{ 
                width: '60%',
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)',
                backgroundSize: '1rem 1rem'
              }}></div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Progress value={60} striped />
<Progress value={60} striped animated />`}</code>
      </pre>

      <h2>Indeterminate</h2>
      <p>Progress bar for unknown completion time.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm mb-2">Loading...</div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Progress indeterminate />`}</code>
      </pre>

      <h2>With Labels</h2>
      <p>Progress bars with descriptive labels.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Upload Progress</span>
              <span className="text-sm text-gray-600">3 of 10 files</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-gray-600">7.2 GB of 10 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Progress 
  value={30} 
  label="Upload Progress" 
  description="3 of 10 files" 
/>

<Progress 
  value={72} 
  label="Storage Used" 
  description="7.2 GB of 10 GB"
  color="warning" 
/>`}</code>
      </pre>

      <h2>API Reference</h2>

      <div className="not-prose overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Prop</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Default</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 font-medium">value</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">number</code></td>
              <td className="px-4 py-3 text-gray-600">0</td>
              <td className="px-4 py-3 text-gray-600">Progress value (0-100)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">max</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">number</code></td>
              <td className="px-4 py-3 text-gray-600">100</td>
              <td className="px-4 py-3 text-gray-600">Maximum value</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">color</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"primary" | "success" | "warning" | "error"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"primary"</td>
              <td className="px-4 py-3 text-gray-600">Progress bar color</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">size</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"sm" | "default" | "lg"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"default"</td>
              <td className="px-4 py-3 text-gray-600">Progress bar size</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">striped</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Show striped pattern</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">animated</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Animate stripes</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">indeterminate</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Show indeterminate state</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">label</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">string</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Progress label</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">description</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">string</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Progress description</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}