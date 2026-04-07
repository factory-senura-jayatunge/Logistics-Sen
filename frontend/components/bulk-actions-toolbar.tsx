"use client"

import { useState } from "react"
import { Trash2, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BulkActionsToolbarProps {
  selectedCount: number
  onClearSelection: () => void
  onDelete: () => Promise<void>
  onUpdateStatus?: (status: string) => Promise<void>
  statusOptions?: { value: string; label: string }[]
  entityName: string
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onDelete,
  onUpdateStatus,
  statusOptions,
  entityName,
}: BulkActionsToolbarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete()
      onClearSelection()
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !onUpdateStatus) return
    setLoading(true)
    try {
      await onUpdateStatus(selectedStatus)
      onClearSelection()
      setSelectedStatus("")
    } finally {
      setLoading(false)
    }
  }

  if (selectedCount === 0) return null

  return (
    <>
      <div className="bg-muted/50 border-border flex items-center gap-3 rounded-lg border p-3">
        <span className="text-sm font-medium">
          {selectedCount} {entityName}
          {selectedCount === 1 ? "" : "s"} selected
        </span>

        <div className="bg-border h-4 w-px" />

        {onUpdateStatus && statusOptions && (
          <div className="flex items-center gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-8 w-36">
                <SelectValue placeholder="Set status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleStatusUpdate}
              disabled={!selectedStatus || loading}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Update
            </Button>
          </div>
        )}

        <Button
          size="sm"
          variant="destructive"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={loading}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Delete
        </Button>

        <div className="flex-1" />

        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedCount} {entityName}
              {selectedCount === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected{" "}
              {entityName.toLowerCase()}
              {selectedCount === 1 ? "" : "s"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
