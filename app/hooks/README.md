# Frontend Hooks

Custom React hooks for global state and infrastructure concerns.

## `useSocket.ts`

Manages a persistent Socket.IO connection to the backend. Automatically connects when a `storeId` is provided and joins that store's broadcast room.

```ts
const { socket, connected } = useSocket(storeId);
```

### Behaviour
- Connects to `http://localhost:8000` (configure via env for production)
- Attempts WebSocket first, falls back to long-polling
- Reconnects automatically up to 10 times with 1s delay
- Emits `join` with `storeId` immediately on connect/reconnect
- Returns `null` socket if `storeId` is not yet available

### Important: Stale Closure Pattern
Socket event handlers registered inside `useEffect` must **not** depend on reactive state that changes frequently (e.g., `activeOrder`). Instead, use a `useRef` to hold the latest value:

```ts
const activeOrderRef = useRef<string | null>(null);

// Sync ref with state
useEffect(() => {
  if (activeOrder?.orderId) activeOrderRef.current = activeOrder.orderId;
}, [activeOrder?.orderId]);

// Socket effect only re-runs when socket changes
useEffect(() => {
  if (!socket) return;
  socket.on("order:confirmed", (data) => {
    const id = activeOrderRef.current || localStorage.getItem("last_order_id");
    if (data.orderId !== id) return;
    // handle...
  });
  return () => { socket.off("order:confirmed"); };
}, [socket]); // ← NOT [socket, activeOrder]
```

This is especially critical on mobile where UPI redirects cause a page reload, disconnecting the socket. On reconnect, the effect re-registers handlers — but if `activeOrder` state was in the deps, it would be `null` at that moment and events would be silently dropped.
