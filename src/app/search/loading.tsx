import React from "react";

const Loading: React.FC = () => {
  return (
    <div className=" flex min-h-fit w-full flex-col items-center justify-center  bg-transparent">
      {/* Spinner */}
      <div className="mb-4 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-500 border-opacity-50"></div>
      </div>
      <p className="text-gray-500 text-lg">Loading results...</p>

      {/* Skeleton Loader */}
      <div className="mt-6 grid w-full max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(12)].map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-md bg-white p-4 shadow-md"
          >
            {/* Thumbnail */}
            <div className="bg-gray-200 mb-4 h-40 rounded-md"></div>
            {/* Title */}
            <div className="bg-gray-200 mb-2 h-4 w-3/4 rounded-md"></div>
            {/* Description */}
            <div className="bg-gray-200 mb-1 h-4 w-full rounded-md"></div>
            <div className="bg-gray-200 h-4 w-5/6 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
