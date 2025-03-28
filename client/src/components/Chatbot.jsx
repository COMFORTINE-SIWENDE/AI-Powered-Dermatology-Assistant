// Chatbot.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Loader } from "lucide-react";
import { chat } from "../assets";
import MulticolorProgressBar from "./Progres";

const Chatbot = ({ sessionId, diagnosis }) => {
  const chatUrl = "http://127.0.0.1:8081/api/chat/";
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! How can I help assist today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isBot: true,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const chatContainerRef = useRef(null);
  useEffect(() => {
    const diagnosisResponse = {
      id: Date.now() + 1,
      text: diagnosis,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isBot: true,
    };
    diagnosis && setMessages((prev) => [...prev, diagnosisResponse]);
  }, [diagnosis]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    const newUserMessage = {
      id: Date.now(),
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isBot: false,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    try {
      setIsLoading(true);
      const response = await axios.post(
        chatUrl,
        {
          message: input,
          session_id: sessionId,
        },
        {
          withCredentials: true,
        }
      );
      const botResponse = {
        id: Date.now() + 1,
        text: response.data.chatbot_response,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isBot: true,
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative flex flex-col h-full w-full max-w-md bg-gray-100 rounded-lg overflow-hidden border border-green-500 shadow-sm ">
      <div className="bg-blue-600 text-white p-4 z-10">
        <h2 className="text-xl font-semibold">Dermatology Assistant</h2>
      </div>
      <div className="absolute inset-0">
        <div className="h-full w-full relative">
          <img className="h-full w-full" src={chat} />
          <div className="absolute bg-black/50  inset-0" />
        </div>
      </div>
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto z-10"
        style={{ height: "100%" }}
      >
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isBot ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`p-3 rounded-lg shadow-sm max-w-[80%] break-words whitespace-pre-wrap ${
                  message.isBot
                    ? "bg-white text-gray-800"
                    : "bg-blue-600 text-white"
                }`}
              >
                <p>{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.isBot ? "text-gray-500" : "text-blue-100"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 relative bg-white/90">
        <MulticolorProgressBar isLoading={isLoading} />
        <div className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-full outline-none ring-2 ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 text-white rounded-r-full hover:bg-blue-500 outline-none ring-2 ring-blue-500 cursor-pointer flex justify-center items-center font-semibold text-sm"
          >
            {isLoading ? <Loader className="animate-spin" /> : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
