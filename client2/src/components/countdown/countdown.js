import * as React from "react";

function Countdown() {
  return (
    <div className="flex gap-4 text-black whitespace-nowrap min-w-[240px] w-[302px]">
      <div className="flex flex-col min-h-[50px]">
        <div className="text-xs font-medium">Days</div>
        <div className="mt-1 text-3xl font-bold tracking-widest leading-none">
          03 :
        </div>
      </div>
      <div className="flex self-end mt-7 min-h-[16px]" />
      <div className="flex flex-col h-[50px]">
        <div className="text-xs font-medium">Hours</div>
        <div className="mt-1 text-3xl font-bold tracking-widest leading-none">
          23 :
        </div>
      </div>
      <div className="flex self-end mt-7 min-h-[16px]" />
      <div className="flex flex-col min-h-[50px]">
        <div className="text-xs font-medium">Minutes</div>
        <div className="mt-1 text-3xl font-bold tracking-widest leading-none">
          19 :
        </div>
      </div>
      <div className="flex self-end mt-7 min-h-[16px]" />
      <div className="flex flex-col h-[50px]">
        <div className="text-xs font-medium">Seconds</div>
        <div className="mt-1 text-3xl font-bold tracking-widest leading-none">
          56
        </div>
      </div>
    </div>
  );
}

export default Countdown;
