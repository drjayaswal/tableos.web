import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * The backend WebSocket server URL.
 * Set NEXT_PUBLIC_SOCKET_URL in your .env for production deployments.
 * Falls back to localhost for local development.
 */
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

/**
 * Custom hook that manages a persistent Socket.IO connection.
 *
 * - Connects immediately when `storeId` is provided.
 * - Emits `join` to enter the store's broadcast room on connect AND reconnect.
 * - Falls back from WebSocket to polling if the initial WS connection fails.
 * - Auto-reconnects up to 10 times on drop (e.g. after mobile UPI redirect).
 *
 * @param storeId  The store room to join. Pass `undefined` to stay disconnected.
 * @returns `{ socket, connected }` — `socket` is null until connected.
 */
export function useSocket(storeId?: string) {
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!storeId) return;

        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            path: '/socket.io/',
        });

        socket.on('connect', () => {
            setConnected(true);
            // Re-join room on every connect/reconnect so events reach this client
            socket.emit('join', storeId);
        });

        socket.on('connect_error', () => {
            // Upgrade to polling fallback if WebSocket handshake fails (common behind proxies)
            socket.io.opts.transports = ['polling', 'websocket'];
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [storeId]);

    return {
        socket: socketRef.current,
        connected
    };
}