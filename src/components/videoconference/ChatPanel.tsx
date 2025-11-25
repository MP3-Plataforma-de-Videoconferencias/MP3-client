import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSocket, type MessageData, type OnlineUser } from '@/hooks/useSocket'
import { getUserIdFromToken, getUserDisplayName } from '@/utils/auth'
import { userService } from '@services/userService'
import type { User } from '@/types'

/**
 * Interface for chat message with display properties
 */
interface ChatMessage extends MessageData {
  isOwn: boolean
  displayName: string
  formattedTime: string
}

/**
 * Chat panel component with Socket.IO integration
 * Displays real-time chat interface for video conference
 * @param meetingId - Meeting ID (optional, for future room-based chat)
 * @param onUsersOnlineChange - Callback when users online list changes
 * @returns {JSX.Element} Chat panel component
 */
export function ChatPanel({ 
  meetingId, 
  onUsersOnlineChange,
  onUserDirectoryChange,
}: { 
  meetingId?: string
  onUsersOnlineChange?: (users: OnlineUser[]) => void 
  onUserDirectoryChange?: (directory: Record<string, string>) => void
}): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [usersOnline, setUsersOnline] = useState<OnlineUser[]>([])
  const [username, setUsername] = useState<string>('Usuario')
  const [userNames, setUserNames] = useState<Record<string, string>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const userNamesRef = useRef<Record<string, string>>({})
  const pendingFetchesRef = useRef<Set<string>>(new Set())

  // Memoize userId and userDisplayName to avoid recalculating on every render
  const userId = useMemo(() => getUserIdFromToken(), [])
  const fallbackUserEmail = useMemo(() => getUserDisplayName(), [])

  useEffect(() => {
    userNamesRef.current = userNames
    onUserDirectoryChange?.(userNames)
  }, [userNames, onUserDirectoryChange])

  const buildDisplayName = useCallback((user: Partial<User>): string => {
    const first = user.firstName?.trim()
    const last = user.lastName?.trim()
    const fullName = [first, last].filter(Boolean).join(' ').trim()
    if (fullName) {
      return fullName
    }
    if (user.email) {
      return user.email.split('@')[0]
    }
    return 'Usuario'
  }, [])

  const ensureUserName = useCallback(async (id?: string | null) => {
    if (!id || userNamesRef.current[id] || pendingFetchesRef.current.has(id)) {
      return
    }
    pendingFetchesRef.current.add(id)
    try {
      const response = await userService.getById(id)
      if (response.data) {
        const fullName = buildDisplayName(response.data)
        setUserNames((prev) => ({ ...prev, [id]: fullName }))
        return
      }
    } catch (error) {
      console.error('Error fetching user name:', error)
    } finally {
      pendingFetchesRef.current.delete(id)
    }
  }, [buildDisplayName])

  // Load current user name once
  useEffect(() => {
    if (userId && !userNamesRef.current[userId]) {
      void (async () => {
        try {
          const response = await userService.getProfile()
          if (response.data) {
            const fullName = buildDisplayName(response.data)
            setUserNames((prev) => ({ ...prev, [userId]: fullName }))
            setUsername(fullName)
            return
          }
        } catch (error) {
          console.error('Error loading current user profile:', error)
        }

        if (fallbackUserEmail) {
          const fallbackName = fallbackUserEmail.split('@')[0]
          setUserNames((prev) => ({ ...prev, [userId]: fallbackName }))
          setUsername(fallbackName)
        }
      })()
    }
  }, [userId, fallbackUserEmail, buildDisplayName])

  // Ensure we have names for online users
  useEffect(() => {
    usersOnline.forEach((user) => {
      void ensureUserName(user.userId)
    })
  }, [usersOnline, ensureUserName])

  // Update username when we have a better display name
  useEffect(() => {
    if (userId && userNames[userId]) {
      setUsername(userNames[userId])
    }
  }, [userId, userNames])

  /**
   * Formats timestamp to readable time
   */
  const formatTimestamp = useCallback((timestamp: number): string => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }, [])

  /**
   * Scrolls chat box to bottom
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Handle users online update - memoized with useCallback
  const handleUsersOnline = useCallback((users: OnlineUser[]) => {
    const filteredUsers =
      meetingId != null
        ? users.filter((user) => user.meetingId === meetingId)
        : users
    setUsersOnline(filteredUsers)
    onUsersOnlineChange?.(filteredUsers)
  }, [meetingId, onUsersOnlineChange])

  // Handle incoming messages - memoized with useCallback
  const handleReceiveMessage = useCallback((messageData: MessageData) => {
    if (meetingId && messageData.roomId && messageData.roomId !== meetingId) {
      return
    }

    const senderId = messageData.userId
    const isOwn = senderId === userId

    if (senderId && messageData.username) {
      setUserNames((prev) => {
        if (prev[senderId]) {
          return prev
        }
        return { ...prev, [senderId]: messageData.username as string }
      })
    } else if (senderId) {
      void ensureUserName(senderId)
    }

    const displayName =
      (senderId && userNamesRef.current[senderId]) ||
      messageData.username ||
      senderId ||
      'Usuario'
    const timestamp = messageData.timestamp || Date.now()
    
    const newMessage: ChatMessage = {
      ...messageData,
      isOwn,
      displayName,
      formattedTime: formatTimestamp(timestamp),
    }

    setMessages((prev) => [...prev, newMessage])
  }, [userId, formatTimestamp])

  // Initialize socket connection
  const { sendMessage, isConnected } = useSocket(
    userId,
    meetingId,
    handleUsersOnline,
    handleReceiveMessage
  )

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  /**
   * Handles message submission - memoized with useCallback
   */
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || !isConnected) {
      return
    }

    const messageData: MessageData = {
      message: inputMessage.trim(),
      userId: userId || undefined,
      username: username,
      timestamp: Date.now(),
      roomId: meetingId,
    }

    sendMessage(messageData)
    setInputMessage('')
  }, [inputMessage, isConnected, userId, username, meetingId, sendMessage])

  return (
    <aside className="meeting-chat" aria-label="Chat grupal">
      <div className="chat-header">
        <h4>Chat grupal</h4>
        <div className="chat-status">
          <span
            className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}
            title={isConnected ? 'Conectado' : 'Desconectado'}
            aria-label={isConnected ? 'Conectado' : 'Desconectado'}
          />
          <span className="users-count" aria-live="polite">
            {usersOnline.length} {usersOnline.length === 1 ? 'usuario' : 'usuarios'} conectado{usersOnline.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.isOwn ? 'own-message' : 'other-message'}`}
          >
            <div className="message-header">
              <span className="message-username">{msg.displayName}</span>
              <span className="message-time">{msg.formattedTime}</span>
            </div>
            <p className="message-content">{msg.message}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder={isConnected ? "Escribir mensaje..." : "Conectando..."}
          aria-label="Escribir mensaje"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={!isConnected}
          className={!isConnected ? 'disabled' : ''}
        />
        <button
          type="submit"
          className="chat-send"
          aria-label="Enviar mensaje"
          title="Enviar"
          disabled={!isConnected || !inputMessage.trim()}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </aside>
  )
}
