import { describe, it, expect, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import { ButtonGroup, ButtonGroupText, ButtonGroupSeparator } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

describe("Tabs", () => {
  it("renders tabs with content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    )
    expect(screen.getByText("Tab 1")).toBeInTheDocument()
    expect(screen.getByText("Tab 2")).toBeInTheDocument()
    expect(screen.getByText("Content 1")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(
      <Tabs defaultValue="a" className="custom-tabs">
        <TabsList className="custom-list">
          <TabsTrigger value="a" className="custom-trigger">
            A
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="custom-content">
          Content
        </TabsContent>
      </Tabs>,
    )
    expect(screen.getByText("A")).toBeInTheDocument()
  })
})

describe("Progress", () => {
  it("renders with value", () => {
    const { container } = render(<Progress value={50} />)
    expect(container.querySelector("[data-slot='progress']")).toBeInTheDocument()
  })

  it("renders with zero value", () => {
    const { container } = render(<Progress value={0} />)
    expect(container.querySelector("[data-slot='progress']")).toBeInTheDocument()
  })

  it("renders without value (undefined)", () => {
    const { container } = render(<Progress />)
    expect(container.querySelector("[data-slot='progress']")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(<Progress value={75} className="h-4" />)
    expect(container.querySelector("[data-slot='progress']")).toBeInTheDocument()
  })
})

describe("Tooltip", () => {
  it("renders trigger", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(screen.getByText("Hover me")).toBeInTheDocument()
  })
})

describe("Label", () => {
  it("renders label text", () => {
    render(<Label>Name</Label>)
    expect(screen.getByText("Name")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<Label className="text-red-500">Error</Label>)
    expect(screen.getByText("Error")).toBeInTheDocument()
  })
})

describe("Separator", () => {
  it("renders horizontal separator", () => {
    const { container } = render(<Separator />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it("renders vertical separator", () => {
    const { container } = render(<Separator orientation="vertical" />)
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe("Dialog", () => {
  it("renders dialog trigger", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
      </Dialog>,
    )
    expect(screen.getByText("Open")).toBeInTheDocument()
  })
})

describe("DropdownMenu", () => {
  it("renders trigger", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
      </DropdownMenu>,
    )
    expect(screen.getByText("Menu")).toBeInTheDocument()
  })

  it("renders open dropdown with items", () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByText("Actions")).toBeInTheDocument()
    expect(screen.getByText("Edit")).toBeInTheDocument()
    expect(screen.getByText("Delete")).toBeInTheDocument()
  })

  it("renders dropdown item with inset", () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByText("Inset Item")).toBeInTheDocument()
  })

  it("renders dropdown label with inset", () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByText("Inset Label")).toBeInTheDocument()
  })

  it("renders with custom classNames", () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem className="text-red-500">Custom</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByText("Custom")).toBeInTheDocument()
  })
})

describe("Select", () => {
  it("renders select trigger", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
      </Select>,
    )
    expect(screen.getByText("Pick one")).toBeInTheDocument()
  })

  it("renders with custom className", () => {
    render(
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>,
    )
    expect(screen.getByText("Select")).toBeInTheDocument()
  })
})

describe("Sheet", () => {
  it("renders sheet trigger", () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
      </Sheet>,
    )
    expect(screen.getByText("Open Sheet")).toBeInTheDocument()
  })

  it("renders open sheet with content", () => {
    render(
      <Sheet open={true}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <div>Sheet body</div>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    )
    expect(screen.getByText("Sheet Title")).toBeInTheDocument()
    expect(screen.getByText("Sheet body")).toBeInTheDocument()
  })

  it("renders sheet with side=left", () => {
    render(
      <Sheet open={true}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Left Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    )
    expect(screen.getByText("Left Sheet")).toBeInTheDocument()
  })

  it("renders sheet with side=top", () => {
    render(
      <Sheet open={true}>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Top Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    )
    expect(screen.getByText("Top Sheet")).toBeInTheDocument()
  })

  it("renders sheet with side=bottom", () => {
    render(
      <Sheet open={true}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Bottom Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    )
    expect(screen.getByText("Bottom Sheet")).toBeInTheDocument()
  })
})

describe("Dialog extended", () => {
  it("renders dialog without close button", () => {
    render(
      <Dialog open={true}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>No Close</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByText("No Close")).toBeInTheDocument()
  })

  it("renders open dialog with all parts", () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My Dialog</DialogTitle>
            <DialogDescription>Some description</DialogDescription>
          </DialogHeader>
          <div>Dialog body</div>
          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByText("My Dialog")).toBeInTheDocument()
    expect(screen.getByText("Some description")).toBeInTheDocument()
    expect(screen.getByText("Dialog body")).toBeInTheDocument()
  })
})

// Polyfill for cmdk
beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof globalThis.ResizeObserver
  }
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {})
})

describe("Command", () => {
  it("renders command with input and items", () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Item 1</CommandItem>
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="More">
            <CommandItem>Item 3</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument()
    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.getByText("Suggestions")).toBeInTheDocument()
  })

  it("renders command with custom className", () => {
    render(
      <Command className="rounded-lg border">
        <CommandInput placeholder="Type..." />
        <CommandList>
          <CommandEmpty>Nothing found</CommandEmpty>
        </CommandList>
      </Command>,
    )
    expect(screen.getByPlaceholderText("Type...")).toBeInTheDocument()
  })
})

