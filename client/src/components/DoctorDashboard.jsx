import { useState, useEffect, useRef } from "react";
import { FiSend, FiUser, FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useGlobalState } from "../context/Globalcontext";

const DoctorDashboard = () => {
  const { state, dispatch } = useGlobalState();
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const chatEndRef = useRef(null);

  const [doctorData, setDoctorData] = useState(() => {
    const savedData = localStorage.getItem("doctorData");
    return savedData ? JSON.parse(savedData) : state.doctorData;
  });

  const [activeChat, setActiveChat] = useState(() => {
    if (doctorData) {
      return {
        id: 1,
        patientId: 1,
        messages: [
          ...doctorData.chatHistory.map((msg) => ({
            sender: msg.isBot ? "ai" : "patient",
            content: msg.text,
            timestamp: new Date(msg.timestamp).toISOString(),
          })),
          {
            sender: "system",
            content:
              "Patient has requested to speak with a doctor. Here's their case information:",
            timestamp: new Date().toISOString(),
          },
        ],
        images: doctorData.imageURL ? ["patient_image"] : [],
      };
    }
    return null;
  });

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat]);

  useEffect(() => {
    const handleStorageChange = () => {
      const sharedChat = JSON.parse(localStorage.getItem("sharedChat")) || [];
      setActiveChat((prev) => {
        const newMessages = sharedChat
          .filter((msg) => !prev?.messages.some((m) => m.id === msg.id))
          .map((msg) => ({
            id: msg.id,
            sender: msg.senderType === "doctor" ? "doctor" : "patient",
            content: msg.text,
            timestamp: msg.timestamp,
          }));

        return prev
          ? { ...prev, messages: [...prev.messages, ...newMessages] }
          : prev;
      });
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      timestamp: new Date().toISOString(),
      sender: "doctor",
      senderType: "doctor",
    };

    // Add to local chat
    setActiveChat((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          ...newMessage,
          content: newMessage.text,
        },
      ],
    }));

    // Dispatch to global state to share with patient
    dispatch({
      type: "ADD_SHARED_MESSAGE",
      payload: newMessage,
    });

    setMessage("");
  };

  const analyzeCase = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const analysisMessage = {
        sender: "system",
        content: `Analysis complete based on patient data:
- Primary condition: ${doctorData.diagnosis?.predicted_disease || "Unknown"}
- Confidence: ${doctorData.diagnosis?.confidence_score || 0}%
- Symptoms: ${doctorData.symptoms}
        
Recommended next steps: Review patient history and provide treatment plan`,
        timestamp: new Date().toISOString(),
      };

      setActiveChat((prev) => ({
        ...prev,
        messages: [...prev.messages, analysisMessage],
      }));
    }, 2000);
  };

  const formatMessage = (content) => {
    return content.split("\n").map((paragraph, i) => (
      <p key={i} className="mb-2">
        {paragraph}
      </p>
    ));
  };

  if (!doctorData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            No Active Patient Case
          </h2>
          <p className="text-gray-600 mb-6">
            Please wait for a patient to request a consultation or select an
            existing case.
          </p>
          <Link
            to="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center md:hidden">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1 rounded-md hover:bg-blue-700 transition cursor-pointer"
        >
          {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <h1 className="text-xl font-bold">Doctor Dashboard</h1>
        <button
          onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
          className="p-1 rounded-md hover:bg-blue-700 transition cursor-pointer"
        >
          <FiChevronDown size={24} />
        </button>
      </div>

      {/* Sidebar - Patient Info */}
      <div
        className={`${
          mobileSidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-gradient-to-b from-blue-500 to-blue-800 text-white p-4 absolute md:relative z-10 h-full`}
      >
        <h1 className="text-2xl font-bold mb-6 hidden md:block">Doctor View</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center mb-4">
            <FiUser className="mr-2" /> Patient Information
          </h2>
          <div className="bg-blue-700/50 p-4 rounded-lg">
            <div className="font-medium mb-2">
              {doctorData.user?.username || "Unknown Patient"}
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Age:</span>{" "}
              {doctorData.user?.age || "Not provided"}
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Symptoms:</span>{" "}
              {doctorData.symptoms || "Not provided"}
            </div>
            <div className="text-sm">
              <span className="font-semibold">AI Diagnosis:</span>{" "}
              {doctorData.diagnosis?.predicted_disease || "Not available"}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-400">
          <h3 className="text-md font-semibold mb-2">Case Details</h3>
          <div className="text-sm space-y-2">
            <p>
              <span className="font-semibold">Messages:</span>{" "}
              {activeChat?.messages.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Patient Info Header */}
        <div className="bg-white p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-2 md:mb-0">
            <h2 className="text-xl font-bold text-blue-800">
              {doctorData.user?.username || "Patient"}
            </h2>
            <p className="text-gray-700">
              {doctorData.user?.age
                ? `${doctorData.user.age} years`
                : "Age not provided"}{" "}
              • AI Diagnosis:{" "}
              {doctorData.diagnosis?.predicted_disease || "Not available"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              className="bg-blue-200 text-blue-700 px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-blue-300 transition flex items-center text-sm md:text-base cursor-pointer"
              onClick={analyzeCase}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Case"}
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="chat-container h-full">
            {activeChat ? (
              <div className="space-y-4">
                {activeChat.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "patient" || msg.sender === "ai"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] md:max-w-3/4 rounded-lg p-3 md:p-4 ${
                        msg.sender === "patient"
                          ? "bg-blue-50 text-gray-800"
                          : msg.sender === "ai"
                          ? "bg-gray-100 text-gray-800 border-l-4 border-blue-500"
                          : msg.sender === "system"
                          ? "bg-yellow-50 text-gray-800 border-l-4 border-yellow-500"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      <div className="font-medium mb-1">
                        {msg.sender === "patient"
                          ? "Patient"
                          : msg.sender === "ai"
                          ? "AI Assistant"
                          : msg.sender === "system"
                          ? "System"
                          : "You"}
                      </div>
                      <div className="whitespace-pre-wrap">
                        {formatMessage(msg.content)}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.sender === "doctor"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No active chat session
              </div>
            )}
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-gray-100 p-3 md:p-4 border-t">
          <div className="flex items-center">
            <div className="flex-1 bg-white rounded-lg border border-gray-300 overflow-hidden">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your response..."
                className="w-full p-2 md:p-3 focus:outline-none resize-none"
                rows="1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="ml-2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-2 md:p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Attachments */}
      <div
        className={`${
          mobileToolsOpen ? "block" : "hidden"
        } md:block w-full md:w-[26rem] bg-white border-l p-4 overflow-y-auto absolute md:relative right-0 h-full z-10 md:border md:border-blue-600`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-800">
            Case Attachments
          </h2>
          <FiX
            onClick={() => setMobileToolsOpen(false)}
            className="text-blue-600 p-1 md:hidden rounded-md bg-blue-200 hover:bg-blue-700 hover:text-blue-100 transition cursor-pointer"
            size={24}
          />
        </div>

        <div>
          <h3 className="font-medium mb-2 text-blue-900">Patient Image</h3>
          {doctorData.imageURL ? (
            <div className="bg-gray-100 p-2 rounded flex flex-col items-center cursor-pointer hover:bg-gray-200 transition">
              <div className="w-full h-40 bg-gray-200 mb-2 overflow-hidden">
                <img
                  src={doctorData.imageURL}
                  alt="Patient condition"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-sm text-gray-800">
                Patient uploaded image
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No image provided</p>
          )}
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2 text-blue-900">Diagnosis Details</h3>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm mb-1">
              <span className="font-semibold">Condition:</span>{" "}
              {doctorData.diagnosis?.predicted_disease || "Unknown"}
            </p>
            <p className="text-sm mb-1">
              <span className="font-semibold">Confidence:</span>{" "}
              {doctorData.diagnosis?.confidence_score || "0"}%
            </p>
            <p className="text-sm">
              <span className="font-semibold">AI Notes:</span>{" "}
              {doctorData.diagnosis?.chatbot_response || "No additional notes"}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-blue-200 pt-4">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
