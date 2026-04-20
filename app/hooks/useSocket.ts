import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

/**
 * Custom React hook for managing a Socket.IO connection.
 * Automatically connects to the backend and joins the specified store's room.
 *
 * @param storeId The ID of the store room to join.
 * @returns Object containing the active socket instance and connection status.
 */
export function useSocket(storeId?: string) {
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!storeId) return;

        // Initialize connection with robust fallback options
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setConnected(true);
            socket.emit('join', storeId);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
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