describe("ButtonGroup", () => {
  it("renders horizontal group", () => {
    render(
      <ButtonGroup orientation="horizontal">
        <Button>A</Button>
        <ButtonGroupSeparator />
        <Button>B</Button>
      </ButtonGroup>,
    )
    expect(screen.getByText("A")).toBeInTheDocument()
    expect(screen.getByText("B")).toBeInTheDocument()
  })

  it("renders vertical group", () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>X</Button>
        <Button>Y</Button>
      </ButtonGroup>,
    )
    expect(screen.getByText("X")).toBeInTheDocument()
  })

  it("renders ButtonGroupText", () => {
    render(
      <ButtonGroup>
        <ButtonGroupText>Label</ButtonGroupText>
      </ButtonGroup>,
    )
    expect(screen.getByText("Label")).toBeInTheDocument()
  })

  it("renders ButtonGroupText with asChild", () => {
    render(
      <ButtonGroup>
        <ButtonGroupText asChild>
          <span>AsChild</span>
        </ButtonGroupText>
      </ButtonGroup>,
    )
    expect(screen.getByText("AsChild")).toBeInTheDocument()
  })

  it("renders ButtonGroupSeparator with horizontal orientation", () => {
    const { container } = render(
      <ButtonGroup>
        <ButtonGroupSeparator orientation="horizontal" />
      </ButtonGroup>,
    )
    expect(container.querySelector("[data-slot='button-group-separator']")).toBeInTheDocument()
  })
})

describe("Button", () => {
  it("renders with default variant", () => {
    render(<Button>Click</Button>)
    expect(screen.getByText("Click")).toBeInTheDocument()
  })

  it("renders with outline variant", () => {
    render(<Button variant="outline">Outline</Button>)
    expect(screen.getByText("Outline")).toBeInTheDocument()
  })

  it("renders with ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByText("Ghost")).toBeInTheDocument()
  })

  it("renders with destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByText("Delete")).toBeInTheDocument()
  })

  it("renders with different sizes", () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByText("Small")).toBeInTheDocument()
  })

  it("renders with lg size", () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByText("Large")).toBeInTheDocument()
  })

  it("renders with icon size", () => {
    render(<Button size="icon">X</Button>)
    expect(screen.getByText("X")).toBeInTheDocument()
  })

  it("renders with link variant", () => {
    render(<Button variant="link">Link</Button>)
    expect(screen.getByText("Link")).toBeInTheDocument()
  })

  it("renders with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByText("Secondary")).toBeInTheDocument()
  })

  it("renders as child with asChild", () => {
    render(
      <Button asChild>
        <a href="#">Link Button</a>
      </Button>,
    )
    expect(screen.getByText("Link Button")).toBeInTheDocument()
  })
})

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Status</Badge>)
    expect(screen.getByText("Status")).toBeInTheDocument()
  })

  it("renders with outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText("Outline")).toBeInTheDocument()
  })

  it("renders with secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText("Secondary")).toBeInTheDocument()
  })

  it("renders with destructive variant", () => {
    render(<Badge variant="destructive">Error</Badge>)
    expect(screen.getByText("Error")).toBeInTheDocument()
  })
})

describe("Checkbox", () => {
  it("renders unchecked checkbox", () => {
    const { container } = render(<Checkbox />)
    expect(container.querySelector("[data-slot='checkbox']")).toBeInTheDocument()
  })

  it("renders with className", () => {
    const { container } = render(<Checkbox className="custom" />)
    expect(container.querySelector("[data-slot='checkbox']")).toBeInTheDocument()
  })
})

describe("AlertDialog", () => {
  it("renders trigger", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
      </AlertDialog>,
    )
    expect(screen.getByText("Delete")).toBeInTheDocument()
  })

  it("renders open alert dialog with all parts", () => {
    render(
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    expect(screen.getByText("Are you sure?")).toBeInTheDocument()
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument()
    expect(screen.getByText("Cancel")).toBeInTheDocument()
    expect(screen.getByText("Continue")).toBeInTheDocument()
  })
})

describe("Input", () => {
  it("renders input", () => {
    render(<Input placeholder="Type here" />)
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument()
  })

  it("renders with type", () => {
    render(<Input type="password" placeholder="Password" />)
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument()
  })

  it("renders with className", () => {
    render(<Input className="w-full" placeholder="Full" />)
    expect(screen.getByPlaceholderText("Full")).toBeInTheDocument()
  })
})

describe("Card", () => {
  it("renders all card parts", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )
    expect(screen.getByText("Title")).toBeInTheDocument()
    expect(screen.getByText("Description")).toBeInTheDocument()
    expect(screen.getByText("Body")).toBeInTheDocument()
    expect(screen.getByText("Footer")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(
      <Card className="custom-card">
        <CardContent>Content</CardContent>
      </Card>,
    )
    expect(screen.getByText("Content")).toBeInTheDocument()
  })
})
