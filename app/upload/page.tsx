'use client'; // Required for interactive components in Next.js App Router

import UploadComponent from '../../components/UploadComponent';
import { useState } from 'react';

export default function UploadPage() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Test Files</h1>

      {/* Upload Component */}
      <UploadComponent onUploadComplete={setMessage} />

      {/* Display messages */}
      {message && (
        <p className="mt-4 p-2 border rounded bg-gray-100 text-gray-800">
          {message}
        </p>
      )}
    </main>
  );
}
