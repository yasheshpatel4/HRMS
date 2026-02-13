import { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
// import TravelForm from './TravelForm';
import TravelList from './TravelList';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
const Travel = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'travels' | 'expenses'>('travels');

  const tabs = [
    { id: 'travels', label: 'Travel Assignments', roles: ['EMPLOYEE', 'MANAGER', 'HR'] },
    { id: 'expenses', label: 'Expense Management', roles: ['EMPLOYEE', 'MANAGER', 'HR'] },
  ];

  const filteredTabs = tabs.filter(tab => tab.roles.includes(role));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Travel & Expenses</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {filteredTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'travels' && <TravelList />}
        {activeTab === 'expenses' && (
          <div className="space-y-8">
            {role === 'EMPLOYEE' && <ExpenseForm />}
            <ExpenseList />
          </div>
        )}
      </div>
    </div>
  );
};

export default Travel;
