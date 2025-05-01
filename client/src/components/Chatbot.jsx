import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Loader, Bot, User, Sparkles, Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useGlobalState } from "../context/Globalcontext";

const Chatbot = ({ diagnosis }) => {
  const { state, dispatch } = useGlobalState();
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const chatContainerRef = useRef(null);
  const thinkingMessageIdRef = useRef(null);

  // Initialize with welcome message if chat is empty
  useEffect(() => {
    if (state.chatHistory.length === 0) {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: Date.now(),
          text: "Hello! I'm your dermatology assistant. How can I help you today?",
          timestamp: new Date(),
          isBot: true,
          type: "text",
          suggestedActions: [],
        },
      });
    }
  }, [dispatch, state.chatHistory.length]);

  // Add diagnosis to chat when received
  useEffect(() => {
    if (diagnosis) {
      const confidence = Math.round(diagnosis.confidence_score || 0);
      simulateTyping(
        diagnosis.chatbot_response || "Here's your diagnosis analysis",
        diagnosis.suggested_actions || [],
        "diagnosis",
        {
          confidence,
          condition: diagnosis.predicted_disease || "Unknown condition",
        }
      );
    }
  }, [diagnosis]);

  const simulateTyping = (
    text,
    suggestedActions = [],
    type = "text",
    meta = {}
  ) => {
    setIsTyping(true);
    const messageId = Date.now();

    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: messageId,
        text: "",
        timestamp: new Date(),
        isBot: true,
        isTyping: true,
        type,
        suggestedActions,
        ...meta,
      },
    });

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        dispatch({
          type: "UPDATE_MESSAGE_TEXT",
          payload: { id: messageId, text: text.substring(0, i + 1) },
        });
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: { id: messageId, updates: { isTyping: false } },
        });
      }
    }, 30);
  };

  // Sync doctor messages from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const sharedChat = JSON.parse(localStorage.getItem("sharedChat")) || [];
      sharedChat.forEach((msg) => {
        if (
          !state.chatHistory.some((m) => m.id === msg.id) &&
          msg.senderType === "doctor"
        ) {
          dispatch({
            type: "ADD_MESSAGE",
            payload: {
              ...msg,
              isBot: true,
              isDoctor: true,
            },
          });
        }
      });
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [state.chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === "" || isLoading || isTyping) return;

    const newUserMessage = {
      id: Date.now(),
      text: inputValue,
      timestamp: new Date(),
      isBot: false,
      type: "text",
      sender: "patient",
    };

    dispatch({ type: "ADD_MESSAGE", payload: newUserMessage });
    setInputValue("");

    try {
      setIsLoading(true);
      thinkingMessageIdRef.current = Date.now();
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: thinkingMessageIdRef.current,
          text: "thinking...",
          timestamp: new Date(),
          isBot: true,
          isTyping: true,
          type: "typing-indicator",
        },
      });

      const baseUrl =
        import.meta.env.MODE === "development"
          ? "http://localhost:8081/api/medical-assistant/"
          : "https://aid-dermatilogy-cbfbbad0cdhscbf9.spaincentral-01.azurewebsites.net/api/medical-assistant/";

      const response = await axios.post(
        baseUrl,
        {
          message: inputValue,
          session_id: state.activeSession || uuidv4(),
        },
        { headers: { "Content-Type": "application/json" } }
      );

      dispatch({
        type: "REMOVE_MESSAGE",
        payload: thinkingMessageIdRef.current,
      });
      const { chat_response, suggested_actions } = response.data;
      simulateTyping(
        chat_response?.chatbot_response || "Here's what I found:",
        suggested_actions || [],
        "text"
      );
    } catch (error) {
      console.error("Error sending message:", error);
      if (thinkingMessageIdRef.current) {
        dispatch({
          type: "REMOVE_MESSAGE",
          payload: thinkingMessageIdRef.current,
        });
      }
      simulateTyping(
        "Sorry, I encountered an error. Please try again.",
        [],
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      alternative_treatments:
        "What are some alternative treatments for my condition?",
      learn_more: "Can you tell me more about this condition?",
      ask_specialist: "When should I consult a specialist about this?",
    };
    setInputValue(actionMessages[action] || action);
  };

  const handleDoctorRequest = () => {
    setIsConnecting(true);
    dispatch({ type: "UPDATE_PHYSICIAN_BUTTON", payload: "connecting" });

    const doctorData = {
      user: state.user,
      chatHistory: state.chatHistory,
      imageURL: state.imageURL,
      symptoms: state.symptoms,
      diagnosis: state.diagnosis,
    };

    dispatch({ type: "SET_DOCTOR_DATA", payload: doctorData });
    localStorage.setItem("doctorData", JSON.stringify(doctorData));

    const systemMessage = {
      id: Date.now(),
      text: "Connecting you to a physician...",
      timestamp: new Date(),
      isBot: true,
      type: "system",
    };
    dispatch({ type: "ADD_MESSAGE", payload: systemMessage });

    setTimeout(() => {
      setIsConnecting(false);
      dispatch({ type: "UPDATE_PHYSICIAN_BUTTON", payload: "connected" });
      dispatch({
        type: "UPDATE_MESSAGE",
        payload: {
          id: systemMessage.id,
          updates: {
            text: "You are now connected to a physician. They will review your case and respond shortly.",
          },
        },
      });
      localStorage.setItem("physicianConnected", "true");
    }, 3000);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [state.chatHistory]);

  const formatTime = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`flex flex-col ${
        state.screenWidth <= 1164 ? "h-[49.5rem]" : "h-[87%]"
      } mt-4 w-full mx-auto rounded-xl shadow-[0_0_10px_1px_grey] overflow-hidden relative`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Dermatology Assistant</h2>
          <p className="text-xs opacity-80">
            {isTyping ? "Typing..." : "Online"}
          </p>
        </div>
      </div>

      {/* Chat messages */}
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {state.chatHistory.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isBot ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`flex max-w-[85%] ${
                  !message.isBot ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                    message.isBot
                      ? "bg-blue-100 text-blue-600 mr-2"
                      : "bg-purple-100 text-purple-600 ml-2"
                  }`}
                >
                  {message.isBot ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-2xl ${
                    message.isDoctor
                      ? "bg-green-100 text-gray-800 border-l-4 border-green-500"
                      : message.isBot
                      ? "bg-white text-gray-800 border border-gray-200"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  } ${
                    message.type === "diagnosis"
                      ? "border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  {message.isDoctor && (
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-semibold text-green-600">
                        PHYSICIAN RESPONSE:
                      </span>
                    </div>
                  )}
                  {message.type === "diagnosis" && (
                    <div className="flex items-center mb-2">
                      <Sparkles size={16} className="text-yellow-500 mr-1" />
                      <span className="text-xs font-semibold text-blue-600">
                        DIAGNOSIS: {message.condition} ({message.confidence}%
                        confidence)
                      </span>
                    </div>
                  )}
                  <p
                    className={`whitespace-pre-wrap ${
                      message.isTyping ? "blink-cursor" : ""
                    }`}
                  >
                    {message.text}
                    {message.isTyping && (
                      <span className="inline-block w-2 h-4 bg-gray-400 ml-1 blink"></span>
                    )}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isBot ? "text-gray-500" : "text-white/70"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                  {message.suggestedActions?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">
                        Quick actions:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {message.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(action)}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                          >
                            {typeof action === "string"
                              ? action.replace(/_/g, " ")
                              : action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="pb-2 border-t border-white w-full bg-cyan-100 h-max flex flex-col gap-2"
      >
        <button
          type="button"
          className={`font-semibold px-3 py-1 text-sm text-white flex items-center gap-2 cursor-pointer transition-colors justify-center ${
            state.physicianButtonState === "connecting"
              ? "bg-blue-400 animate-pulse"
              : state.physicianButtonState === "connected"
              ? "bg-green-500"
              : "bg-gradient-to-r from-transparent via-blue-500 to-transparent hover:bg-blue-600"
          }`}
          onClick={handleDoctorRequest}
          disabled={isConnecting || state.physicianButtonState === "connected"}
        >
          {state.physicianButtonState === "connecting" ? (
            <>
              <Loader className="animate-spin" size={16} />
              Connecting and redirecting...
            </>
          ) : state.physicianButtonState === "connected" ? (
            "Connected ✓"
          ) : (
            "Chat to doctor"
          )}
        </button>
        <div className="grid grid-cols-[8.7fr_1fr] gap-2 w-[97%] mx-auto">
          <div className="flex justify-center items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 rounded-md w-full outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your question..."
              disabled={isLoading || isTyping}
            />
          </div>
          <div className="flex justify-center items-center">
            <button
              type="submit"
              disabled={isLoading || isTyping || inputValue.trim() === ""}
              className={`p-2 rounded-full ${
                isLoading || isTyping || inputValue.trim() === ""
                  ? "bg-gradient-to-r from-blue-500/50 to-purple-500/50 text-white"
                  : "text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              }`}
            >
              {isLoading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
