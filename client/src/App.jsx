import { useState, useEffect } from "react";
import Header from "./components/Header";
import Chatbot from "./components/Chatbot";
import DiagnosisForm from "./components/DiagnosisForm";
import { v4 as uuidv4 } from "uuid";
import Up from "./components/Up.jsx";
import { Routes, Route } from "react-router-dom";
import Profiles from "./components/Profiles.jsx";
import DoctorDashboard from "./components/DoctorDashboard.jsx";
import { useGlobalState } from "./context/Globalcontext.jsx";

const Home = () => {
  const { state } = useGlobalState();
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
      <div
        className={`pt-20 bg-gradient-to-br from-[#50E6FF] to-[#F3F2F1] ${
          state.screenWidth >= 1164 ? "h-screen" : "h-max flex flex-col"
        } overflow-hidden`}
      >
        {state.screenWidth <= 1164 && (
          <div className="w-full">
            <Up />
          </div>
        )}
        <div
          className={`mx-auto grid ${
            state.screenWidth >= 1164 && "grid-cols-[2fr_1fr] gap-3"
          } ${state.screenWidth <= 1405 ? "w-[95%]" : "w-[80%]"} ${
            state.screenWidth <= 815
              ? "grid-rows-2 h-max"
              : "grid-cols-2 h-full"
          }`}
        >
          <DiagnosisForm onDiagnosis={handleDiagnosis} sessionId={sessionId} />
          <Chatbot diagnosis={diagnosis} sessionId={sessionId} />
        </div>
      </div>
    </>
  );
};

export default function App() {
  return (
    <Routes>
      <Route element={<Home />} path="/" exact />
      <Route element={<Profiles />} path="/about" />
      <Route element={<DoctorDashboard />} path="/DoctorDashboard" />
    </Routes>
  );
}
