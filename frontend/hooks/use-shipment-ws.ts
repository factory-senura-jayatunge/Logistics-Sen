import { useEffect, useRef, useState } from "react"

const WS_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
  /^http/,
  "ws"
)

interface ShipmentStatusUpdate {
  type: string
  shipment_id: number
  old_status: string
  new_status: string
  tracking_number: string
}

export function useShipmentWebSocket(shipmentId: number | null) {
  const [lastUpdate, setLastUpdate] = useState<ShipmentStatusUpdate | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!shipmentId) return

    function connect() {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/shipments/${shipmentId}`)

      ws.onopen = () => {
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const data: ShipmentStatusUpdate = JSON.parse(event.data)
          setLastUpdate(data)
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        reconnectTimeoutRef.current = setTimeout(connect, 5000)
      }

      ws.onerror = () => {
        ws.close()
      }

      wsRef.current = ws
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [shipmentId])

  return { lastUpdate, isConnected }
}
