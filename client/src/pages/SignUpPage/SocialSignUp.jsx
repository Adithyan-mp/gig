import React from "react";

function SocialSignUp() {
  return (
    <button className="flex gap-3 justify-center items-center px-4 py-4 mt-4 w-full text-sm bg-zinc-700 border border-slate-600 text-zinc-100 rounded-lg hover:opacity-80">
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/b3e08436dfc4ae1a1da3394a06a80d208e25a0ae0c756b89e4349aa6ae099cf7"
        alt=""
        className="w-6"
      />
      <span>Sign up with Google</span>
    </button>
  );
}

export default SocialSignUp;
