"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, Check } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "@/lib/api"

const notificationTypeColors: Record<string, string> = {
  info: "bg-info",
  warning: "bg-warning",
  error: "bg-destructive",
  success: "bg-success",
}

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

function openCommandMenu() {
  const event = new KeyboardEvent("keydown", {
    key: "k",
    metaKey: true,
    bubbles: true,
  })
  document.dispatchEvent(event)
}

export function Header() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    async function fetchNotifications() {
      try {
        const [notifs, count] = await Promise.all([
          getNotifications({ limit: 10 }),
          getUnreadCount(),
        ])
        setNotifications(notifs)
        setUnreadCount(count.count)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }
    if (notification.reference_type && notification.reference_id) {
      const urlMap: Record<string, string> = {
        shipment: `/shipments/${notification.reference_id}`,
        order: `/orders/${notification.reference_id}`,
        inventory: `/inventory/${notification.reference_id}`,
        vehicle: `/fleet/${notification.reference_id}`,
        facility: `/facilities/${notification.reference_id}`,
      }
      const url = urlMap[notification.reference_type]
      if (url) router.push(url)
    }
  }

  return (
    <header className="bg-background flex h-14 items-center gap-4 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1">
        <Button
          variant="outline"
          className="text-muted-foreground relative h-9 w-full max-w-md justify-start text-sm"
          onClick={openCommandMenu}
        >
          <Search className="mr-2 h-4 w-4" />
          <span>Search...</span>
          <kbd className="bg-muted pointer-events-none absolute right-2 hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96">
          <div className="flex items-center justify-between px-2">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={handleMarkAllAsRead}
              >
                <Check className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center text-sm">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex cursor-pointer flex-col items-start gap-1 p-3"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full items-center gap-2">
                  {!notification.read && (
                    <div
                      className={`h-2 w-2 rounded-full ${notificationTypeColors[notification.type] || "bg-primary"}`}
                    />
                  )}
                  <span
                    className={`flex-1 text-sm font-medium ${notification.read ? "text-muted-foreground" : ""}`}
                  >
                    {notification.title}
                  </span>
                </div>
                {notification.message && (
                  <p className="text-muted-foreground line-clamp-2 pl-4 text-xs">
                    {notification.message}
                  </p>
                )}
                <span className="text-muted-foreground pl-4 text-xs">
                  {formatTimeAgo(notification.created_at)}
                </span>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-muted-foreground justify-center text-sm">
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
