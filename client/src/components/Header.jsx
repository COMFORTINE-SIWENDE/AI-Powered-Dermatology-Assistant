import React, { useContext } from "react";
import { Logo } from "../assets";
import { Globalstate } from "../context/Globalcontext";

export default function Header() {
  const {
    screenSize: { WIDTH, HEIGHT },
  } = useContext(Globalstate);
  console.log(`HEIGHT:${HEIGHT},WIDTH:${WIDTH}`);
  return (
    <nav className={`w-full h-18 shadow-2xl z-20 fixed top-0 bg-gray-100`}>
      <div
        className={` flex items-center justify-between ${
          WIDTH <= 660 ? "w-full" : "w-[80%] mx-auto"
        }`}
      >
        <div>
          <img src={Logo} width={100} height={90} />
        </div>

        <div>
          <span
            className={`text-[20px] font-lite font-extrabold bg-gradient-to-r from-[hsl(240,100%,50%)] via-[hsl(120,100%,42%)] to-[hsl(240,100%,50%)] w-max text-transparent bg-clip-text`}
          >
            {WIDTH <= 1059
              ? "AI HACK"
              : "AI Hack With Microsoft AZure and Fabrics"}
          </span>
        </div>

        <div
          className={`${
            WIDTH <= 660
              ? "flex flex-col justify-center items-center"
              : "grid grid-cols-2 gap-3 "
          }`}
        >
          <div className="flex justify-start items-center text-lg">
            <span className="bg-gradient-to-r from-blue-700 via-green-700 to-amber-700 text-transparent bg-clip-text font-bold">
              Welcome User,
            </span>
          </div>

          <div
            className={`h-12 w-12 rounded-full bg-blue-600 overflow-hidden flex justify-center items-center`}
          >
            <span className="font-extrabold text-white">WU</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
