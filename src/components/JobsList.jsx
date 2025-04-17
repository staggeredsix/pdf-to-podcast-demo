// File: src/components/JobsList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createStatusWebSocket, getSavedPodcasts, deletePodcast } from '../api/apiService';
import { toast } from 'react-hot-toast';

function JobsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [activeJobs, setActiveJobs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const webSocketsRef = useRef({});
  
  // Get highlighted job ID from query params
  const queryParams = new URLSearchParams(location.search);
  const highlightedJobId = queryParams.get('highlight');

  useEffect(() => {
    loadJobs();
    
    // Cleanup WebSockets on unmount
    return () => {
      Object.values(webSocketsRef.current).forEach(socket => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      });
    };
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const savedPodcasts = await getSavedPodcasts();
      setJobs(savedPodcasts);
      
      // Check for active jobs
      const active = {};
      for (const job of savedPodcasts) {
        if (job.status !== 'completed' && job.status !== 'failed') {
          active[job.job_id] = true;
          setupWebSocket(job.job_id);
        }
      }
      setActiveJobs(active);
    } catch (error) {
      toast.error(`Failed to load jobs: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebSocket = (jobId) => {
    // Close existing WebSocket if it exists
    if (webSocketsRef.current[jobId]) {
      webSocketsRef.current[jobId].close();
    }
    
    const socket = createStatusWebSocket(jobId, (data) => {
      if (data.status === 'completed' || data.status === 'failed') {
        setActiveJobs(prev => {
          const updated = { ...prev };
          delete updated[jobId];
          return updated;
        });
        
        // Close this WebSocket
        if (webSocketsRef.current[jobId]) {
          webSocketsRef.current[jobId].close();
          delete webSocketsRef.current[jobId];
        }
        
        // Refresh job list
        loadJobs();
      } else {
        // Update job status
        setJobs(prev => 
          prev.map(job => 
            job.job_id === jobId 
              ? { ...job, status: data.status, progress: data.progress } 
              : job
          )
        );
      }
    });
    
    webSocketsRef.current[jobId] = socket;
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this podcast?')) {
      return;
    }
    
    try {
      await deletePodcast(jobId);
      toast.success('Podcast deleted successfully');
      setJobs(jobs.filter(job => job.job_id !== jobId));
    } catch (error) {
      toast.error(`Failed to delete podcast: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Failed</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Processing</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No jobs found. Upload a PDF to create your first podcast.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Upload PDF
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr 
              key={job.job_id} 
              className={`hover:bg-gray-50 ${job.job_id === highlightedJobId ? 'bg-indigo-50' : ''}`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{job.name}</div>
                <div className="text-sm text-gray-500">{job.job_id}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(job.created_at).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(job.created_at).toLocaleTimeString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(job.status)}
                {job.progress && (
                  <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full" 
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {job.duration} min
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {job.status === 'completed' && (
                  <button
                    onClick={() => navigate(`/podcasts/${job.job_id}`)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Play
                  </button>
                )}
                <button
                  onClick={() => handleDeleteJob(job.job_id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobsList;
