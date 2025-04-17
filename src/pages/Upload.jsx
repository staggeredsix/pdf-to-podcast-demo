// File: src/pages/Upload.jsx
import React from 'react';
import UploadForm from '../components/UploadForm';

function Upload() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create New Podcast</h2>
      <UploadForm />
    </div>
  );
}

export default Upload;
