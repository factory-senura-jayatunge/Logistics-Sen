"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateInventoryItem, getFacilities, type InventoryItem, type Facility, type UpdateInventoryItemData } from "@/lib/api"

interface EditInventoryItemModalProps {
  item: InventoryItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (updatedItem: InventoryItem) => void
}

export function EditInventoryItemModal({ item, open, onOpenChange, onSuccess }: EditInventoryItemModalProps) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<UpdateInventoryItemData>({
    sku: item.sku,
    name: item.name,
    category: item.category,
    facility_id: item.facility_id,
    quantity: item.quantity,
    reorder_point: item.reorder_point,
    unit_price: item.unit_price,
    status: item.status,
  })

  useEffect(() => {
    if (open) {
      setFormData({
        sku: item.sku,
        name: item.name,
        category: item.category,
        facility_id: item.facility_id,
        quantity: item.quantity,
        reorder_point: item.reorder_point,
        unit_price: item.unit_price,
        status: item.status,
      })
      setError(null)
      getFacilities()
        .then(setFacilities)
        .catch((err) => setError(err.message))
    }
  }, [open, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError("Name is required")
      return
    }
    if (!formData.sku.trim()) {
      setError("SKU is required")
      return
    }
    if (!formData.category.trim()) {
      setError("Category is required")
      return
    }
    if (formData.quantity < 0) {
      setError("Quantity cannot be negative")
      return
    }
    if (formData.unit_price < 0) {
      setError("Unit price cannot be negative")
      return
    }

    try {
      setLoading(true)
      const updatedItem = await updateInventoryItem(item.id, formData)
      onSuccess(updatedItem)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details for {item.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="facility">Facility</Label>
                <Select
                  value={formData.facility_id.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, facility_id: parseInt(value) })
                  }
                >
                  <SelectTrigger id="facility" className="w-full [&>span]:truncate">
                    <SelectValue placeholder="Select a facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id.toString()}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reorder_point">Reorder Point</Label>
                <Input
                  id="reorder_point"
                  type="number"
                  min="0"
                  value={formData.reorder_point}
                  onChange={(e) =>
                    setFormData({ ...formData, reorder_point: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unit_price">Unit Price ($)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status" className="w-full [&>span]:truncate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
