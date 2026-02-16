import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../Api';

interface DocumentUploadProps {
  travelId: number;
  onUploadSuccess: () => void;
}

const DocumentUpload = ({ travelId, onUploadSuccess }:DocumentUploadProps) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      setMessage('Please select a file and document type');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', user?.userId?.toString() || '');

      await api.post(`/Travel/${travelId}/upload`, formData)

      setMessage('Document uploaded successfully!');
      setSelectedFile(null);
      setDocumentType('');
      onUploadSuccess();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setMessage(error.response?.data?.message || 'Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-900">Upload Document</h4>

      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select document type</option>
            <option value="VISA">Visa</option>
            <option value="BOARDING_PASS">Boarding Pass</option>
            <option value="RECEIPT">Receipt</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile || !documentType}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;
