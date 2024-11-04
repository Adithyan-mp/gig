import React from "react";

function OrDivider() {
  return (
    <div className="flex gap-6 justify-center items-center mt-4 w-full text-xs text-center text-white whitespace-nowrap">
      <div className="flex-1 h-px bg-slate-600" />
      <span>or</span>
      <div className="flex-1 h-px bg-slate-600" />
    </div>
  );
}

export default OrDivider;
