import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSocket, type MessageData, type OnlineUser } from '@/hooks/useSocket'
import { getUserIdFromToken} from '@/utils/auth'
import { userService } from '@services/userService'
import type { User } from '@/types'

interface ChatMessage extends MessageData {
  isOwn: boolean
  displayName: string
  formattedTime: string
}

interface ChatPanelProps {
  meetingId?: string
  onUsersOnlineChange?: (users: OnlineUser[]) => void
  onUserDirectoryChange?: (directory: Record<string, string>) => void
  isOpen?: boolean
  onClose?: () => void
}

export function ChatPanel({ 
  meetingId, 
  onUsersOnlineChange,
  onUserDirectoryChange,
  isOpen = true,
  onClose,
}: ChatPanelProps): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [usersOnline, setUsersOnline] = useState<OnlineUser[]>([])
  const [username, setUsername] = useState<string>('Usuario')
  const [userNames, setUserNames] = useState<Record<string, string>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const userNamesRef = useRef<Record<string, string>>({})
  const pendingFetchesRef = useRef<Set<string>>(new Set())

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

  useEffect(() => {
    usersOnline.forEach((user) => {
      void ensureUserName(user.userId)
    })
  }, [usersOnline, ensureUserName])

  useEffect(() => {
    if (userId && userNames[userId]) {
      setUsername(userNames[userId])
    }
  }, [userId, userNames])

  const formatTimestamp = useCallback((timestamp: number): string => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleUsersOnline = useCallback((users: OnlineUser[]) => {
    const filteredUsers =
      meetingId != null
        ? users.filter((user) => user.meetingId === meetingId)
        : users
    setUsersOnline(filteredUsers)
    onUsersOnlineChange?.(filteredUsers)
  }, [meetingId, onUsersOnlineChange])

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
  }, [userId, formatTimestamp, ensureUserName])

  const { sendMessage, isConnected } = useSocket(
    userId,
    meetingId,
    handleUsersOnline,
    handleReceiveMessage
  )

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

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
  }, [inputMessage, isConnected, userId, username, userNames, meetingId, sendMessage])

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[998] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel de chat */}
      <aside 
        className={`
          fixed md:relative top-0 right-0 bottom-0 z-[999]
          w-[85%] max-w-[400px] md:w-80 md:max-w-none
          bg-white border-l border-gray-200
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:transform-none
          shadow-[-2px_0_8px_rgba(0,0,0,0.15)] md:shadow-none
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
        aria-label="Chat grupal"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Chat grupal</h4>
            <button
              className="md:hidden p-1 text-gray-500 hover:text-gray-900 transition-colors"
              onClick={onClose}
              aria-label="Cerrar chat"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isConnected ? 'Conectado' : 'Desconectado'}
              aria-label={isConnected ? 'Conectado' : 'Desconectado'}
            />
            <span className="text-xs text-gray-500" aria-live="polite">
              {usersOnline.length} {usersOnline.length === 1 ? 'usuario' : 'usuarios'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col max-w-[85%] ${
                msg.isOwn ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span className="font-medium">{msg.displayName}</span>
                <span className="text-[0.7rem]">{msg.formattedTime}</span>
              </div>
              <p
                className={`inline-block px-3 py-2 rounded-lg ${
                  msg.isOwn
                    ? 'bg-[#cfe6e3] text-black'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.message}
              </p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="p-3 border-t border-gray-200 flex gap-2 items-center" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder={isConnected ? "Escribir mensaje..." : "Conectando..."}
            aria-label="Escribir mensaje"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!isConnected}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm
                     focus:outline-none focus:border-[#cfe6e3] disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            className="flex items-center justify-center min-w-[48px] min-h-[48px] p-3
                     bg-[#cfe6e3] rounded-md transition-colors
                     hover:bg-[#b8ddd9] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Enviar mensaje"
            title="Enviar"
            disabled={!isConnected || !inputMessage.trim()}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </aside>
    </>
  )
}
