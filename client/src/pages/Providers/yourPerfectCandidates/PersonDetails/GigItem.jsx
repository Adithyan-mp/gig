import React, { useState } from 'react';
import { IoMdArrowDropright } from "react-icons/io";
import { BiChat } from "react-icons/bi";
import { Link } from 'react-router-dom';
import PerfectCandidateDetails from '../../../../components/PerfecrCandidateDetails/PerfectCandidateDetails';


function GigItem({ name, email, phone, address, city, jobId, seekerId, providerId }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDetails = () => {
    setIsOpen(true);
  };
  const closeDetails = () => {
    setIsOpen(false);
  };

  return (
    <>
      <article className="py-8 px-10 mt-8 bg-white border border-gray-300 rounded-xl shadow-lg w-full max-w-[1200px] max-md:px-5 ml-[20px]">
        <div className="flex gap-8 max-md:flex-col justify-between items-center">
          
          {/* Title Section */}
          <div className="flex flex-col justify-center w-[20%] max-md:w-full">
            <h2 className="text-4xl font-semibold text-gray-800">{name}</h2>
          </div>

          {/* Chat Button Section */}
          <div className="flex items-center gap-3 text-2xl font-semibold text-orange-600">
            <BiChat className="text-5xl text-blue-600" />
            <Link 
              to={`/providerchat/${jobId}`} 
              className="text-xl text-blue-600 font-medium hover:underline"
            >
              Chat Now
            </Link>
          </div>

          {/* More Details Button */}
          <button 
            onClick={openDetails} 
            className="flex items-center gap-2 text-xl text-blue-600 font-medium hover:underline"
          >
            More details
            <IoMdArrowDropright className="text-4xl ml-2" />
          </button>
        </div>
      </article>

      {/* PersonDetailCard Section */}
      {isOpen && (
        <PerfectCandidateDetails
          person={{
            name,
            email,
            city,
            address,
            phone,
          }}
          onClose={closeDetails}
          jobId={jobId}
          seekerId={seekerId}
          providerId={providerId}
        />
      )}
    </>
  );
}

export default GigItem;
