"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setUploadUrl('');

    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('media', file);

    try {
      const token = localStorage.getItem('jwt');

      if (!token) {
        setMessage('You must be logged in to upload a file.');
        return;
      }

            const res = await fetch(getApiUrl('upload/'), {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data' is set automatically by the browser
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMessage('File uploaded successfully!');
        setUploadUrl(data.url);
      } else {
        const data = await res.json();
        setMessage(data.error || 'File upload failed');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Upload Video</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="video">Video File</Label>
            <Input
              id="video"
              type="file"
              onChange={handleFileChange}
              accept="video/*"
              required
            />
          </div>
          <Button type="submit" className="w-full">Upload</Button>
        </form>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        {uploadUrl && (
          <div className="mt-4 text-center">
            <p className="text-green-500">File available at:</p>
            <a href={uploadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              {uploadUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
