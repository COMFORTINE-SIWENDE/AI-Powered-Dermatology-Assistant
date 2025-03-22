// Chatbot.jsx
import React, { useState } from "react";
import axios from "axios";
import { Loader } from "lucide-react";
import { BGlogo } from "../assets";
import { Chatlogo } from "../assets";
import {chat} from "../assets"

const Chatbot = ({ sessionId, diagnosis }) => {
  const [isLoading, setisLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    setisLoading((c) => (c = !c));
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await axios.post("http://127.0.0.1:8081/api/chat/", {
        message: input,
        session_id: sessionId,
      });
      const botMessage = {
        sender: "bot",
        text: response.data.chatbot_response,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-full relative bg-gray-100 rounded-b-lg shadow-md overflow-hidden p-4 border border-green-500">
      <div className="w-full h-full absolute inset-0">
        <img className="h-full w-full" src={chat} />
      </div>
      <div className="absolute bg-black z-10 inset-0 opacity-50" />
      <div className="flex-1 overflow-y-auto mb-4 z-20">
        {diagnosis?.chatbot_response ? (
          <div className={`flex "justify-start" mb-2`}>
            <div
              className={`max-w-xs p-2 rounded-lg 'bg-blue-500 bg-gray-300 text-gray-900`}
            >
              {diagnosis?.chatbot_response}
            </div>
          </div>
        ) : (
          <div>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`max-w-xs p-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-900"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center border-t border-white pt-2 z-20">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-white text-white placeholder:text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isLoading ? <Loader className="animate-spin" /> : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
