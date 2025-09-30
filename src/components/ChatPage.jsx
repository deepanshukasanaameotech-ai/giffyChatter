// src/components/ChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { playSound } from "../utils/playSound";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

// MessageList Component
const MessageList = ({ messages, currentUserId, userInteracted }) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
  // Scroll instantly to the latest message on page load
  messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
}, [messages]);

  // Play sound for incoming messages
  useEffect(() => {
    if (userInteracted && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId !== currentUserId) {
        playSound("./sounds/receive.mp3");
      }
    }
  }, [messages, currentUserId, userInteracted]);

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this GIF?")) return;
    try {
      await deleteDoc(doc(db, "messages", messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 mt-8">
          <p className="text-lg">No messages yet</p>
          <p className="text-sm">Search for a GIF to start chatting!</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs flex flex-col ${
                  isOwn ? "items-end" : "items-start"
                } relative`}
              >
                <span
                  className={`text-xs font-medium mb-1 ${
                    isOwn ? "text-purple-600" : "text-gray-600"
                  }`}
                >
                  {msg.senderName || "Anonymous"}
                </span>

                <img
                  src={msg.gifUrl}
                  alt="GIF"
                  className="rounded-lg max-w-[180px] max-h-[180px] object-cover"
                />

                {isOwn && (
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="absolute top-5 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}

                <span className="text-xs text-gray-400 mt-1">
                  {msg.timestamp?.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

// ChatPage Component
const ChatPage = ({ user, onSignOut }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const TENOR_API_KEY = "AIzaSyAmheJsU5I7uaTFn0DOoVUklS__jxef0Fc";

  // Track user interaction
  useEffect(() => {
    const handleInteraction = () => setUserInteracted(true);
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Firestore listener
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) =>
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => unsubscribe();
  }, []);

  // Search GIFs from Tenor
  const searchGifs = async (queryStr) => {
    if (!queryStr.trim()) {
      setGifs([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
          queryStr
        )}&key=${TENOR_API_KEY}&limit=12`
      );
      const data = await res.json();
      setGifs(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Send GIF message
  const sendGif = async (gifUrl) => {
    await addDoc(collection(db, "messages"), {
      senderId: user.uid,
      senderName: user.email,
      gifUrl,
      timestamp: serverTimestamp(),
    });

    if (userInteracted) playSound("./sounds/send.mp3");
    setSearchQuery("");
    setGifs([]);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    searchGifs(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0">
        <h1 className="text-xl font-bold truncate text-center sm:text-left">
          🎬 GIF Chat
        </h1>
        <div className="flex flex-col sm:flex-row items-center sm:gap-3 w-full sm:w-auto">
          <span className="text-sm truncate max-w-full sm:max-w-xs text-center sm:text-left">
            {user.email}
          </span>
          <button
            onClick={onSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 mt-2 sm:mt-0"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={user.uid}
        userInteracted={userInteracted}
      />

      {/* GIF Selection */}
      {gifs.length > 0 && (
        <div className="p-4 bg-white border-t border-gray-200 overflow-x-auto">
          <div className="flex gap-2">
            {gifs.map((gif, index) => {
              const tinyGifUrl =
                gif?.media_formats?.tinygif?.url || gif?.media_formats?.gif?.url;
              const fullGifUrl = gif?.media_formats?.gif?.url || tinyGifUrl;
              return (
                <div
                  key={index}
                  className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 group rounded-lg overflow-hidden cursor-pointer"
                >
                  <img
                    src={tinyGifUrl}
                    alt={gif?.content_description || "GIF"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => sendGif(fullGifUrl)}
                      className="bg-purple-500 text-white px-2 py-1 rounded"
                    >
                      Send
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white border-t border-gray-200 p-4 flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Search for a GIF..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default ChatPage;
