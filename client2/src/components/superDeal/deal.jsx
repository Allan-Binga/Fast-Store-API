import React, { useState, useEffect } from "react";
import JBLImage from "./super.png";

const Deal = () => {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const savedTime = localStorage.getItem("timeRemaining");
    return savedTime ? parseInt(savedTime, 10) : 48 * 60 * 60; // Default to 48 hours if not found
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(interval); // Stop the timer when it reaches 0
          localStorage.removeItem("timeRemaining"); // Optionally clear saved time
          return 0;
        }

        const newTime = prev - 1;
        localStorage.setItem("timeRemaining", newTime); // Update local storage
        return newTime;
      });
    }, 1000); // Runs every second

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  // Calculate days, hours, minutes, and seconds
  const days = Math.floor(timeRemaining / (60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="flex items-center justify-center w-[600] h-[500] bg-gradient-to-b from-black to-gray-900 ml-[300px] mr-[200px] mt-40">
      <div className="relative w-[1400px] h-[600px]">
        {/* Boombox image section */}
        <div className="absolute w-[600px] h-[500px] top-0 left-[520px]">
          <div className="absolute w-[504px] h-[500px] top-0 left-[26px] bg-[#d9d9d9] rounded-[252px/250px] blur-[200px] opacity-30" />
          <div className="absolute w-[600px] h-[420px] top-[37px] left-0">
            <img
              className="absolute w-[568px] h-[330px] top-[45px] left-4"
              alt="JBL Boombox Hero"
              src={JBLImage}
            />
          </div>
        </div>

        {/* Text content */}
        <div className="absolute w-[443px] top-[120px] left-14 text-white font-bold text-4xl">
          <span>Enhance Your</span>
          <br />
          <span>Music Experience</span>
        </div>

        {/* Timer */}
        <div className="inline-flex items-start gap-6 absolute top-[273px] left-14">
          {[
            `${days} Days`,
            `${hours} Hours`,
            `${minutes} Minutes`,
            `${seconds} Seconds`,
          ].map((time, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center w-[90px] h-[90px] rounded-full bg-black border border-gray-100"
            >
              <span className="text-white text-3xl font-semibold">
                {time.split(" ")[0]}
              </span>
              <span className="text-gray-400 text-sm">
                {time.split(" ")[1]}
              </span>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="absolute top-[375px] left-14 mt-[10px]">
          <button className="px-6 py-3 bg-green-500 text-white font-semibold text-lg rounded-lg hover:bg-green-600">
            Buy Now!
          </button>
        </div>

        {/* Category label */}
        <div className="absolute top-[68px] left-14 text-green-500 font-medium text-lg">
          Mega Deal
        </div>
      </div>
    </div>
  );
};

export default Deal;
