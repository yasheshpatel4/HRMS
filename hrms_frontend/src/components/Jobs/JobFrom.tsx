import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';

interface JobFormData {
  title: string;
  summary: string;
  hrEmail: string;
  reviewerEmails: string;
  jdFile: FileList;
}

const JobForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<JobFormData>();
  
  const selectedFile = watch("jdFile");

  const onSubmit = async (data: JobFormData) => {
    setLoading(true);
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('summary', data.summary || '');
    formData.append('hrEmail', data.hrEmail);
    
    if (data.jdFile && data.jdFile[0]) {
      formData.append('jdFile', data.jdFile[0]);
    }

    data.reviewerEmails
      .split(',')
      .map(email => email.trim())
      .filter(e => e !== "")
      .forEach(email => formData.append('reviewerEmails', email));

    try {
      const response =await api.post('/Job/create', formData);
      if(response.data !== "Successful")
        alert(response.data);
      else 
        setMessage('Job created successfully!');
      reset();
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
          <input 
            {...register("title", { required: "Title is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">HR Email *</label>
          <input 
            type="email" 
            {...register("hrEmail", { required: "HR Email is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          {errors.hrEmail && <span className="text-red-500 text-xs">{errors.hrEmail.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Emails * (Comma separated)</label>
          <input 
            placeholder="reviewer1@comp.com, reviewer2@comp.com"
            {...register("reviewerEmails", { required: "Reviewer emails are required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          {errors.reviewerEmails && <span className="text-red-500 text-xs">{errors.reviewerEmails.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Summary</label>
          <textarea 
            {...register("summary")}
            rows={3} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description File (JD) *</label>
          <input 
            type="file" 
            {...register("jdFile", { required: "Please upload a JD file" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          {selectedFile && selectedFile[0] && (
            <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile[0].name}</p>
          )}
          {errors.jdFile && <p className="text-red-500 text-xs mt-1">{errors.jdFile.message}</p>}
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
