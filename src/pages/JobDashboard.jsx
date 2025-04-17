// File: src/pages/JobsDashboard.jsx
import React from 'react';
import JobsList from '../components/JobsList';

function JobsDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Podcasts</h2>
      <JobsList />
    </div>
  );
}

export default JobsDashboard;
