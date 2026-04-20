import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Replace with your actual Hugging Face Space URL
// Note: Use https://, socket.io-client will automatically switch to wss://
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-username-your-space.hf.space';

export function useSocket(storeId?: string) {
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!storeId) return;

        // Hugging Face Proxy requirements:
        const socket = io(SOCKET_URL, {
            // HF Spaces works best when it can negotiate protocols
            transports: ['websocket'], 
            // Crucial for cross-domain cookies/auth if using Better Auth
            withCredentials: true,
            // Standard reconnection settings
            reconnectionAttempts: 10,
            // Ensure path is default unless you changed it in Elysia
            path: '/socket.io/', 
        });

        socket.on('connect', () => {
            console.log('✅ Connected to HF Space Socket:', socket.id);
            setConnected(true);
            socket.emit('join', storeId);
        });

        socket.on('connect_error', (err) => {
            console.error('❌ Connection Error:', err.message);
            // If websocket fails, try falling back to polling automatically
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