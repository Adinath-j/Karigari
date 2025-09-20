import React from 'react';

const TestComponent = () => {
  return (
    <div className="p-4 bg-blue-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-800 mb-2">Tailwind CSS Test</h2>
      <p className="text-gray-700">
        If you can see this styled component, Tailwind CSS is working correctly!
      </p>
      <div className="mt-4 flex space-x-2">
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
          Success Button
        </button>
        <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
          Error Button
        </button>
      </div>
    </div>
  );
};

export default TestComponent;