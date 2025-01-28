import React from 'react'

const SkeletonHomeComponent = () => {
    return (
      <div className="grid grid-rows-[auto,1fr] lg:grid-cols-[3fr,1fr] h-screen bg-gray-100">
        {/* Drug List Section */}
        <div className="p-6">
          <div className="text-2xl font-bold mb-4 h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
  
        {/* POS Section */}
        <div className="bg-white p-6 h-full shadow-lg flex flex-col">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
  
            {/* Placeholder Items */}
            <div className="space-y-4 overflow-y-auto h-fit max-h-48 w-full">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-4 mb-4 flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex items-center justify-between w-40">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            {/* Summary Section */}
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-full bg-gray-200 h-10 rounded-lg mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default SkeletonHomeComponent;