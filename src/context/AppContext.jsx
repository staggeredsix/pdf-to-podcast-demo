// File: src/context/AppContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchVoices } from '../api/ttsService';

const AppContext = createContext();

export function useAppContext() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
      loadVoices();
    }
  }, [userId]);

  const loadVoices = async () => {
    try {
      setIsLoading(true);
      const voices = await fetchVoices();
      setAvailableVoices(voices);
    } catch (error) {
      console.error('Failed to load voices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    userId,
    setUserId,
    availableVoices,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
