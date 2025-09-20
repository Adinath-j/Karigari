import React, { useState } from 'react';

const TrackingModal = ({ isOpen, onClose, onSubmit, order }) => {
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(trackingInfo);
  };

  const handleChange = (e) => {
    setTrackingInfo({
      ...trackingInfo,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">
              Add Tracking Information
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tracking Number
              </label>
              <input
                type="text"
                name="trackingNumber"
                value={trackingInfo.trackingNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Carrier
              </label>
              <select
                name="carrier"
                value={trackingInfo.carrier}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">Select a carrier</option>
                <option value="India Post">India Post</option>
                <option value="Blue Dart">Blue Dart</option>
                <option value="DTDC">DTDC</option>
                <option value="FedEx">FedEx</option>
                <option value="DHL">DHL</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estimated Delivery Date
              </label>
              <input
                type="date"
                name="estimatedDelivery"
                value={trackingInfo.estimatedDelivery}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Tracking Info
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;