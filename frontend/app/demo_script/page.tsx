"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Check,
  Copy,
  ChevronDown,
  ChevronRight,
  Clock,
  Terminal,
  RotateCcw,
  Lightbulb,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react"

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
      className="absolute top-2 right-2 rounded bg-zinc-700 p-1.5 transition-colors hover:bg-zinc-600"
    >
      {copied ? (
        <Check className="text-success h-4 w-4" />
      ) : (
        <Copy className="text-muted-foreground h-4 w-4" />
      )}
    </button>
  )
}

function CodeBlock({ children, language = "bash" }: { children: string; language?: string }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 pr-12 font-mono text-sm text-zinc-100">
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
  defaultOpen = false,
}: {
  title: string
  time?: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-zinc-50 p-4 text-left transition-colors hover:bg-zinc-100"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-zinc-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-zinc-500" />
          )}
          <span className="font-semibold text-zinc-900">{title}</span>
        </div>
        {time && (
          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
            <Clock className="h-4 w-4" />
            {time}
          </div>
        )}
      </button>
      {isOpen && <div className="space-y-4 p-4">{children}</div>}
    </div>
  )
}

function Callout({
  type,
  children,
}: {
  type: "tip" | "warning" | "quote"
  children: React.ReactNode
}) {
  const styles = {
    tip: "bg-info/10 border-info/20 text-info",
    warning: "bg-warning/10 border-warning/20 text-warning",
    quote: "bg-muted border-border text-muted-foreground italic",
  }
  const icons = {
    tip: <Lightbulb className="text-info h-5 w-5 flex-shrink-0" />,
    warning: <AlertTriangle className="text-warning h-5 w-5 flex-shrink-0" />,
    quote: null,
  }

  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${styles[type]}`}>
      {icons[type]}
      <div>{children}</div>
    </div>
  )
}

export default function DemoScriptPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
            <Terminal className="h-4 w-4" />
            <span>Factory CLI Demo</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-zinc-900">Demo Script</h1>
          <p className="text-lg text-zinc-600">
            A guided walkthrough for demonstrating Factory CLI capabilities using the Acme Logistics
            application.
          </p>
        </div>

        <div className="mb-8 flex items-center gap-4 rounded-lg bg-zinc-50 p-4">
          <Clock className="h-5 w-5 text-zinc-400" />
          <div>
            <span className="font-medium text-zinc-900">Total Duration:</span>
            <span className="ml-2 text-zinc-600">10-15 minutes</span>
          </div>
        </div>

        <div className="space-y-4">
          <Section title="First-Time Setup" defaultOpen={true}>
            <p className="mb-4 text-zinc-600">
              If you just cloned the repository, follow these steps to get started:
            </p>

            <div className="space-y-4">
              <div>
                <p className="mb-2 font-medium text-zinc-800">1. Clone the repository:</p>
                <CodeBlock>{`git clone <repository-url>
cd logistics-app`}</CodeBlock>
              </div>

              <div>
                <p className="mb-2 font-medium text-zinc-800">2. Install dependencies:</p>
                <CodeBlock>pnpm install</CodeBlock>
              </div>

              <div>
                <p className="mb-2 font-medium text-zinc-800">
                  3. Set up the database and seed data:
                </p>
                <CodeBlock>{`pnpm setup
pnpm seed`}</CodeBlock>
              </div>

              <div>
                <p className="mb-2 font-medium text-zinc-800">
                  4. Install Factory CLI (if not already installed):
                </p>
                <CodeBlock>{`# Visit https://factory.ai to install the CLI
# Verify installation:
droid --version`}</CodeBlock>
              </div>

              <div>
                <p className="mb-2 font-medium text-zinc-800">5. Start the development servers:</p>
                <CodeBlock>pnpm dev</CodeBlock>
                <p className="mt-2 text-sm text-zinc-500">
                  This starts both the frontend (port 3000) and backend (port 8000).
                </p>
              </div>
            </div>
          </Section>

          <Section title="Pre-Demo Checklist" defaultOpen={true}>
            <p className="mb-4 text-zinc-600">
              Before starting the demo, ensure everything is ready:
            </p>

            <div className="space-y-4">
              <div>
                <p className="mb-2 font-medium text-zinc-800">1. Application is running:</p>
                <CodeBlock>pnpm dev</CodeBlock>
              </div>

              <div>
                <p className="mb-2 font-medium text-zinc-800">2. Factory CLI is available:</p>
                <CodeBlock>droid --version</CodeBlock>
              </div>

              <div>
                <p className="mb-2 font-medium text-zinc-800">3. Browser tabs open:</p>
                <ul className="ml-2 list-inside list-disc space-y-1 text-zinc-600">
                  <li>
                    Frontend:{" "}
                    <a href="http://localhost:3000" className="text-primary hover:underline">
                      http://localhost:3000
                    </a>
                  </li>
                  <li>
                    Fleet page:{" "}
                    <a href="http://localhost:3000/fleet" className="text-primary hover:underline">
                      http://localhost:3000/fleet
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="mb-2 font-medium text-zinc-800">
                  4. Reset any previous demo changes:
                </p>
                <CodeBlock>{`git checkout .
git clean -fd`}</CodeBlock>
              </div>
            </div>
          </Section>

          <Section title="Demo Story" defaultOpen={true}>
            <Callout type="quote">
              &quot;Imagine you&apos;re a developer at Acme Logistics. Your fleet managers are
              frustrated - every time they need to update a vehicle&apos;s status or mark it as
              refueled, they have to open an edit form and fill out multiple fields. They&apos;ve
              asked for quick action buttons to speed up their workflow. Let&apos;s see how Factory
              can help us build this feature in minutes, not hours.&quot;
            </Callout>
          </Section>

          <Section title="Part 1: Setting the Scene" time="2 min">
            <h3 className="mb-3 font-semibold text-zinc-900">Show the Current State</h3>

            <ol className="list-inside list-decimal space-y-3 text-zinc-600">
              <li>
                Open the browser to{" "}
                <a href="http://localhost:3000/fleet" className="text-primary hover:underline">
                  http://localhost:3000/fleet
                </a>
              </li>
              <li>Click on any vehicle card to view its details</li>
              <li>Point out the current features and what's missing</li>
            </ol>

            <Callout type="tip">
              <strong>Talking Points:</strong>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>
                  "Here's our vehicle detail page with vehicle info, driver, fuel level, and a map"
                </li>
                <li>
                  "To change the vehicle status or fuel level, we have to click Edit and fill out a
                  form"
                </li>
                <li>"Let's use Factory to add quick action buttons for common operations"</li>
              </ul>
            </Callout>
          </Section>

          <Section title="Part 2: Using Factory CLI" time="5-7 min">
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-zinc-900">Launch Factory</h3>
                <CodeBlock>droid</CodeBlock>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-zinc-900">Give Factory the Task</h3>
                <p className="mb-2 text-zinc-600">Type or paste this prompt:</p>
                <CodeBlock language="text">{`Add a "Quick Actions" panel to the vehicle detail page at frontend/app/fleet/[id]/page.tsx.
The panel should include:
1. Status buttons to mark the vehicle as "en_route", "idle", or "maintenance" with a single click
2. A "Mark as Refueled" button that sets the fuel level to 100%

Each action should call the appropriate API endpoint and update the UI.
Use the existing Card components and match the page's current styling.`}</CodeBlock>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-zinc-900">Narrate What's Happening</h3>
                <Callout type="tip">
                  As Factory works, explain:
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>"Factory is analyzing the codebase to understand our patterns..."</li>
                    <li>
                      "It's looking at the existing API client to understand how we make
                      requests..."
                    </li>
                    <li>"It found our Card components and is matching the existing styling..."</li>
                    <li>"Notice how it follows our existing code conventions..."</li>
                  </ul>
                </Callout>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-zinc-900">Review the Changes</h3>
                <ol className="list-inside list-decimal space-y-2 text-zinc-600">
                  <li>
                    <strong>Show updated API:</strong>{" "}
                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">
                      frontend/lib/api.ts
                    </code>{" "}
                    (new endpoint functions)
                  </li>
                  <li>
                    <strong>Show updated page:</strong>{" "}
                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">
                      frontend/app/fleet/[id]/page.tsx
                    </code>
                  </li>
                  <li>
                    <strong>Refresh browser</strong> and navigate to a vehicle to see the Quick
                    Actions panel
                  </li>
                  <li>
                    <strong>Demo the actions</strong> - click status buttons, click "Mark as
                    Refueled"
                  </li>
                </ol>
              </div>
            </div>
          </Section>

          <Section title="Part 3: Iterating (Optional)" time="3-5 min">
            <p className="mb-4 text-zinc-600">
              If time permits, demonstrate making a quick refinement:
            </p>

            <CodeBlock>{`Add confirmation dialogs before changing the vehicle status to maintenance, 
since that takes the vehicle out of service. Also add a loading state to 
the buttons while the API request is in progress.`}</CodeBlock>

            <div className="mt-4">
              <Callout type="tip">
                <strong>Key Points:</strong>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>"Factory understands context and existing code patterns"</li>
                  <li>"It creates production-ready code, not just snippets"</li>
                  <li>"We can iterate naturally, like working with a senior developer"</li>
                </ul>
              </Callout>
            </div>
          </Section>

          <Section title="Part 4: Wrap Up" time="1-2 min">
            <h3 className="mb-3 font-semibold text-zinc-900">Summarize the Demo</h3>
            <ul className="list-inside list-disc space-y-2 text-zinc-600">
              <li>&quot;In just a few minutes, we added a complete Quick Actions panel&quot;</li>
              <li>
                &quot;Factory understood our API patterns and created the right endpoint calls&quot;
              </li>
              <li>
                &quot;The code follows our existing patterns and uses our component library&quot;
              </li>
              <li>&quot;A feature that might take 30+ minutes was done in just a few&quot;</li>
            </ul>

            <div className="mt-4">
              <h3 className="mb-3 font-semibold text-zinc-900">Key Takeaways</h3>
              <ul className="list-inside list-disc space-y-2 text-zinc-600">
                <li>
                  Factory analyzes your entire codebase to understand patterns and conventions
                </li>
                <li>It writes production-ready code, not just snippets or examples</li>
                <li>
                  You can iterate naturally, refining the output like working with a colleague
                </li>
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="mb-3 font-semibold text-zinc-900">Call to Action</h3>
              <Callout type="quote">
                &quot;This is the power of Factory - AI that understands your codebase and writes
                production code. It&apos;s like having a senior developer who knows your entire
                codebase available 24/7.&quot;
              </Callout>
            </div>
          </Section>

          <Section title="Reset for Next Demo" defaultOpen={true}>
            <div className="mb-4 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-zinc-500" />
              <p className="text-zinc-600">After the demo, reset all changes:</p>
            </div>

            <CodeBlock>{`# Discard all changes to tracked files
git checkout .

# Remove any untracked files
git clean -fd

# Verify clean state
git status`}</CodeBlock>

            <p className="mt-3 text-sm text-zinc-500">
              Output should show:{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5">
                nothing to commit, working tree clean
              </code>
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
                <p className="text-sm text-zinc-600">
                  Try restarting the CLI or check that you have the latest version installed.
                </p>
              </div>

              <div>
                <p className="font-medium text-zinc-800">Database issues</p>
                <CodeBlock>pnpm db:reset</CodeBlock>
              </div>
            </div>
          </Section>

          <Section title="Alternative Demo Prompts">
            <p className="mb-4 text-zinc-600">Try these for variety:</p>

            <div className="space-y-4">
              <div>
                <p className="mb-2 font-medium text-zinc-800">Add Edit Functionality</p>
                <CodeBlock>{`Create an edit modal for vehicles on the fleet detail page. Reuse the existing 
VehicleModal component but make it support both create and edit modes.`}</CodeBlock>
              </div>

              <div>
                <p className="mb-2 font-medium text-zinc-800">Add a Dashboard Widget</p>
                <CodeBlock>{`Add a "Vehicles En Route" widget to the dashboard showing a count of 
vehicles in transit with a mini list of their destinations.`}</CodeBlock>
              </div>

              <div>
                <p className="mb-2 font-medium text-zinc-800">Improve Existing Feature</p>
                <CodeBlock>{`Update the shipment tracking page to show estimated delivery time 
remaining based on ETA, displayed as "Arriving in X hours" format.`}</CodeBlock>
              </div>
            </div>
          </Section>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="pb-2 font-medium">Section</th>
                <th className="pb-2 text-right font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="text-zinc-600">
              <tr>
                <td className="py-1">Setting the Scene</td>
                <td className="text-right">2 min</td>
              </tr>
              <tr>
                <td className="py-1">Factory CLI Demo</td>
                <td className="text-right">5-7 min</td>
              </tr>
              <tr>
                <td className="py-1">Iteration (optional)</td>
                <td className="text-right">3-5 min</td>
              </tr>
              <tr>
                <td className="py-1">Wrap Up</td>
                <td className="text-right">1-2 min</td>
              </tr>
              <tr className="border-t border-zinc-200 font-semibold text-zinc-900">
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
