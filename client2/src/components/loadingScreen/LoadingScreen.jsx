import React from "react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex justify-center items-center z-50">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingScreen;
