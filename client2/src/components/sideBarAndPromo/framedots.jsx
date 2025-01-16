import React from "react";

const Framedots = () => {
  return (
    <div className="inline-flex items-center gap-3 relative">
      {" "}
      <div className="relative w-3 h-3 bg-primary rounded-md opacity-50" />{" "}
      <div className="relative w-3 h-3 bg-primary rounded-md opacity-50" />{" "}
      <div className="relative w-3.5 h-3.5">
        {" "}
        <div className="relative h-3.5 rounded-[7px]">
          {" "}
          <div className="absolute w-2.5 h-2.5 top-0.5 left-0.5 bg-secondary-2 rounded-[5px]" />{" "}
          <div className="absolute w-3.5 h-3.5 top-0 left-0 rounded-[7px] border-2 border-solid border-primary" />{" "}
        </div>{" "}
      </div>{" "}
      <div className="relative w-3 h-3 bg-primary rounded-md opacity-50" />{" "}
      <div className="relative w-3 h-3 bg-primary rounded-md opacity-50" />{" "}
    </div>
  );
};

export default Framedots;
