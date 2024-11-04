import React from "react";
import EmailSignUp from "./EmailSignUp";
import TermsAgreement from "./TermsAgreement";

function CreateAccount() {
  return (
    <main className="flex flex-col min-h-screen bg-gray-800">
      <section className="flex items-center justify-center w-full min-h-screen">
        <div className="flex flex-col items-center bg-gray-800 p-8 rounded-lg max-w-md w-full">
          <header className="text-center text-white">
            <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/4230a8172d733f38d2181aa9d1dd2e5597342790ae0365486f7974fbd516a695" alt="Login avatar" className="w-24 h-24 rounded-full mx-auto" />
            <h1 className="mt-4 text-4xl">Create Account!</h1>
            <p className="mt-2 text-lg">Welcome Onboard!</p>
          </header>
          <EmailSignUp/>
          <TermsAgreement/>
        </div>
      </section>
    </main>
  );
}

export default CreateAccount;
