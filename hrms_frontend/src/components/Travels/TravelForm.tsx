import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../Api';

interface User {
  userId: number;
  name: string;
  email: string;
  department: string;
}

interface TravelFormData {
  title: string;
  description: string;
  budget:number;
  startDate: string;
  endDate: string;
  assignedUserIds: number[];
}

interface TravelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TravelForm = ({ isOpen, onClose, onSuccess }: TravelFormProps) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<TravelFormData>({
    title: '',
    description: '',
    budget:0,
    startDate: '',
    endDate: '',
    assignedUserIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/User/all');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserSelection = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      assignedUserIds: prev.assignedUserIds.includes(userId)
        ? prev.assignedUserIds.filter(id => id !== userId)
        : [...prev.assignedUserIds, userId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate || formData.assignedUserIds.length == 0) {
      setMessage('Please fill all required fields and assign at least one user');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setMessage('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const travelData = {
        ...formData,
        budget: Number(formData.budget),
        createdBy: { userId: user?.userId },
        assignedUsers: formData.assignedUserIds.map(id => ({ userId: id })),
      };

      await api.post('/Travel/add', travelData);

      setMessage('Travel created successfully!');
      setFormData({
        title: '',
        description: '',
        budget:0,
        startDate: '',
        endDate: '',
        assignedUserIds: [],
      });
      onSuccess();
      setTimeout(() => {
        onClose();
        setMessage('');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating travel:', error);
      setMessage(error.response?.data?.message || 'Error creating travel');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Travel</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter travel title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter travel description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget
            </label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter travel budget"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Employees *
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
              {users.map((user) => (
                <div key={user.userId} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id={`user-${user.userId}`}
                    checked={formData.assignedUserIds.includes(user.userId)}
                    onChange={() => handleUserSelection(user.userId)}
                    className="rounded"
                  />
                  <label htmlFor={`user-${user.userId}`} className="text-sm text-gray-700">
                    {user.name} - {user.department} ({user.email})
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Selected: {formData.assignedUserIds.length} employees
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Travel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TravelForm;
