import React, { useEffect, useRef } from "react";

export default function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-400">No messages yet</div>
      ) : (
        messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className="max-w-xs">
                <span className="text-xs text-gray-600">{msg.senderName || "Anonymous"}</span>
                <img
                  src={msg.gifUrl}
                  alt="GIF"
                  className="rounded-lg shadow-md mt-1"
                />
                <span className="text-xs text-gray-400 block">
                  {msg.timestamp?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
