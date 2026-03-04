import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../api';
import { X } from 'lucide-react';

interface Travel {
  travelId: number;
  title: string;
  startDate: string;
  endDate: string;
}

interface ExpenseFormData {
  travelId: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ExpenseFormProps {
  preSelectedTravelId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ preSelectedTravelId, onSuccess, onCancel }) => {
  const { user } = useAuth();

  const [travels, setTravels] = useState<Travel[]>([]);
  const [formData, setFormData] = useState<ExpenseFormData>({
    travelId: preSelectedTravelId || 0,
    amount: 0,
    category: '',
    description: '',
    date: '',
  });
  const [budgetInfo, setBudgetInfo] = useState<{
    budget: number;
    totalExpense: number;
    remainingBudget: number;
    canSubmit: boolean;
  } | null>(null);

  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTravels();
  }, []);

  const fetchTravels = async () => {
    try {
      const response = await api.get(`/Travel/user/${user?.userId}`); 
      
      const currentDate = new Date();
      const eligibleTravels = response.data.filter((travel: Travel) => {
        const startDate = new Date(travel.startDate);
        const endDate = new Date(travel.endDate);
        const extendedEndDate = new Date(endDate);
        extendedEndDate.setDate(extendedEndDate.getDate() + 10);
        return currentDate >= startDate && currentDate <= extendedEndDate;
      });
      setTravels(eligibleTravels);
    } catch (error) {
      console.error('Error fetching travels:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'travelId' || name === 'amount' ? Number(value) : value,
    }));
  };

  useEffect(() => {
    if (formData.travelId && user?.userId) {
      fetchBudgetInfo();
    }
  }, [formData.travelId]);

  const fetchBudgetInfo = async () => {
    try {
      const response = await api.get(`/Travel/Expense/${user?.userId}/${formData.travelId}/budget-info`);
      setBudgetInfo(response.data);
    } catch (error) {
      console.error('Error fetching budget info:', error);
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setProofFiles((prev) => [...prev, ...newFiles]);
      
      e.target.value = ""; 
    }
  };

  const removeFile = (indexToRemove: number) => {
    setProofFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.travelId || !formData.amount || proofFiles.length === 0) {
      setMessage('Please fill all fields and upload proof');
      return;
    }

    if (budgetInfo) {
      const newTotal = budgetInfo.totalExpense + formData.amount;
      if (newTotal > budgetInfo.budget) {
        alert(`Cannot submit expense. Total expense ($${newTotal.toFixed(2)}) would exceed the budget ($${budgetInfo.budget.toFixed(2)}). Remaining budget: $${budgetInfo.remainingBudget.toFixed(2)}`);
        return;
      }
    }

    setLoading(true);
    try {

      const data = new FormData();
      data.append('amount', formData.amount.toString());
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('travelId', formData.travelId.toString());
      data.append('date',formData.date.toString());

      const expenseResponse = await api.post('/Travel/Expense/submit', data);
      const expenseId = expenseResponse.data.expenseId;

      for (const file of proofFiles) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        await api.post(`/Travel/Expense/${expenseId}/upload-proof`, formDataUpload);
      }

      setMessage('Expense submitted successfully!');
      setFormData({ travelId: preSelectedTravelId || 0, amount: 0, category: '', description: '', date: '' });
      setProofFiles([]);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error submitting expense');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Travel Expense</h2>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Travel *
          </label>
          <select
            name="travelId"
            value={formData.travelId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!!preSelectedTravelId}
          >
            <option value={0}>Choose a travel</option>
            {travels.map((travel) => (
              <option key={travel.travelId} value={travel.travelId}>
                {travel.title}...({new Date(travel.startDate).toLocaleDateString()} - {new Date(travel.endDate).toLocaleDateString()})
              </option>
            ))}
          </select>
          {preSelectedTravelId && (
            <p className="text-sm text-gray-500 mt-1">Travel pre-selected from travel card</p>
          )}
        </div>

        {budgetInfo && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Budget Information</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Budget</p>
                <p className="font-semibold">${budgetInfo.budget.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Used</p>
                <p className="font-semibold">${budgetInfo.totalExpense.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Remaining</p>
                <p className={`font-semibold ${budgetInfo.remainingBudget < formData.amount ? 'text-red-600' : 'text-green-600'}`}>
                  ${budgetInfo.remainingBudget.toFixed(2)}
                </p>
              </div>
            </div>
            {budgetInfo.remainingBudget < formData.amount && (
              <p className="text-red-600 text-sm mt-2">
                Insufficient budget!!
              </p>
            )}
          </div>
        )}


        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select category</option>
              <option value="FLIGHT">Flight</option>
              <option value="HOTEL">Hotel</option>
              <option value="MEALS">Meals</option>
              <option value="TRANSPORT">Transport</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the expense..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proof Documents * (At least one required)
          </label>
          
          <div className="space-y-3">
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 border border-gray-300 rounded-md p-1"
              />
            </div>
            {proofFiles.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Selected Files ({proofFiles.length})
                </p>
                <ul className="space-y-2">
                  {proofFiles.map((file, index) => (
                    <li 
                      key={index} 
                      className="flex items-center justify-between bg-white p-2 rounded border border-gray-100 text-sm shadow-sm animate-in fade-in slide-in-from-left-1"
                    >
                      <span className="truncate max-w-[80%] text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (budgetInfo !== null && budgetInfo.remainingBudget < formData.amount)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Expense'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ExpenseForm;
