// src/components/UploadForm.tsx
'use client';

import { useState } from 'react';

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a JSON file to upload.');
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file, 'utf-8');
    reader.onload = async () => {
      try {
        const jsonData = JSON.parse(reader.result as string);

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData)
        });

        const result = await response.json();
        if (response.ok) {
          setMessage(`Upload successful: ${result.fileName}`);
        } else {
          setMessage(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Invalid JSON file:', error);
        setMessage('Invalid JSON file.');
      }
    };
  };

  return (
    <div>
      <input type="file" accept="application/json" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
};

export default UploadForm;
