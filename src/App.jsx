// File: src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Upload from './pages/Upload';
import JobsDashboard from './pages/JobsDashboard';
import PodcastPlayer from './pages/PodcastPlayer';
import Settings from './pages/Settings';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Upload />} />
              <Route path="/jobs" element={<JobsDashboard />} />
              <Route path="/podcasts/:jobId" element={<PodcastPlayer />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
