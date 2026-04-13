"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronRight, Inbox } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getNotificationCountByCategory,
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "@/lib/api"

const notificationTypeColors: Record<string, string> = {
  info: "bg-info",
  warning: "bg-warning",
  error: "bg-destructive",
  success: "bg-success",
}

const categoryOptions = ["all", "inventory", "shipment", "order", "vehicle", "facility", "system"]
const typeOptions = ["all", "info", "warning", "error", "success"]

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}

function getNotificationUrl(notification: Notification): string | null {
  if (!notification.reference_type || !notification.reference_id) {
    return null
  }

  const urlMap: Record<string, string> = {
    shipment: `/shipments/${notification.reference_id}`,
    order: `/orders/${notification.reference_id}`,
    inventory: `/inventory/${notification.reference_id}`,
    vehicle: `/fleet/${notification.reference_id}`,
    facility: `/facilities/${notification.reference_id}`,
  }

  return urlMap[notification.reference_type] ?? null
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [readFilter, setReadFilter] = useState("all")

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const [notificationsData, unreadData, categoryCountData] = await Promise.all([
        getNotifications({
          category: categoryFilter === "all" ? undefined : categoryFilter,
          type: typeFilter === "all" ? undefined : typeFilter,
          unread_only: readFilter === "unread" ? true : undefined,
          read: readFilter === "read" ? true : undefined,
          limit: 200,
        }),
        getUnreadCount(),
        getNotificationCountByCategory(),
      ])

      setNotifications(notificationsData)
      setUnreadCount(unreadData.count)
      setCategoryCounts(categoryCountData)
      setError(null)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, readFilter, typeFilter])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId)
      await fetchNotifications()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update notification")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      await fetchNotifications()
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Failed to update notifications"
      )
    }
  }

  const categoryBadges = useMemo(
    () =>
      Object.entries(categoryCounts)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]),
    [categoryCounts]
  )

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Track low-stock alerts and operational updates</p>
        </div>
        <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
          <Check className="mr-2 h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Visible Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-16" /> : notifications.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Unread</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-16" /> : unreadCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Unread by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-8 flex-wrap gap-2">
            {loading ? (
              <Skeleton className="h-6 w-32" />
            ) : categoryBadges.length > 0 ? (
              categoryBadges.map(([category, count]) => (
                <Badge key={category} variant="outline">
                  {category} {count}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">No unread notifications</span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter by category, type, or read state</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All types" : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={readFilter} onValueChange={setReadFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Read status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All notifications</SelectItem>
              <SelectItem value="unread">Unread only</SelectItem>
              <SelectItem value="read">Read only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="text-destructive py-4 text-sm">{error}</CardContent>
        </Card>
      )}

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Notification Feed</CardTitle>
          <CardDescription>Newest notifications appear first</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-lg border p-4">
                <Skeleton className="mb-3 h-5 w-48" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-3 py-12 text-center">
              <Inbox className="h-10 w-10" />
              <div>
                <p className="font-medium">No notifications found</p>
                <p className="text-sm">Try adjusting your filters.</p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => {
              const targetUrl = getNotificationUrl(notification)

              return (
                <div
                  key={notification.id}
                  className="hover:bg-muted/50 flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 transition-colors"
                  onClick={() => {
                    if (targetUrl) {
                      router.push(targetUrl)
                    }
                  }}
                >
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div
                      className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${notificationTypeColors[notification.type] || "bg-primary"}`}
                    />
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`font-medium ${notification.read ? "text-muted-foreground" : ""}`}
                        >
                          {notification.title}
                        </p>
                        <Badge variant="outline">{notification.category}</Badge>
                        {!notification.read && <Badge variant="secondary">Unread</Badge>}
                      </div>
                      {notification.message && (
                        <p className="text-muted-foreground text-sm">{notification.message}</p>
                      )}
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <span>{formatTimeAgo(notification.created_at)}</span>
                        {targetUrl && (
                          <>
                            <span>•</span>
                            <span>Open record</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                      >
                        Mark as read
                      </Button>
                    )}
                    {targetUrl && <ChevronRight className="text-muted-foreground h-4 w-4" />}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
