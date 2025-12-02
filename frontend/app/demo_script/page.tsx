"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Copy, ChevronDown, ChevronRight, Clock, Terminal, RotateCcw, Lightbulb, AlertTriangle, ArrowLeft } from "lucide-react"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded bg-zinc-700 hover:bg-zinc-600 transition-colors"
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
    </button>
  )
}

function CodeBlock({ children, language = "bash" }: { children: string; language?: string }) {
  return (
    <div className="relative">
      <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 pr-12 overflow-x-auto text-sm font-mono">
        <code>{children.trim()}</code>
      </pre>
      <CopyButton text={children.trim()} />
    </div>
  )
}

function Section({ 
  title, 
  time, 
  children, 
  defaultOpen = false 
}: { 
  title: string
  time?: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown className="h-5 w-5 text-zinc-500" /> : <ChevronRight className="h-5 w-5 text-zinc-500" />}
          <span className="font-semibold text-zinc-900">{title}</span>
        </div>
        {time && (
          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
            <Clock className="h-4 w-4" />
            {time}
          </div>
        )}
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  )
}

function Callout({ type, children }: { type: "tip" | "warning" | "quote"; children: React.ReactNode }) {
  const styles = {
    tip: "bg-info/10 border-info/20 text-info",
    warning: "bg-warning/10 border-warning/20 text-warning",
    quote: "bg-muted border-border text-muted-foreground italic",
  }
  const icons = {
    tip: <Lightbulb className="h-5 w-5 text-info flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />,
    quote: null,
  }

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${styles[type]}`}>
      {icons[type]}
      <div>{children}</div>
    </div>
  )
}

export default function DemoScriptPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
            <Terminal className="h-4 w-4" />
            <span>Factory CLI Demo</span>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 mb-3">Demo Script</h1>
          <p className="text-lg text-zinc-600">
            A guided walkthrough for demonstrating Factory CLI capabilities using the Acme Logistics application.
          </p>
        </div>

        <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg mb-8">
          <Clock className="h-5 w-5 text-zinc-400" />
          <div>
            <span className="font-medium text-zinc-900">Total Duration:</span>
            <span className="text-zinc-600 ml-2">10-15 minutes</span>
          </div>
        </div>

        <div className="space-y-4">
          <Section title="Prerequisites" defaultOpen={true}>
            <p className="text-zinc-600 mb-4">Before starting the demo, ensure everything is set up:</p>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium text-zinc-800 mb-2">1. Application is running:</p>
                <CodeBlock>pnpm dev</CodeBlock>
              </div>

              <div>
                <p className="font-medium text-zinc-800 mb-2">2. Factory CLI is installed:</p>
                <CodeBlock>droid --version</CodeBlock>
              </div>

              <div>
                <p className="font-medium text-zinc-800 mb-2">3. Browser tabs open:</p>
                <ul className="list-disc list-inside text-zinc-600 space-y-1 ml-2">
                  <li>Frontend: <a href="http://localhost:3000" className="text-primary hover:underline">http://localhost:3000</a></li>
                  <li>Fleet page: <a href="http://localhost:3000/fleet" className="text-primary hover:underline">http://localhost:3000/fleet</a></li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-zinc-800 mb-2">4. Reset any previous changes:</p>
                <CodeBlock>{`git checkout .
git clean -fd`}</CodeBlock>
              </div>
            </div>
          </Section>

          <Section title="Demo Story" defaultOpen={true}>
            <Callout type="quote">
              "Imagine you're a developer at Acme Logistics. Your product manager just came to you with a request: they want fleet managers to be able to see vehicle locations on a map when viewing vehicle details. Let's see how Factory can help us build this feature in minutes, not hours."
            </Callout>
          </Section>

          <Section title="Part 1: Setting the Scene" time="2 min">
            <h3 className="font-semibold text-zinc-900 mb-3">Show the Current State</h3>
            
            <ol className="list-decimal list-inside space-y-3 text-zinc-600">
              <li>Open the browser to <a href="http://localhost:3000/fleet" className="text-primary hover:underline">http://localhost:3000/fleet</a></li>
              <li>Click on any vehicle card to view its details</li>
              <li>Point out the current features and what's missing</li>
            </ol>

            <Callout type="tip">
              <strong>Talking Points:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"Here's our vehicle detail page with vehicle info, driver, fuel level, and a map"</li>
                <li>"To change the vehicle status or fuel level, we have to click Edit and fill out a form"</li>
                <li>"Let's use Factory to add quick action buttons for common operations"</li>
              </ul>
            </Callout>
          </Section>

          <Section title="Part 2: Using Factory CLI" time="5-7 min">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Launch Factory</h3>
                <CodeBlock>droid</CodeBlock>
              </div>

              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Give Factory the Task</h3>
                <p className="text-zinc-600 mb-2">Type or paste this prompt:</p>
                <CodeBlock language="text">{`Add a "Quick Actions" panel to the vehicle detail page at frontend/app/fleet/[id]/page.tsx.
The panel should include:
1. Status buttons to mark the vehicle as "en_route", "idle", or "maintenance" with a single click
2. A "Mark as Refueled" button that sets the fuel level to 100%

Each action should call the appropriate API endpoint and update the UI.
Use the existing Card components and match the page's current styling.`}</CodeBlock>
              </div>

              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Narrate What's Happening</h3>
                <Callout type="tip">
                  As Factory works, explain:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>"Factory is analyzing the codebase to understand our patterns..."</li>
                    <li>"It's looking at the existing API client to understand how we make requests..."</li>
                    <li>"It found our Card components and is matching the existing styling..."</li>
                    <li>"Notice how it follows our existing code conventions..."</li>
                  </ul>
                </Callout>
              </div>

              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Review the Changes</h3>
                <ol className="list-decimal list-inside space-y-2 text-zinc-600">
                  <li><strong>Show updated API:</strong> <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">frontend/lib/api.ts</code> (new endpoint functions)</li>
                  <li><strong>Show updated page:</strong> <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">frontend/app/fleet/[id]/page.tsx</code></li>
                  <li><strong>Refresh browser</strong> and navigate to a vehicle to see the Quick Actions panel</li>
                  <li><strong>Demo the actions</strong> - click status buttons, click "Mark as Refueled"</li>
                </ol>
              </div>
            </div>
          </Section>

          <Section title="Part 3: Iterating (Optional)" time="3-5 min">
            <p className="text-zinc-600 mb-4">If time permits, demonstrate making a quick refinement:</p>
            
            <CodeBlock>{`Add confirmation dialogs before changing the vehicle status to maintenance, 
since that takes the vehicle out of service. Also add a loading state to 
the buttons while the API request is in progress.`}</CodeBlock>

            <div className="mt-4">
              <Callout type="tip">
                <strong>Key Points:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>"Factory understands context and existing code patterns"</li>
                  <li>"It creates production-ready code, not just snippets"</li>
                  <li>"We can iterate naturally, like working with a senior developer"</li>
                </ul>
              </Callout>
            </div>
          </Section>

          <Section title="Part 4: Wrap Up" time="1-2 min">
            <h3 className="font-semibold text-zinc-900 mb-3">Summarize the Demo</h3>
            <ul className="list-disc list-inside space-y-2 text-zinc-600">
              <li>"In just a few minutes, we added a complete map feature"</li>
              <li>"Factory handled coordinate systems, component integration, and edge cases"</li>
              <li>"The code follows our existing patterns and uses our component library"</li>
              <li>"A feature that might take an hour or more was done in minutes"</li>
            </ul>

            <div className="mt-4">
              <h3 className="font-semibold text-zinc-900 mb-3">Call to Action</h3>
              <Callout type="quote">
                "This is the power of Factory - AI that understands your codebase and writes production code. It's like having a senior developer who knows your entire codebase available 24/7."
              </Callout>
            </div>
          </Section>

          <Section title="Reset for Next Demo" defaultOpen={true}>
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw className="h-5 w-5 text-zinc-500" />
              <p className="text-zinc-600">After the demo, reset all changes:</p>
            </div>
            
            <CodeBlock>{`# Discard all changes to tracked files
git checkout .

# Remove any untracked files
git clean -fd

# Verify clean state
git status`}</CodeBlock>

            <p className="text-zinc-500 text-sm mt-3">
              Output should show: <code className="bg-zinc-100 px-1.5 py-0.5 rounded">nothing to commit, working tree clean</code>
            </p>
          </Section>

          <Section title="Troubleshooting">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-zinc-800">Application won't start</p>
                <CodeBlock>{`pnpm setup
pnpm seed
pnpm dev`}</CodeBlock>
              </div>

              <div>
                <p className="font-medium text-zinc-800">Factory CLI not responding</p>
                <p className="text-zinc-600 text-sm">Try restarting the CLI or check that you have the latest version installed.</p>
              </div>

              <div>
                <p className="font-medium text-zinc-800">Database issues</p>
                <CodeBlock>pnpm db:reset</CodeBlock>
              </div>
            </div>
          </Section>

          <Section title="Alternative Demo Prompts">
            <p className="text-zinc-600 mb-4">Try these for variety:</p>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium text-zinc-800 mb-2">Add Edit Functionality</p>
                <CodeBlock>{`Create an edit modal for vehicles on the fleet detail page. Reuse the existing 
VehicleModal component but make it support both create and edit modes.`}</CodeBlock>
              </div>

              <div>
                <p className="font-medium text-zinc-800 mb-2">Add a Dashboard Widget</p>
                <CodeBlock>{`Add a "Vehicles En Route" widget to the dashboard showing a count of 
vehicles in transit with a mini list of their destinations.`}</CodeBlock>
              </div>

              <div>
                <p className="font-medium text-zinc-800 mb-2">Improve Existing Feature</p>
                <CodeBlock>{`Update the shipment tracking page to show estimated delivery time 
remaining based on ETA, displayed as "Arriving in X hours" format.`}</CodeBlock>
              </div>
            </div>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="pb-2 font-medium">Section</th>
                <th className="pb-2 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="text-zinc-600">
              <tr><td className="py-1">Setting the Scene</td><td className="text-right">2 min</td></tr>
              <tr><td className="py-1">Factory CLI Demo</td><td className="text-right">5-7 min</td></tr>
              <tr><td className="py-1">Iteration (optional)</td><td className="text-right">3-5 min</td></tr>
              <tr><td className="py-1">Wrap Up</td><td className="text-right">1-2 min</td></tr>
              <tr className="font-semibold text-zinc-900 border-t border-zinc-200">
                <td className="pt-2">Total</td>
                <td className="pt-2 text-right">10-15 min</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
