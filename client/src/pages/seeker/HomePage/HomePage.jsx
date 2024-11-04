import React from 'react';
import Header from './Header';
import WelcomeSection from './WelcomeSection';
import TopProviders from './TopProviders';

function GigPlatform() {
  return (
    <div className="flex flex-col bg-gray-800">
      <Header />
      <main className="flex flex-col items-center px-8 pt-16 pb-24 w-full bg-gray-800">
        <div className="flex flex-col lg:flex-row gap-10 w-full max-w-6xl">
          <WelcomeSection />
          <TopProviders />
        </div>
      </main>
    </div>
  );
}

export default GigPlatform;
