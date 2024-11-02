import React,{useState} from 'react';
import JobDetailsCardDisplay from '../../../components/DetailCard/JobDetailCardDisplay';


function ApprovedJobCard({ title, company, location,pay,shift,time,role,description ,userId,jobId}) {
  const [isOpen, setIsOpen] = useState(false); 

  // Open the job details modal
  const openDetails = () => {
    setIsOpen(true);
  };

  // Close the job details modal
  const closeDetails = () => {
    setIsOpen(false);
  };
  return (
    <>
    
    <div className="flex flex-col w-auto max-md:mt-10">
      <div className="py-5 px-6 bg-white border border-green-500 rounded-2xl shadow-md">
        <div className="flex gap-5 items-center max-md:flex-col">
          {/* Job Info Section */}
          <div className="flex flex-col w-4/5 max-md:w-full">
            <div className="flex items-center gap-5 max-md:flex-col">
              {/* Placeholder for Image/Icon */}
              <div
                className="flex-shrink-0 rounded-full bg-zinc-300 h-[77px] w-[77px]"
                aria-hidden="true"
              />
              {/* Job Title and Company */}
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold text-black">{title}</h3>
                <p className="mt-2 text-xl text-black text-opacity-90">
                  {company}
                </p>
                <button
                  className="mt-4 text-base text-blue-600 hover:underline"
                  aria-label={`See more details about ${title} at ${company}`}
                  onClick={openDetails}
                >
                  See more...
                </button>
              </div>
            </div>
          </div>

          {/* Location Info Section */}
          <div className="flex flex-col items-center w-1/5 max-md:w-full">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/3be050e6e89b7cab7a13f2288a2f74f115c994fa3cff6fee43a4752cf99ff3b4?placeholderIfAbsent=true&apiKey=b1b7c46b698f4e75aa8360aa33741bab"
              alt="Location icon"
              className="w-7 h-7 object-contain"
            />
            <div className="mt-2 text-base text-black text-opacity-90">
              {location}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* JobDetailsCard component for showing the gig details */}
    {isOpen && (
      <JobDetailsCardDisplay
        job={{
          title: title,
          role : role,
          location: location, // or any other field you want
          salary: pay,
          shift : shift,
          time:time,
          contact: 'contact@company.com',
          description : description ,
          seekerId:userId,
          jobId:jobId// Add actual contact info
        }}
        onClose={closeDetails}
        showChat={true}
      />
    )}
    </>




  );
}

export default ApprovedJobCard;
