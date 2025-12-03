import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSocket, type MessageData, type OnlineUser } from '@/hooks/useSocket'
import { getUserIdFromToken} from '@/utils/auth'
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

        

      })()
    }
  }, [userId, buildDisplayName])

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

    if (senderId) {
    void ensureUserName(senderId)
  }

  const displayName =
  (senderId && userNamesRef.current[senderId]) ||
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
      username: userId ? userNames[userId] : username,


      timestamp: Date.now(),
      roomId: meetingId,
    }

    sendMessage(messageData)
    setInputMessage('')
  }, [inputMessage, isConnected, userId, username, meetingId, sendMessage])

  return (
    <aside className="meeting-chat flex flex-col h-full w-full" aria-label="Chat grupal">
      <div className="chat-header p-3 border-b flex items-center justify-between">
        <h4 className="text-sm font-medium">Chat grupal</h4>
        <div className="chat-status flex items-center gap-2">
          <span
            className={`status-indicator inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-400'}`}
            title={isConnected ? 'Conectado' : 'Desconectado'}
            aria-label={isConnected ? 'Conectado' : 'Desconectado'}
          />
          <span className="users-count text-xs text-gray-600" aria-live="polite">
            {usersOnline.length} {usersOnline.length === 1 ? 'usuario' : 'usuarios'}
          </span>
        </div>
      </div>

      <div className="chat-box p-3 overflow-auto flex-1 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message max-w-full break-words ${msg.isOwn ? 'self-end text-right' : 'self-start'}`}
          >
            <div className="message-header flex items-center justify-between text-xs text-gray-500">
              <span className="message-username font-medium">{msg.displayName}</span>
              <span className="message-time ml-2">{msg.formattedTime}</span>
            </div>
            <p className={`message-content mt-1 inline-block px-3 py-2 rounded-lg ${msg.isOwn ? 'bg-[#cfe6e3] text-black' : 'bg-gray-100 text-gray-800'}`}>
              {msg.message}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input p-3 border-t flex gap-2 items-center" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder={isConnected ? "Escribir mensaje..." : "Conectando..."}
          aria-label="Escribir mensaje"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={!isConnected}
          className="flex-1 px-3 py-2 border rounded-md text-sm disabled:opacity-60"
        />
        <button
          type="submit"
          className="chat-send px-3 py-2 bg-[#cfe6e3] rounded-md text-sm disabled:opacity-50"
          aria-label="Enviar mensaje"
          title="Enviar"
          disabled={!isConnected || !inputMessage.trim()}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </aside>
  )
}
