from fastapi import WebSocket
from typing import Dict, Set
import json
import asyncio


class ConnectionManager:
    """Manages WebSocket connections for real-time shipment tracking."""

    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, shipment_id: int):
        await websocket.accept()
        if shipment_id not in self.active_connections:
            self.active_connections[shipment_id] = set()
        self.active_connections[shipment_id].add(websocket)

    def disconnect(self, websocket: WebSocket, shipment_id: int):
        if shipment_id in self.active_connections:
            self.active_connections[shipment_id].discard(websocket)
            if not self.active_connections[shipment_id]:
                del self.active_connections[shipment_id]

    async def broadcast_status_update(self, shipment_id: int, data: dict):
        if shipment_id in self.active_connections:
            message = json.dumps(data)
            disconnected = set()
            for connection in self.active_connections[shipment_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    disconnected.add(connection)
            for conn in disconnected:
                self.disconnect(conn, shipment_id)

    async def broadcast_global(self, data: dict):
        message = json.dumps(data)
        disconnected_pairs = []
        for shipment_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_text(message)
                except Exception:
                    disconnected_pairs.append((connection, shipment_id))
        for conn, sid in disconnected_pairs:
            self.disconnect(conn, sid)


ws_manager = ConnectionManager()
