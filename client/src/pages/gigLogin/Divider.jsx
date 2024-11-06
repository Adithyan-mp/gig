import React from 'react';

function Divider() {
  return (
    <div className="flex gap-6 justify-center items-center mt-4 w-full text-xs leading-relaxed text-center text-white whitespace-nowrap">
      <div className="flex flex-1 h-px bg-slate-600 w-[178px]" />
      <span>or</span>
      <div className="flex flex-1 h-px bg-slate-600 w-[177px]" />
    </div>
  );
}

export default Divider;