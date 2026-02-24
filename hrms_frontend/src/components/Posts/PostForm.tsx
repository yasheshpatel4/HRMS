import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { X, Upload } from 'lucide-react';

interface PostFormProps {
  onPostCreated?: () => void;
  onCancel?: () => void;
}

interface PostFormData {
  title: string;
  description: string;
  post: string;
  tags: string;
  visibility: string;
  file: FileList;
}

const PostForm = ({ onPostCreated, onCancel }: PostFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PostFormData>({
    defaultValues: {
      title: '',
      description: '',
      post: '',
      tags: '',
      visibility: 'all employees',
    }
  });

  const selectedFile = watch('file');

  const onSubmit = async (data: PostFormData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', data.title.trim());
    formData.append('description', data.description.trim());
    formData.append('content', data.post);
    formData.append('tags', data.tags.trim());
    
    const visibilityValue = data.visibility === 'all employees' ? 'all' : data.visibility;
    formData.append('visibility', visibilityValue);
    
    if (data.file && data.file[0]) {
      formData.append('file', data.file[0]);
    }

    try {
      await api.post('/Post/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Post created successfully!');
      reset();
      
      if (onPostCreated) onPostCreated();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Create Achievement Post</h2>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Title *</label>
          <input
            {...register('title', { required: true })}
            placeholder="Enter post title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Description</label>
          <textarea
            {...register('description')}
            placeholder="Enter brief description"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Post Content *</label>
          <textarea
            {...register('post', { required: true })}
            placeholder="Write your achievement post here..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Post Image</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">
                  {selectedFile?.[0] ? <span className="text-blue-600 font-medium">{selectedFile[0].name}</span> : "Click to upload an image"}
                </p>
              </div>
              <input type="file" className="hidden" accept="image/*" {...register('file')} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tags</label>
            <input
              {...register('tags')}
              placeholder="e.g., awards, promotion"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Visibility</label>
            <select
              {...register('visibility')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all employees">All Employees</option>
              <option value="department">Department Only</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
