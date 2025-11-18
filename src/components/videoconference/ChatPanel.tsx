/**
 * Chat panel component
 * Displays the chat interface for the video conference
 * Note: This is a placeholder component without functionality as per requirements
 * @param meetingId - Meeting ID
 * @returns {JSX.Element} Chat panel component
 */
import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export function ChatPanel({ meetingId }: { meetingId: string }): JSX.Element | null {
  const elRef = useRef<HTMLDivElement | null>(null)

  if (!elRef.current) {
    elRef.current = document.createElement('div')
  }

  useEffect(() => {
    const el = elRef.current!
    document.body.appendChild(el)
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el)
    }
  }, [])

  const chat = (
    <div className="meeting-chat" role="complementary" aria-label="Chat grupal">
      <h4>Chat grupal</h4>
      <div className="chat-box">
        <p><b>Salomé:</b> Buenos días</p>
        <p><b>TeamBot:</b> ¡Hola! 😊 Buenos días</p>
      </div>
      <input placeholder="Escribir mensaje..." />
    </div>
  )

  return createPortal(chat, elRef.current)
}

