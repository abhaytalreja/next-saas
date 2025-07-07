import React from 'react'
import { Info, Help, Settings } from 'lucide-react'

export default function TooltipPage() {
  return (
    <div className="prose max-w-none">
      <h1>Tooltip</h1>
      <p className="text-lg text-gray-600">
        Contextual information displayed on hover or focus.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Basic Usage</h2>
      <p>Simple tooltip triggered by hover.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex justify-center">
          <div className="relative group">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Hover me
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              This is a tooltip
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Tooltip>
  <TooltipTrigger>
    <Button>Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>
    This is a tooltip
  </TooltipContent>
</Tooltip>`}</code>
      </pre>

      <h2>Positions</h2>
      <p>Tooltip can be positioned on all sides.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex justify-center items-center space-x-16">
          <div className="grid grid-cols-3 gap-8">
            {/* Top */}
            <div className="col-start-2 relative group">
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Top
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Tooltip on top
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Left */}
            <div className="relative group">
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Left
              </button>
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Tooltip on left
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
              </div>
            </div>

            {/* Right */}
            <div className="relative group">
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Right
              </button>
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Tooltip on right
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            </div>

            {/* Bottom */}
            <div className="col-start-2 relative group">
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Bottom
              </button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Tooltip on bottom
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Tooltip placement="top">
  <TooltipTrigger>Top</TooltipTrigger>
  <TooltipContent>Tooltip on top</TooltipContent>
</Tooltip>

<Tooltip placement="left">
  <TooltipTrigger>Left</TooltipTrigger>
  <TooltipContent>Tooltip on left</TooltipContent>
</Tooltip>

<Tooltip placement="right">
  <TooltipTrigger>Right</TooltipTrigger>
  <TooltipContent>Tooltip on right</TooltipContent>
</Tooltip>

<Tooltip placement="bottom">
  <TooltipTrigger>Bottom</TooltipTrigger>
  <TooltipContent>Tooltip on bottom</TooltipContent>
</Tooltip>`}</code>
      </pre>

      <h2>With Icons</h2>
      <p>Tooltips commonly used with icons for help text.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex justify-center items-center space-x-8">
          <div className="relative group">
            <Info className="h-5 w-5 text-blue-600 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Additional information
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          <div className="relative group">
            <Help className="h-5 w-5 text-gray-600 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Get help with this feature
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          <div className="relative group">
            <Settings className="h-5 w-5 text-gray-600 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Configure settings
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Tooltip>
  <TooltipTrigger>
    <Info className="h-5 w-5 text-blue-600 cursor-help" />
  </TooltipTrigger>
  <TooltipContent>Additional information</TooltipContent>
</Tooltip>

<Tooltip>
  <TooltipTrigger>
    <Help className="h-5 w-5 text-gray-600 cursor-help" />
  </TooltipTrigger>
  <TooltipContent>Get help with this feature</TooltipContent>
</Tooltip>

<Tooltip>
  <TooltipTrigger>
    <Settings className="h-5 w-5 text-gray-600 cursor-help" />
  </TooltipTrigger>
  <TooltipContent>Configure settings</TooltipContent>
</Tooltip>`}</code>
      </pre>

      <h2>Rich Content</h2>
      <p>Tooltips can contain rich content including formatted text.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex justify-center">
          <div className="relative group">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Rich Tooltip
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64">
              <div className="font-semibold mb-1">Feature Details</div>
              <div className="text-xs text-gray-300">
                This feature allows you to configure advanced settings for your account.
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Tooltip>
  <TooltipTrigger>
    <Button>Rich Tooltip</Button>
  </TooltipTrigger>
  <TooltipContent className="max-w-xs">
    <div className="font-semibold mb-1">Feature Details</div>
    <div className="text-xs text-gray-300">
      This feature allows you to configure advanced settings for your account.
    </div>
  </TooltipContent>
</Tooltip>`}</code>
      </pre>

      <h2>Delay</h2>
      <p>Control show and hide delays for better UX.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex justify-center space-x-4">
          <div className="relative group">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              No Delay
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Appears immediately
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          <div className="relative group">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              With Delay
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity delay-500 pointer-events-none whitespace-nowrap">
              Appears after 500ms
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Tooltip>
  <TooltipTrigger>No Delay</TooltipTrigger>
  <TooltipContent>Appears immediately</TooltipContent>
</Tooltip>

<Tooltip delayDuration={500}>
  <TooltipTrigger>With Delay</TooltipTrigger>
  <TooltipContent>Appears after 500ms</TooltipContent>
</Tooltip>`}</code>
      </pre>

      <h2>Disabled Elements</h2>
      <p>Tooltips on disabled elements require wrapper elements.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex justify-center space-x-4">
          <div className="relative group">
            <span className="inline-block">
              <button 
                disabled 
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
              >
                Disabled Button
              </button>
            </span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              This button is disabled
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Tooltip>
  <TooltipTrigger asChild>
    <span>
      <Button disabled>Disabled Button</Button>
    </span>
  </TooltipTrigger>
  <TooltipContent>This button is disabled</TooltipContent>
</Tooltip>`}</code>
      </pre>

      <h2>API Reference</h2>

      <div className="not-prose space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-3">Tooltip</h3>
          <div className="overflow-x-auto">
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
                  <td className="px-4 py-3 font-medium">placement</td>
                  <td className="px-4 py-3 text-gray-600">
                    <code className="text-xs">"top" | "bottom" | "left" | "right"</code>
                  </td>
                  <td className="px-4 py-3 text-gray-600">"top"</td>
                  <td className="px-4 py-3 text-gray-600">Tooltip position</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">delayDuration</td>
                  <td className="px-4 py-3 text-gray-600"><code className="text-xs">number</code></td>
                  <td className="px-4 py-3 text-gray-600">0</td>
                  <td className="px-4 py-3 text-gray-600">Show delay in milliseconds</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">skipDelayDuration</td>
                  <td className="px-4 py-3 text-gray-600"><code className="text-xs">number</code></td>
                  <td className="px-4 py-3 text-gray-600">300</td>
                  <td className="px-4 py-3 text-gray-600">Skip delay when moving between tooltips</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">TooltipTrigger</h3>
          <p className="text-sm text-gray-600">Element that triggers the tooltip display.</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">TooltipContent</h3>
          <div className="overflow-x-auto">
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
                  <td className="px-4 py-3 font-medium">sideOffset</td>
                  <td className="px-4 py-3 text-gray-600"><code className="text-xs">number</code></td>
                  <td className="px-4 py-3 text-gray-600">4</td>
                  <td className="px-4 py-3 text-gray-600">Distance from trigger</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">align</td>
                  <td className="px-4 py-3 text-gray-600">
                    <code className="text-xs">"start" | "center" | "end"</code>
                  </td>
                  <td className="px-4 py-3 text-gray-600">"center"</td>
                  <td className="px-4 py-3 text-gray-600">Alignment relative to trigger</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">TooltipProvider</h3>
          <p className="text-sm text-gray-600">Context provider for tooltip configuration. Wrap your app or component tree.</p>
        </div>
      </div>
    </div>
  )
}