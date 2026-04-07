"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Package,
  Truck,
  ClipboardList,
  Warehouse,
  Users,
  Settings,
  LayoutDashboard,
  Box,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { search, type SearchResult } from "@/lib/api"

const navigationItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Shipments", icon: Truck, href: "/shipments" },
  { name: "Orders", icon: ClipboardList, href: "/orders" },
  { name: "Inventory", icon: Package, href: "/inventory" },
  { name: "Facilities", icon: Warehouse, href: "/facilities" },
  { name: "Fleet", icon: Truck, href: "/fleet" },
  { name: "Settings", icon: Settings, href: "/settings" },
]

const typeIcons: Record<string, React.ElementType> = {
  shipment: Truck,
  order: ClipboardList,
  inventory: Package,
  customer: Users,
  vehicle: Truck,
  facility: Warehouse,
}

export function CommandMenu() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await search(query, 8)
        setResults(data)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelect = (href: string) => {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search shipments, orders, inventory..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Searching..." : query.length < 2 ? "Type to search..." : "No results found."}
        </CommandEmpty>

        {results.length > 0 && (
          <CommandGroup heading="Search Results">
            {results.map((result) => {
              const Icon = typeIcons[result.type] || Box
              return (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={result.title}
                  onSelect={() => handleSelect(result.url)}
                  className="flex items-center gap-3"
                >
                  <Icon className="text-muted-foreground h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    <span className="text-muted-foreground text-xs">{result.subtitle}</span>
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {results.length > 0 && <CommandSeparator />}

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem key={item.href} value={item.name} onSelect={() => handleSelect(item.href)}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
