// File: src/components/UploadForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { processFiles } from '../api/apiService';
import { useAppContext } from '../context/AppContext';

function UploadForm() {
  const navigate = useNavigate();
  const { userId, availableVoices } = useAppContext();
  
  const [files, setFiles] = useState({
    targetPdf: null,
    contextPdfs: [],
  });
  
  const [params, setParams] = useState({
    userId: userId,
    name: '',
    duration: 5, // Default 5 minutes
    monologue: false,
    speaker_1_name: 'Speaker 1',
    speaker_2_name: 'Speaker 2',
    voice_mapping: {},
    guide: '',
    vdb_task: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetDropzone = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFiles({
        ...files,
        targetPdf: acceptedFiles[0],
      });
    },
  });

  const contextDropzone = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    onDrop: (acceptedFiles) => {
      setFiles({
        ...files,
        contextPdfs: acceptedFiles,
      });
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setParams({
      ...params,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleVoiceChange = (speakerKey, voiceId) => {
    setParams({
      ...params,
      voice_mapping: {
        ...params.voice_mapping,
        [speakerKey]: voiceId,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!files.targetPdf) {
      toast.error('Please upload a target PDF');
      return;
    }
    
    if (!params.name) {
      toast.error('Please provide a podcast name');
      return;
    }
    
    // Ensure voice mapping is complete
    if (!params.voice_mapping.speaker_1) {
      toast.error('Please select a voice for Speaker 1');
      return;
    }
    
    if (!params.monologue && !params.voice_mapping.speaker_2) {
      toast.error('Please select a voice for Speaker 2');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const result = await processFiles(files, params);
      
      toast.success('PDF upload successful!');
      navigate(`/jobs?highlight=${result.job_id}`);
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return (
      <div className="text-center p-6">
        <p className="mb-4">Please enter your User ID in the Settings page to continue</p>
        <button
          onClick={() => navigate('/settings')}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Upload PDFs</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target PDF (Required)
            </label>
            <div 
              {...targetDropzone.getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                targetDropzone.isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}
            >
              <input {...targetDropzone.getInputProps()} />
              {files.targetPdf ? (
                <p className="text-indigo-600">{files.targetPdf.name}</p>
              ) : (
                <p className="text-gray-500">
                  Drag & drop your main PDF here, or click to select
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Context PDFs (Optional)
            </label>
            <div 
              {...contextDropzone.getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                contextDropzone.isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}
            >
              <input {...contextDropzone.getInputProps()} />
              {files.contextPdfs.length > 0 ? (
                <ul className="text-indigo-600">
                  {files.contextPdfs.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">
                  Drag & drop additional context PDFs here, or click to select
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Podcast Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Podcast Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={params.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={params.duration}
              onChange={handleInputChange}
              min="1"
              max="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="monologue"
              name="monologue"
              checked={params.monologue}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="monologue" className="ml-2 block text-sm text-gray-700">
              Monologue (single speaker)
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="speaker_1_name" className="block text-sm font-medium text-gray-700 mb-1">
                Speaker 1 Name
              </label>
              <input
                type="text"
                id="speaker_1_name"
                name="speaker_1_name"
                value={params.speaker_1_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {!params.monologue && (
              <div>
                <label htmlFor="speaker_2_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker 2 Name
                </label>
                <input
                  type="text"
                  id="speaker_2_name"
                  name="speaker_2_name"
                  value={params.speaker_2_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voice for {params.speaker_1_name}
              </label>
              <select
                value={params.voice_mapping.speaker_1 || ''}
                onChange={(e) => handleVoiceChange('speaker_1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a voice</option>
                {availableVoices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
            
            {!params.monologue && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice for {params.speaker_2_name}
                </label>
                <select
                  value={params.voice_mapping.speaker_2 || ''}
                  onChange={(e) => handleVoiceChange('speaker_2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={!params.monologue}
                >
                  <option value="">Select a voice</option>
                  {availableVoices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="guide" className="block text-sm font-medium text-gray-700 mb-1">
              Podcast Focus/Guidance (Optional)
            </label>
            <textarea
              id="guide"
              name="guide"
              value={params.guide}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter any specific focus or guidance for the podcast content"
            ></textarea>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="vdb_task"
              name="vdb_task"
              checked={params.vdb_task}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="vdb_task" className="ml-2 block text-sm text-gray-700">
              Use Vector Database for enhanced context
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Create Podcast'}
        </button>
      </div>
    </form>
  );
}

export default UploadForm;
