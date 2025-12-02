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
import { createVehicle, updateVehicle, getFacilities, type Facility, type CreateVehicleData, type Vehicle } from "@/lib/api"

const VEHICLE_TYPES = [
  { value: "truck", label: "Truck" },
  { value: "ship", label: "Ship" },
  { value: "plane", label: "Aircraft" },
  { value: "train", label: "Train" },
]

const VEHICLE_STATUSES = [
  { value: "idle", label: "Idle" },
  { value: "en_route", label: "En Route" },
  { value: "loading", label: "Loading" },
  { value: "maintenance", label: "Maintenance" },
]

interface VehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  vehicle?: Vehicle | null
}

const getInitialFormData = (vehicle?: Vehicle | null): CreateVehicleData => ({
  vehicle_id: vehicle?.vehicle_id || "",
  name: vehicle?.name || "",
  type: vehicle?.type || "truck",
  driver: vehicle?.driver || "",
  facility_id: vehicle?.facility_id ?? undefined,
  current_location: vehicle?.current_location || "",
  destination: vehicle?.destination || "",
  status: vehicle?.status || "idle",
  fuel_level: vehicle?.fuel_level ?? 100,
})

export function VehicleModal({ open, onOpenChange, onSuccess, vehicle }: VehicleModalProps) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateVehicleData>(getInitialFormData(vehicle))

  const isEditing = !!vehicle

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData(vehicle))
      setError(null)
      getFacilities()
        .then(setFacilities)
        .catch((err) => setError(err.message))
    }
  }, [open, vehicle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.vehicle_id.trim()) {
      setError("Vehicle ID is required")
      return
    }
    if (!formData.name.trim()) {
      setError("Name is required")
      return
    }
    if (!formData.driver.trim()) {
      setError("Driver is required")
      return
    }
    if (!formData.current_location.trim()) {
      setError("Current location is required")
      return
    }

    try {
      setLoading(true)
      if (isEditing) {
        await updateVehicle(vehicle.id, formData)
      } else {
        await createVehicle(formData)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? "update" : "create"} vehicle`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
            <DialogDescription>
              {isEditing ? `Update the details for ${vehicle.vehicle_id}` : "Add a new vehicle to your fleet."}
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
                <Label htmlFor="vehicle_id">Vehicle ID</Label>
                <Input
                  id="vehicle_id"
                  placeholder="e.g., TRK-001"
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  disabled={isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Highway Runner"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type" className="w-full [&>span]:truncate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driver">Driver</Label>
                <Input
                  id="driver"
                  placeholder="Driver name"
                  value={formData.driver}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current_location">Current Location</Label>
                <Input
                  id="current_location"
                  placeholder="e.g., Los Angeles, CA"
                  value={formData.current_location}
                  onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="e.g., New York, NY"
                  value={formData.destination || ""}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value || undefined })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="facility">Facility</Label>
                <Select
                  value={formData.facility_id?.toString() || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, facility_id: value === "none" ? undefined : parseInt(value) })
                  }
                >
                  <SelectTrigger id="facility" className="w-full [&>span]:truncate">
                    <SelectValue placeholder="Select a facility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No facility</SelectItem>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id.toString()}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {VEHICLE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fuel_level">Fuel Level (%)</Label>
              <Input
                id="fuel_level"
                type="number"
                min="0"
                max="100"
                value={formData.fuel_level}
                onChange={(e) =>
                  setFormData({ ...formData, fuel_level: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Add Vehicle")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
