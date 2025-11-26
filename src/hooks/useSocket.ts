import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { ENV } from '@/config/env'

const PRESENCE_SEPARATOR = '::'

function buildPresenceIdentifier(meetingId: string | undefined, userId: string | null): string | null {
  if (!userId) return null
  if (!meetingId) return userId
  return `${meetingId}${PRESENCE_SEPARATOR}${userId}`
}

function parsePresenceIdentifier(identifier: string): { meetingId?: string; actualUserId: string } {
  const separatorIndex = identifier.indexOf(PRESENCE_SEPARATOR)
  if (separatorIndex === -1) {
    return { actualUserId: identifier }
  }

  return {
    meetingId: identifier.slice(0, separatorIndex),
    actualUserId: identifier.slice(separatorIndex + PRESENCE_SEPARATOR.length),
  }
}

/**
 * Interface for online user
 */
export interface OnlineUser {
  socketId: string
  userId: string
  presenceId: string
  meetingId?: string
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
  meetingId: string | undefined,
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
      const presenceId = buildPresenceIdentifier(meetingId, userId)
      if (presenceId) {
        socket.emit('newUser', presenceId)
      }

      if (meetingId) {
      console.log("Joining room:", meetingId);
      socket.emit("joinRoom", meetingId);
  }

    })

    // Disconnection event
    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      isConnectedRef.current = false
      setIsConnected(false)
    })

    // Users online event - use ref to avoid dependency issues
    socket.on('usersOnline', (users: { socketId: string; userId: string }[]) => {
      console.log('Users online:', users)
      const parsedUsers: OnlineUser[] = users.map((user) => {
        const { meetingId: userMeetingId, actualUserId } = parsePresenceIdentifier(user.userId)
        return {
          socketId: user.socketId,
          presenceId: user.userId,
          userId: actualUserId,
          meetingId: userMeetingId,
        }
      })
      callbacksRef.current.onUsersOnline?.(parsedUsers)
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
  }, [userId, meetingId]) // Only depend on userId/meetingId, not callbacks

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

