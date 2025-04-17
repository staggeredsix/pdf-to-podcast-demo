// File: src/pages/Settings.jsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

function Settings() {
  const { userId, setUserId } = useAppContext();
  const [inputUserId, setInputUserId] = useState(userId);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputUserId.trim()) {
      setUserId(inputUserId.trim());
      toast.success('User ID saved successfully');
    } else {
      toast.error('Please enter a valid User ID');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">User Settings</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              value={inputUserId}
              onChange={(e) => setInputUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter your user ID to access the PDF-to-Podcast service
            </p>
          </div>
          
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
