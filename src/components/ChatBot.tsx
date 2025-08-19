import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageCircle,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  scholarships?: Array<{
    id: string;
    title: string;
    eligibility: string;
    deadline: string;
    applicationLink: string;
  }>;
}

interface ChatBotProps {
  className?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/chatbot/history/${sessionId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.history) {
          setMessages(
            data.history.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          );
        } else {
          // Show welcome message for new sessions
          setMessages([
            {
              id: "welcome",
              type: "bot",
              content:
                "👋 Hi! I'm ScholarWise AI, your intelligent scholarship assistant. I can help you:\n\n🎓 Find scholarships based on your profile\n📝 Get application guidance\n📅 Track important deadlines\n💡 Answer questions about scholarships\n\nHow can I assist you today?",
              timestamp: new Date(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      // Show welcome message on error
      setMessages([
        {
          id: "welcome",
          type: "bot",
          content:
            "👋 Welcome to ScholarWise AI! How can I help you find the perfect scholarship today?",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          context: {
            previousMessages: messages.slice(-5), // Send last 5 messages for context
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: `bot_${Date.now()}`,
          type: "bot",
          content: data.data.response,
          timestamp: new Date(),
          scholarships: data.data.relevantScholarships,
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: "bot",
        content:
          "😅 Sorry, I encountered an error. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`http://localhost:5001/api/chatbot/history/${sessionId}`, {
        method: "DELETE",
      });
      setMessages([
        {
          id: "welcome",
          type: "bot",
          content: "👋 Chat history cleared! How can I help you today?",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isOpen) {
    return (
      <div className={`chatbot-container ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
          aria-label="Open AI Chat Assistant"
        >
          <MessageCircle className="w-6 h-6 group-hover:animate-pulse" />
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`chatbot-container transition-all duration-300 ${className} ${
        isMinimized ? "" : "chatbot-mobile"
      }`}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 overflow-hidden ${
          isMinimized ? "w-80 h-16" : "w-[400px] h-[520px]"
        }`}
        style={{
          minWidth: isMinimized ? undefined : "320px",
          maxWidth: isMinimized ? undefined : "400px",
          minHeight: isMinimized ? undefined : "400px",
          maxHeight: isMinimized ? undefined : "600px",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl border-b border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="w-5 h-5" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-semibold text-base">ScholarWise AI</h3>
              <p className="text-blue-100 text-xs">
                Your Scholarship Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
              aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Container */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 bg-gray-50 chatbot-scroll"
              style={{
                height: "380px",
                maxHeight: "380px",
              }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  } w-full`}
                >
                  <div
                    className={`chatbot-message-bubble px-3 py-2 rounded-xl break-words ${
                      message.type === "user"
                        ? "bg-blue-600 text-white max-w-[85%]"
                        : "bg-white text-gray-800 shadow-sm border border-gray-200 max-w-[90%]"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === "bot" && (
                        <Bot className="w-3.5 h-3.5 mt-0.5 text-blue-600 flex-shrink-0" />
                      )}
                      {message.type === "user" && (
                        <User className="w-3.5 h-3.5 mt-0.5 text-blue-100 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0 chatbot-text-container">
                        <div className="chatbot-message-content text-sm leading-relaxed">
                          {message.content}
                        </div>

                        {/* Scholarship Results */}
                        {message.scholarships &&
                          message.scholarships.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className="text-sm font-medium text-blue-700 border-t border-blue-100 pt-2">
                                🎓 Relevant Scholarships:
                              </div>
                              {message.scholarships.map((scholarship) => (
                                <div
                                  key={scholarship.id}
                                  className="bg-blue-50 border border-blue-200 rounded-lg p-2 chatbot-text-container"
                                >
                                  <h4 className="font-medium text-blue-900 text-sm mb-1 chatbot-message-content">
                                    {scholarship.title}
                                  </h4>
                                  <p className="text-blue-700 text-xs mb-1 chatbot-message-content">
                                    📋 {scholarship.eligibility}
                                  </p>
                                  <p className="text-blue-600 text-xs mb-2 chatbot-message-content">
                                    📅 Deadline: {scholarship.deadline}
                                  </p>
                                  <a
                                    href={scholarship.applicationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors chatbot-force-break"
                                  >
                                    Apply Now →
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                        <div
                          className={`text-xs mt-2 ${
                            message.type === "user"
                              ? "text-blue-200"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start w-full">
                  <div className="bg-white text-gray-800 shadow-sm border border-gray-200 px-4 py-3 rounded-2xl max-w-[90%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Container */}
            <div className="p-3 bg-white border-t border-gray-200 rounded-b-2xl">
              <div className="flex space-x-2 mb-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about scholarships..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      setInputMessage("Show me engineering scholarships")
                    }
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    🔧 Engineering
                  </button>
                  <button
                    onClick={() =>
                      setInputMessage("Medical scholarships for students")
                    }
                    className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                  >
                    🏥 Medical
                  </button>
                  <button
                    onClick={() => setInputMessage("MBA scholarships")}
                    className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
                  >
                    💼 MBA
                  </button>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear Chat
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
