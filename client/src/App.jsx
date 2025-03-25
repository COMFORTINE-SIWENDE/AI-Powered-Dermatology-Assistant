import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Chatbot from "./components/Chatbot";
import DiagnosisForm from "./components/DiagnosisForm";
import { v4 as uuidv4 } from "uuid";

export default function App() {
  const [diagnosis, setDiagnosis] = useState(null);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    let storedSessionId = localStorage.getItem("session_id");
    if (!storedSessionId) {
      storedSessionId = uuidv4(); // Generate a new UUID
      localStorage.setItem("session_id", storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  const handleDiagnosis = (data) => {
    setDiagnosis(data);
  };

  return (
    <>
      <Header />
      <div className={`mt-[4.5em] h-[41.25rem] overflow-hidden`}>
        <div className="container w-[80%] mx-auto grid h-full grid-cols-[2fr_1fr] gap-6 mt-[15px]">
          <DiagnosisForm onDiagnosis={handleDiagnosis} sessionId={sessionId} />
          <Chatbot diagnosis={diagnosis} sessionId={sessionId} />
        </div>
      </div>
    </>
  );
}
