import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../api';
import { Edit2, Trash2 } from 'lucide-react';

interface Expense {
  expenseId: number;
  travel: Travel;
  userId: number;
  user?: {
    userId: number;
    name: string;
    email: string;
  };
  amount: number;
  category: string;
  description: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  hrRemarks?: string;
  submittedAt: string;
  approvedAt?: string;
}


interface Travel {
  travelId: number;
  title: string;
}

const ExpenseList = () => {
  const { user, role } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [travels, setTravels] = useState<Map<number, Travel>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [proofUrls, setProofUrls] = useState<string[]>([]);
  const [expandedTravel, setExpandedTravel] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, [user, role]);

  const fetchExpenses = async () => {
    try {
      let response;
      if (role === 'HR') {
        response = await api.get(`/Travel/Expense/hr/${user?.userId}`);
      } else if(role==='ADMIN' || role === 'MANAGER'){
        response = await api.get(`/Travel/Expense/all`);
      } 
      else {
        const travelResponse = await api.get(`/Travel/user/${user?.userId}`);
        const userTravels = travelResponse.data;

        const allExpenses: Expense[] = [];
        for (const travel of userTravels) {
          try {
            const expenseResponse = await api.get(`/Travel/Expense/${user?.userId}/${travel.travelId}`);
            if (expenseResponse.data) {
              const myOwnExpenses = expenseResponse.data.filter(
              (exp: Expense) => exp.user?.userId === user?.userId
              );
        
              allExpenses.push(...myOwnExpenses);
            }
          } catch (error) {
              console.log(error);
          }
        }
        response = { data: allExpenses };
      }
      setExpenses(response.data);

      const travelMap = new Map<number, Travel>();
      const uniqueTravelIds = [...new Set(response.data.map((exp: Expense) => exp.travel.travelId))];

      for (const travelId of uniqueTravelIds) {
        try {
          const travelResponse = await api.get(`/Travel/${travelId}`);
          if (travelResponse.data) {
            travelMap.set(travelId?0:0, travelResponse.data);
          }
        } catch (error) {
          console.error(`Error fetching travel ${travelId}:`, error);
        }
      }
      setTravels(travelMap);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (expenseId: number, newStatus: 'APPROVED' | 'REJECTED', remarks?: string) => {
    try {
      if (newStatus === 'APPROVED') {
        await api.put(`/Travel/Expense/approve/${expenseId}`)
      } else {
        await api.put(`/Travel/Expense/reject/${expenseId}`, { remarks });
      }
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense status:', error);
    }
  };

  const viewProofs = async (expenseId: number) => {
    try {
      const response = await api.get(`/Travel/Expense/${expenseId}/proofs`);
      setProofUrls(response.data);
      setSelectedExpense(expenses.find(exp => exp.expenseId == expenseId) || null);
    } catch (error) {
      console.error('Error fetching proofs:', error);
    }
  };

  const handleDelete = async (expenseId: number) => {
    if (window.confirm("Are you sure you want to delete this travel expense?")) {
        try {
          await api.delete(`/Travel/Expense/${expenseId}`);
          await fetchExpenses();
        } catch (error) {
          console.error('Error fetching proofs:', error);
        }
    }
  };
  const handleUpdate = async (expenseId: number) => {
    console.log(expenseId);
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'ALL') return true;
    return expense.status === filter;
  });

   const groupedExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const title = expense.travel.title;
      
      if (!acc[title]) acc[title] = [];
      acc[title].push(expense);
      return acc;
    }, {} as Record<string, typeof filteredExpenses>);
  }, [filteredExpenses, travels]);

  const toggleTravel = (title: string) => {
    setExpandedTravel(expandedTravel === title ? null : title);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading expenses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Travel Expenses</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Expenses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedExpenses).map(([title, items]) => (
          <div key={title} className="border rounded-lg bg-white shadow-sm overflow-hidden">
            <button 
              onClick={() => toggleTravel(title)}
              className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className={`transform transition-transform duration-200 ${expandedTravel === title ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                <h3 className="font-bold text-gray-800">{title}</h3>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-blue-600">
                  Total: ${items.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {items.length} Expense{items.length !== 1 ? 's' : ''}
                </span>
              </div>
            </button>

            {expandedTravel === title && (
              <div className="overflow-x-auto border-t">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {(role === 'HR' || role === 'ADMIN' || role === 'MANAGER') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((expense) => (
                      <tr key={expense.expenseId} className="hover:bg-gray-50">
                        {(role === 'HR' || role === 'ADMIN' || role === 'MANAGER') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{expense.user?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">ID: {expense.user?.userId || expense.userId}</div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ${expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{expense.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(expense.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button onClick={() => viewProofs(expense.expenseId)} className="text-blue-600 hover:text-blue-900">
                            View Proofs
                          </button>
                          {(role === 'HR' || role === 'MANAGER') && expense.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleStatusChange(expense.expenseId, 'APPROVED')} className="text-green-600 hover:text-green-900 font-bold">Approve</button>
                              <button onClick={() => handleStatusChange(expense.expenseId, 'REJECTED')} className="text-red-600 hover:text-red-900 font-bold">Reject</button>
                            </>
                          )}
                          {role === 'EMPLOYEE' && expense.status === 'PENDING' && (
                            <div className="flex space-x-1">
                              <button onClick={() => handleUpdate(expense.expenseId)} className="text-blue-600 hover:text-blue-700 transition-colors">
                                <Edit2 size={18} />
                              </button>
                              <button onClick={() => handleDelete(expense.expenseId)} className="text-red-600 hover:text-red-700 transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No expenses found
          </div>
        )}
      </div>

      {selectedExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Expense Proofs - ${selectedExpense.amount.toFixed(2)} ({selectedExpense.category})
              </h3>
              <button
                onClick={() => setSelectedExpense(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">{selectedExpense.description}</p>
              {selectedExpense.hrRemarks && (
                <p className="text-sm text-red-600 mt-2">HR Remarks: {selectedExpense.hrRemarks}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proofUrls.map((url, index) => (
                <div key={index} className="border rounded-lg p-2">
                  {url.toLowerCase().includes('.pdf') ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <a
                        href={`${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View PDF
                      </a>
                    </div>
                  ) : (
                    <img
                      src={`${url}`}
                      alt={`Proof ${index + 1}`}
                      className="w-full h-48 object-cover rounded cursor-pointer"
                      onClick={() => window.open(`${url}`, '_blank')}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
