import React from "react";
import { Logo } from "../assets";
import { Link } from "react-router-dom";
import { useGlobalState } from "../context/Globalcontext";

export default function Header() {
  const { state } = useGlobalState();
  const { screenWidth } = state;

  return (
    <nav className="w-full h-18 shadow-2xl z-20 fixed top-0 bg-gray-100">
      <div
        className={`flex items-center justify-between ${
          screenWidth <= 660 ? "w-full" : "w-[80%] mx-auto"
        }`}
      >
        <div>
          <img src={Logo} width={90} height={80} alt="Company Logo" />
        </div>

        <div>
          <span
            className={`font-lite font-extrabold bg-gradient-to-r from-[hsl(240,100%,50%)] via-[hsl(120,100%,42%)] to-[hsl(240,100%,50%)] w-max text-transparent bg-clip-text ${
              screenWidth <= 800 ? "text-[16px]" : "text-[20px]"
            }`}
          >
            {screenWidth <= 1059 ? "AI Agents" : "AI Agents Hackathon 2025"}
          </span>
        </div>

        <div>
          <Link
            to="/DoctorDashboard"
            className="p-3 text-[hsl(240,91%,70%)] font-semibold hover:underline hover:text-[blue]"
          >
            Doctor Dashboard
          </Link>
          <Link
            to="/about"
            className="p-3 text-[hsl(240,91%,70%)] font-semibold hover:underline hover:text-[blue]"
          >
            Meet our team
          </Link>
        </div>
      </div>
    </nav>
  );
}
