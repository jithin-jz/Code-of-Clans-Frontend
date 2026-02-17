import React from "react";

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.35) 1px, transparent 1px)",
  backgroundSize: "52px 52px",
};

const AppBackdrop = () => {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none bg-[#0b1119]" />
      <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-[#101928] via-[#0d141f] to-[#0a0f17]" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={GRID_STYLE}
      />
      <div className="absolute top-0 left-[8%] w-[32rem] h-[32rem] rounded-full bg-[#2563eb]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-8rem] right-[10%] w-[28rem] h-[28rem] rounded-full bg-[#0ea5e9]/10 blur-3xl pointer-events-none" />
    </>
  );
};

export default AppBackdrop;
