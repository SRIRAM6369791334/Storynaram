'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getApiBaseUrl } from '@/utils/api-url';

export function useRealtime(storyId?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${getApiBaseUrl()}/events`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (storyId) {
        socket.emit('subscribe', { channel: `story:${storyId}` });
      }
    });

    return () => {
      if (storyId) {
        socket.emit('unsubscribe', { channel: `story:${storyId}` });
      }
      socket.disconnect();
    };
  }, [storyId]);

  const onEvent = useCallback((event: string, handler: (data: unknown) => void) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { onEvent, emit, socket: socketRef.current };
}
