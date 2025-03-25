// DiagnosisForm.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Chatbot from "./Chatbot";
import { azure, BGlogo, fabric, Upload } from "../assets";

const TypingEffect = ({ text, speed = 100, delay = 2000 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Reset after delay but keep the last letter
      setTimeout(() => {
        setDisplayedText(text[0]); // Keep last letter
        setIndex(1); // Restart from second letter
      }, delay);
    }
  }, [index, text, speed, delay]);

  return <h1>{displayedText}</h1>;
};

const DiagnosisForm = ({ onDiagnosis, sessionId }) => {
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [symptoms, setSymptoms] = useState("");

  useEffect(() => {
    const fakeurl = image && URL.createObjectURL(image);
    setImageURL(fakeurl);
  }, [image]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !symptoms) {
      alert("Please provide both an image and symptom description.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("symptoms", symptoms);
    formData.append("session_id", sessionId); // Include sessionId in the request

    try {
      const response = await axios.post(
        "http://127.0.0.1:8081/api/predict/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      onDiagnosis(response.data);
    } catch (error) {
      console.error("Error during diagnosis:", error);
    }
  };
  const [showD, setshowD] = useState(false);
  return (
    <div className="bg-gradient-to-t from-blue-400 via-white to-blue-500 rounded-xl">      
   <div className="bg-transparent shadow rounded-lg grid grid-cols-2 h-[40rem] overflow-hidden">
      {/* left */}
      <div className="pt-10 px-5">
        <div>
          <p className="font-lite font-bold text-white text-xl text-center">
            Welcome to the Microsoft Hackathon - Innovating with Azure AI &
            Microsoft Fabric
          </p>

          <h1 className="font-bold font-lite text-lg  mt-1 text-center bg-gradient-to-r from-[#0355ba] via-[#909004] to-black w-max text-transparent bg-clip-text text-[25px]">
            <TypingEffect text="Hack with us:" />
          </h1>
          <p className="tracking-tight leading-5">
            Join us in leveraging cutting-edge AI and data fabric solutions to
            build transformative applications. Let’s innovate together!
          </p>
        </div>

        <div className="flex gap-5 items-center justify-center mt-10">
          <div>
            <img className="size-30" src={azure} alt="" />
          </div>
          <h1 className="font-bold text-4xl bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text font-lite">
            &
          </h1>
          <div>
            <img className="size-30" src={fabric} alt="" />
          </div>
        </div>
      </div>
      {/* right */}
        <div className="bg-gradient-to-br from-green-500 via-blue-600 to-red-600 p-1 relative rounded-xl">
          <div className="absolute inset-[3px] bg-gradient-to-t from-blue-400 via-white to-blue-500 rounded-xl"/>
          
           <div className="grid grid-rows-[2fr_1.5fr] h-[0px]">

        <div className="relative " >
          <span
            onClick={() => setshowD((prev) => !prev)}
            className="absolute inset-x-0 top-0 mx-auto px-2 py-1 z-10 bg-blue-600 w-max rounded-b-md cursor-pointer hover:bg-blue-400 active:bg-blue-300 text-sm font-semibold text-white transition-colors duration-300"
          >
            {showD ? "Hide Image" : "Show Image"}
          </span>
          <div className={`absolute inset-0 ${showD ? "" : "bg-black/80 rounded-t-xl"}`} />
          <img src={imageURL || BGlogo} className="h-[300px] w-full object-fit object-center rounded-xl" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative w-[98%] mx-auto mt-1"
        >

            <div className="">
              
                <div className="mt-0 flex flex-col justify-center items-center transition-colors duration-300 ">
            <span className="text-xl text-[#000300] font-lite font-bold">Upload image</span>
            <label
              className="h-[40px] w-[100px] flex justify-center items-center cursor-pointer rounded-md bg-blue-400 hover:bg-blue-300 active:bg-blue-200 "
              htmlFor="fileUpload"
            >
              <img width={30} height={30} src={Upload} />
            </label>
            <input
              id="fileUpload"
              name="fileUpload"
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="invisible size-0"
            />
          </div> 

          
          <div className="flex items-center justify-between flex-col ">
            <label className="block text-[#000300] font-lite text-xl font-bold bg-gradient-to-r from-gray-700 to-green-900  w-max bg-clip-text">
              Describe your symptoms
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows="7"
              placeholder="Tell more about your condition..."
              className="m-1 block w-[90%] p-2 rounded-md bg-blue-200 shadow-sm outline-0 focus:ring-2 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="w-[90%] py-1.5 text-[.9em] font-bold rounded-md shadow-md text-white bg-gradient-to-br from-blue-200 hover:from-blue-500 to-blue-900 hover:to-blue-800 active:bg-indigo-600 transition-colors duration-300 hover:scale-[1.01] outline-none ring-offset-1 ring-2 ring-blue-500 cursor-pointer my-2"
            >
              Diagnose your status
            </button>
          </div>
         </div>
    
        </form>

      </div>

      </div>
    </div>

 </div>
  );
};

export default DiagnosisForm;
