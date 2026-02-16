import React, { useState} from 'react';
import api from '../../Api';

interface JobFormData {
  title: string;
  summary: string;
  hrEmail: string;
  reviewerEmails: string;
}

const JobForm = () => {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    summary: '',
    hrEmail: '',
    reviewerEmails: '',
  });
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJdFile(e.target.files[0]);
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jdFile) {
        setMessage('Please upload a Job Description file');
        return;
    }

    setLoading(true);
    const data = new FormData();

    data.append('title', formData.title);
    data.append('summary', formData.summary);
    data.append('hrEmail', formData.hrEmail);
    data.append('jdFile', jdFile);

    const emailList = formData.reviewerEmails
        .split(',')
        .map(email => email.trim())
        .filter(e => e !== "");
    emailList.forEach(email => data.append('reviewerEmails', email));

    try {
        await api.post('/Job/create', data);

        setMessage('Job created successfully!');
        setFormData({ title: '', summary: '', hrEmail: '', reviewerEmails: '' });
        setJdFile(null);
    } catch (error: any) {
        setMessage(error.response?.data?.message || 'Error creating job');
    } finally {
        setLoading(false);
    }
    };


  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Job Posting</h2>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">HR Email *</label>
          <input
            type="email"
            name="hrEmail"
            value={formData.hrEmail}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Emails * (Comma separated)</label>
          <input
            type="text"
            name="reviewerEmails"
            value={formData.reviewerEmails}
            onChange={handleInputChange}
            placeholder="reviewer1@comp.com, reviewer2@comp.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Summary</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description File (JD) *</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {jdFile && <p className="text-sm text-gray-600 mt-2">Selected: {jdFile.name}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {loading ? 'Processing & Uploading...' : 'Create Job'}
        </button>
      </form>
    </div>
  );
};

export default JobForm;
