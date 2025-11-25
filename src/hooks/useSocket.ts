import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { ENV } from '@/config/env'

/**
 * Interface for online user
 */
export interface OnlineUser {
  socketId: string
  userId: string
}

/**
 * Interface for message data
 */
export interface MessageData {
  message: string
  userId?: string
  username?: string
  timestamp?: number
  roomId?: string
}

/**
 * Hook to manage Socket.IO connection
 * @param userId - User ID to identify the user in the socket connection
 * @param onUsersOnline - Callback when users online list is received
 * @param onReceiveMessage - Callback when a message is received
 * @returns Socket instance and helper functions
 */
export function useSocket(
  userId: string | null,
  onUsersOnline?: (users: OnlineUser[]) => void,
  onReceiveMessage?: (messageData: MessageData) => void
) {
  const socketRef = useRef<Socket | null>(null)
  const isConnectedRef = useRef(false)
  const callbacksRef = useRef({ onUsersOnline, onReceiveMessage })
  const [isConnected, setIsConnected] = useState(false)

  // Update callbacks ref when they change (without causing reconnection)
  useEffect(() => {
    callbacksRef.current = { onUsersOnline, onReceiveMessage }
  }, [onUsersOnline, onReceiveMessage])

  useEffect(() => {
    if (!userId) {
      return
    }

    // Create socket connection
    const socket = io(ENV.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    // Connection event
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      isConnectedRef.current = true
      setIsConnected(true)

      // Emit newUser event when connected
      socket.emit('newUser', userId)
    })

    // Disconnection event
    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      isConnectedRef.current = false
      setIsConnected(false)
    })

    // Users online event - use ref to avoid dependency issues
    socket.on('usersOnline', (users: OnlineUser[]) => {
      console.log('Users online:', users)
      callbacksRef.current.onUsersOnline?.(users)
    })

    // Receive message event - use ref to avoid dependency issues
    socket.on('receiveMessage', (messageData: MessageData) => {
      console.log('Message received:', messageData)
      callbacksRef.current.onReceiveMessage?.(messageData)
    })

    // Error handling
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      isConnectedRef.current = false
      setIsConnected(false)
    }
  }, [userId]) // Only depend on userId, not callbacks

  /**
   * Send a message through the socket - memoized
   */
  const sendMessage = useCallback((messageData: MessageData) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit('sendMessage', {
        ...messageData,
        timestamp: messageData.timestamp || Date.now(),
      })
    } else {
      console.warn('Socket not connected, cannot send message')
    }
  }, [])

  return {
    socket: socketRef.current,
    sendMessage,
    isConnected,
  }
}

