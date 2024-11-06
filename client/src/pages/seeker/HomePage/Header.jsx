import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsExpanded(true), 400);
    const contentTimer = setTimeout(() => setIsContentVisible(true), 1200);

    return () => {
      clearTimeout(timer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <header className="flex flex-col pt-5 pb-3.5 pl-2 bg-gray-800 w-full">
      <nav
        className={`transition-all duration-700 ease-out transform ${
          isExpanded ? 'w-full max-w-5xl rounded-xl' : 'w-24 rounded-full'
        } flex flex-col items-center mx-auto px-8 py-3 text-white bg-slate-600 shadow-lg`}
      >
        <div
          className={`flex flex-wrap gap-5 justify-between transition-opacity duration-700 ${
            isContentVisible ? 'opacity-100' : 'opacity-0'
          } w-full`}
        >
          <Link to="/" title="Home" className="flex items-center">
            <img className="w-auto h-10" src="#" alt="Logo" />
            <h1 className="ml-2 text-4xl font-bold">gig</h1>
          </Link>

          <Link to="/about" className="text-2xl">
            About Us
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
