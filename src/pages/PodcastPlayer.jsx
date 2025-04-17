// File: src/pages/PodcastPlayer.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPodcastMetadata, getPodcastAudio, getPodcastTranscript } from '../api/apiService';
import AudioPlayer from '../components/AudioPlayer';
import { toast } from 'react-hot-toast';

function PodcastPlayer() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPodcast();
  }, [jobId]);

  const loadPodcast = async () => {
    try {
      setIsLoading(true);
      
      // Load metadata
      const metadataResponse = await getPodcastMetadata(jobId);
      setMetadata(metadataResponse);
      
      // Load audio URL
      const audioUrlResponse = await getPodcastAudio(jobId);
      const audioBlob = await audioUrlResponse.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Load transcript
      const transcriptResponse = await getPodcastTranscript(jobId);
      setTranscript(transcriptResponse.transcript);
    } catch (error) {
      toast.error(`Failed to load podcast: ${error.message}`);
      navigate('/jobs');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Podcast not found or still processing.</p>
        <button
          onClick={() => navigate('/jobs')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/jobs')}
          className="mr-4 text-indigo-600 hover:text-indigo-800"
        >
          &larr; Back to Jobs
        </button>
        <h2 className="text-2xl font-bold">{metadata.name}</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Podcast Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-gray-900">
              {new Date(metadata.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-gray-900">{metadata.duration} minutes</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Format</p>
            <p className="text-gray-900">
              {metadata.monologue ? 'Monologue' : 'Dialogue'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Speakers</p>
            <p className="text-gray-900">
              {metadata.speaker_1_name}
              {!metadata.monologue && ` and ${metadata.speaker_2_name}`}
            </p>
          </div>
        </div>
      </div>
      
      <AudioPlayer audioUrl={audioUrl} transcript={transcript} />
    </div>
  );
}

export default PodcastPlayer;
