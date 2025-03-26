// Chatbot.jsx
import React, { useRef, useState } from "react";
import axios from "axios";
import { Loader, Send } from "lucide-react";
import { chat } from "../assets";

const Chatbot = ({ sessionId, diagnosis }) => {
  const [isLoading, setisLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  console.log(messages);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setisLoading(true);
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
      setisLoading(false);
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setisLoading(false);
    }

    setInput("");
  };

  const chatEndRef = useRef(null);
  useRef(() => {
    chatEndRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full relative bg-gray-100 rounded-xl shadow-md overflow-hidden p-4 border border-green-500">
      <div className="absolute inset-0">
        <img className="h-full w-full" src={chat} />
      </div>
      <div className="absolute bg-black/70 z-10 inset-0" />

      <div className="flex-1 overflow-y-auto mb-4 z-20 ">
        {diagnosis?.chatbot_response ? (
          <div className={`flex "justify-start" mb-2`}>
            <div
              className={`max-w-xs p-2 rounded-lg 'bg-blue-500 bg-gray-300 text-gray-900`}
            >
              {diagnosis?.chatbot_response}
            </div>
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-900"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
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
          className="flex-1 px-4 py-2 border-2 border-white focus:border-blue-500 text-white placeholder:text-white rounded-l-lg focus:outline-none "
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-[0.55rem] cursor-pointer bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none ring-2 ring-blue-500 active:bg-blue-400 text-center"
        >
          {isLoading ? <Loader className="animate-spin" /> : <Send />}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
