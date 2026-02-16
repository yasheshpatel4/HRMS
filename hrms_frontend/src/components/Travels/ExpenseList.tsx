import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../Api';

interface Expense {
  expenseId: number;
  travel: Travel;
  userId: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  hrRemarks?: string;
  submittedAt: string;
  approvedAt?: string;
}

interface Travel {
  travelId: number;
  destination: string;
}

const ExpenseList = () => {
  const { user, role } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [travels, setTravels] = useState<Map<number, Travel>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [proofUrls, setProofUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchExpenses();
  }, [user, role]);

  const fetchExpenses = async () => {
    try {
      let response;
      if (role === 'HR') {
        response = await api.get('/Travel/Expense/all');
      } else {
        const travelResponse = await api.get(`/Travel/user/${user?.userId}`);
        const userTravels = travelResponse.data;

        const allExpenses: Expense[] = [];
        for (const travel of userTravels) {
          try {
            const expenseResponse = await api.get(`/Travel/Expense/${user?.userId}/${travel.travelId}`);
            if (expenseResponse.data) {
              allExpenses.push(...expenseResponse.data);
            }
          } catch (error) {

          }
        }
        response = { data: allExpenses };
      }
      console.log(response.data);
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

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'ALL') return true;
    return expense.status === filter;
  });

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
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.expenseId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {travels.get(expense.travel.travelId)?.destination || `Travel ${expense.travel.travelId}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${expense.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{expense.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => viewProofs(expense.expenseId)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Proofs
                    </button>
                    {role === 'HR' && expense.status === 'SUBMITTED' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(expense.expenseId, 'APPROVED')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(expense.expenseId, 'REJECTED')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
