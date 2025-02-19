// components/UploadForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

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
        // test-manager.tsの関数を呼び出す
        // 例: await testManager.processData(jsonData);

        setMessage('Upload successful.');
        router.push('/status'); // アップロード後にステータスページへリダイレクト
      } catch (error) {
        console.error('Invalid JSON file:', error);
        setMessage('Invalid JSON file.');
      }
    };
  };

  return (
    <div>
      <h1>Upload Test Run</h1>
      <input type="file" accept="application/json" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
};

export default UploadForm;
