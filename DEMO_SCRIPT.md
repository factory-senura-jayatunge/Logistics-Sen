# Factory CLI Demo Script

This script guides you through demonstrating Factory's CLI capabilities using the Acme Logistics application. The demo showcases how Factory accelerates feature development with AI-powered coding assistance.

## Prerequisites

Before starting the demo:

1. **Ensure the application is running:**

   ```bash
   pnpm dev
   ```

2. **Verify Factory CLI is installed:**

   ```bash
   droid --version
   ```

3. **Open the application in your browser:**
   - Frontend: <http://localhost:3000>
   - Navigate to the Fleet page: <http://localhost:3000/fleet>

4. **Reset any previous demo changes:**

   ```bash
   git checkout .
   git clean -fd
   ```

---

## Demo Story

> "Imagine you're a developer at Acme Logistics. Your product manager just came to you with a request: fleet managers need quick action buttons to change vehicle status and fuel levels without opening a full edit form. Let's see how Factory can help us build this feature in minutes, not hours."

---

## Part 1: Setting the Scene (2 minutes)

### Show the Current State

1. Open the browser to <http://localhost:3000/fleet>
2. Click on any vehicle card to view its details
3. Point out:
   - "Here's our vehicle detail page. We can see the vehicle info, driver, fuel level, and even a map."
   - "But to change the vehicle status or update the fuel level, we have to click Edit and fill out a whole form."
   - "Let's use Factory to add quick action buttons for these common operations."

---

## Part 2: Using Factory CLI (5-7 minutes)

### Launch Factory

Open your terminal in the project root and start Factory:

```bash
droid
```

### Give Factory the Task

Type or paste this prompt:

```txt
Add a "Quick Actions" panel to the vehicle detail page at frontend/app/fleet/[id]/page.tsx.
The panel should include:
1. Status buttons to mark the vehicle as "en_route", "idle", or "maintenance" with a single click
2. A "Mark as Refueled" button that sets the fuel level to 100%

Each action should call the appropriate API endpoint and update the UI.
Use the existing Card components and match the page's current styling.
```

### Narrate What's Happening

As Factory works, explain:

- "Factory is analyzing the codebase to understand our existing patterns..."
- "It's looking at the existing API client to understand how we make requests..."
- "It found our Card components and is matching the existing styling..."
- "Notice how it's following our existing code style and conventions..."

### Review the Changes

Once Factory completes:

1. **Show the updated API file:** `frontend/lib/api.ts`
   - "Factory added new functions for updating vehicle status and fuel level"

2. **Show the updated vehicle page:** `frontend/app/fleet/[id]/page.tsx`
   - "It added a Quick Actions panel with status buttons and fuel controls"

3. **Refresh the browser** and navigate to a vehicle:
   - "And there it is - a fully functional Quick Actions panel"

4. **Demo the actions:**
   - Click a status button to change the vehicle status
   - Click "Mark as Refueled" to set fuel to 100%

---

## Part 3: Iterating on the Feature (3-5 minutes)

### Show Factory's Iteration Capability

If time permits, demonstrate making a quick refinement:

```txt
Add confirmation dialogs before changing the vehicle status to maintenance, 
since that takes the vehicle out of service. Also add a loading state to 
the buttons while the API request is in progress.
```

Or try:

```txt
Add a "Last Updated" timestamp that shows when the vehicle data was last modified,
and auto-refresh the data every 30 seconds.
```

### Key Talking Points

- "Factory understands context - it knows about our existing code patterns"
- "It creates production-ready code, not just snippets"
- "We can iterate naturally, just like working with a senior developer"

---

## Part 4: Wrap Up (1-2 minutes)

### Summarize the Demo

- "In just a few minutes, we added a complete map feature"
- "Factory handled the coordinate system, component integration, and edge cases"
- "The code follows our existing patterns and uses our component library"
- "A feature that might take an hour or more was done in minutes"

### Call to Action

- "This is the power of Factory - AI that understands your codebase and writes production code"
- "It's like having a senior developer who knows your entire codebase available 24/7"

---

## Resetting for the Next Demo

After the demo, reset all changes to prepare for the next run:

```bash
# Discard all changes to tracked files
git checkout .

# Remove any untracked files (like new files Factory created)
git clean -fd

# Verify clean state
git status
```

The output should show:

```txt
On branch main
nothing to commit, working tree clean
```

---

## Troubleshooting

### Application won't start

```bash
pnpm setup
pnpm seed
pnpm dev
```

### Factory CLI not responding

Try restarting the CLI or check that you have the latest version installed.

### Map not displaying

- Ensure the frontend dev server is running
- Check browser console for errors
- Verify the location strings in the database match the coordinate lookup

### Database issues

```bash
pnpm db:reset
```

---

## Alternative Demo Prompts

If you want to demonstrate different capabilities, try these alternative features:

### Add Edit Functionality

```txt
Create an edit modal for vehicles on the fleet detail page. Reuse the existing 
VehicleModal component but make it support both create and edit modes.
```

### Add a New Dashboard Widget

```txt
Add a "Vehicles En Route" widget to the dashboard that shows a count of vehicles 
currently in transit with a mini list of their destinations.
```

### Improve an Existing Feature

```txt
Update the shipment tracking page to show estimated delivery time remaining 
based on the ETA field, displayed as "Arriving in X hours" format.
```

---

## Demo Duration

| Section | Time |
|---------|------|
| Setting the Scene | 2 min |
| Factory CLI Demo | 5-7 min |
| Iteration (optional) | 3-5 min |
| Wrap Up | 1-2 min |
| **Total** | **10-15 min** |
