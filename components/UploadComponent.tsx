import { useState } from "react";

interface UploadComponentProps {
  onUploadComplete?: (message: string) => void; // <-- Define prop type
}

export default function UploadComponent({ onUploadComplete }: UploadComponentProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", figureOutFileType(selectedFile.name));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        onUploadComplete?.(`Success: ${result.message}`);
      } else {
        onUploadComplete?.(`Error: ${result.error}`);
      }
    } catch (error) {
      onUploadComplete?.(`Upload failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload
      </button>
    </div>
  );

  function figureOutFileType(fileName: string): string {
    let type: string;

    if (/^testSuite-/i.test(fileName)) {
      type = "testSuite";
    } else if (/^run-/i.test(fileName)) {
      type = "testRun";
    } else {
      throw new Error("Unknown file type: <" + fileName + ">");
    }
    return type;
  }
}
