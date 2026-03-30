"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type CSVImportResult } from "@/lib/api"

interface CSVImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (file: File) => Promise<CSVImportResult>
  onSuccess: () => void
  entityName: string
  expectedColumns: string[]
}

export function CSVImportModal({
  open,
  onOpenChange,
  onImport,
  onSuccess,
  entityName,
  expectedColumns,
}: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CSVImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const parseCSVPreview = (content: string): string[][] => {
    const lines = content.split("\n").filter((line) => line.trim())
    return lines.slice(0, 6).map((line) => {
      const result: string[] = []
      let current = ""
      let inQuotes = false
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          result.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    })
  }

  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please select a CSV file")
      return
    }
    setFile(selectedFile)
    setError(null)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setPreview(parseCSVPreview(content))
    }
    reader.readAsText(selectedFile)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) handleFile(droppedFile)
    },
    [handleFile]
  )

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const importResult = await onImport(file)
      setResult(importResult)
      if (importResult.imported > 0) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setResult(null)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import {entityName}</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import {entityName.toLowerCase()}. Expected columns:{" "}
            <code className="text-xs">{expectedColumns.join(", ")}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {result && (
            <div
              className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                result.imported > 0
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Imported {result.imported}, skipped {result.skipped}
              {result.errors.length > 0 && (
                <span className="text-muted-foreground ml-2">
                  ({result.errors.length} errors)
                </span>
              )}
            </div>
          )}

          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
              <p className="text-muted-foreground mb-2">
                Drag and drop a CSV file here, or
              </p>
              <label>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) handleFile(selectedFile)
                  }}
                />
                <Button type="button" variant="secondary" asChild>
                  <span>Browse Files</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-muted/50 flex items-center gap-3 rounded-md p-3">
                <FileText className="text-muted-foreground h-5 w-5" />
                <span className="flex-1 text-sm font-medium">{file.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFile(null)
                    setPreview([])
                    setResult(null)
                  }}
                >
                  Remove
                </Button>
              </div>

              {preview.length > 0 && (
                <div className="rounded-md border">
                  <div className="text-muted-foreground border-b p-2 text-xs font-medium">
                    Preview (first {Math.min(preview.length - 1, 5)} rows)
                  </div>
                  <div className="max-h-48 overflow-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          {preview[0]?.map((header, i) => (
                            <th key={i} className="px-2 py-1 text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.slice(1).map((row, i) => (
                          <tr key={i} className="border-t">
                            {row.map((cell, j) => (
                              <td key={j} className="text-muted-foreground px-2 py-1">
                                {cell || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result?.errors && result.errors.length > 0 && (
                <div className="rounded-md border border-destructive/20">
                  <div className="text-destructive border-b border-destructive/20 p-2 text-xs font-medium">
                    Errors ({result.errors.length})
                  </div>
                  <div className="max-h-32 overflow-auto p-2 text-xs">
                    {result.errors.slice(0, 10).map((err, i) => (
                      <div key={i} className="text-muted-foreground">
                        Row {err.row}: {err.error}
                      </div>
                    ))}
                    {result.errors.length > 10 && (
                      <div className="text-muted-foreground mt-1">
                        ... and {result.errors.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? "Importing..." : "Import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
