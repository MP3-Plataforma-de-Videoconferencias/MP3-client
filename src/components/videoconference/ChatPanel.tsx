/**
 * Chat panel component
 * Displays the chat interface for the video conference
 * Note: This is a placeholder component without functionality as per requirements
 * @param meetingId - Meeting ID
 * @returns {JSX.Element} Chat panel component
 */
export function ChatPanel({ meetingId }: { meetingId: string }): JSX.Element {
  return (
    <div className="bg-white shadow-md rounded p-4 h-96 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      <div className="flex-grow border rounded p-4 mb-4 overflow-y-auto">
        <p className="text-gray-500 text-center">Chat functionality coming soon</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          disabled
          className="flex-grow px-4 py-2 border rounded"
        />
        <button disabled className="bg-blue-600 text-white px-4 py-2 rounded opacity-50 cursor-not-allowed">
          Send
        </button>
      </div>
    </div>
  )
}

