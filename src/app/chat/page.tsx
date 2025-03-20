"use client"
import { useChat } from "@ai-sdk/react"

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto text-black">
      <div className="flex-1 space-y-4 mb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-lg ${m.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"} max-w-[80%]`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Send
        </button>
      </form>
    </div>
  )
}

