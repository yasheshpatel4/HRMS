import { useCallback, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { X } from 'lucide-react';
import TravelList from './TravelList';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
const Travel = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'travels' | 'expenses'>('travels');
  const [preSelectedId, setPreSelectedId] = useState<number | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleQuickSubmit = (travelId: number) => {
    setPreSelectedId(travelId); 
    setActiveTab('expenses');
    setShowForm(true);
  };
  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const tabs = [
    { id: 'travels', label: 'Travel Assignments', roles: ['EMPLOYEE', 'MANAGER', 'HR','ADMIN'] },
    { id: 'expenses', label: 'Expense Management', roles: ['EMPLOYEE', 'MANAGER', 'HR','ADMIN'] },
  ];

  const filteredTabs = tabs.filter(tab => tab.roles.includes(role));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Travel & Expenses</h1>
        
        {activeTab === 'expenses' && role === 'EMPLOYEE' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              showForm 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            }`}
          >
            {showForm ? <><X size={18} /> Cancel</> : <> Submit Expense</>}
          </button>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {filteredTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'travels') setShowForm(false);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
        {activeTab === 'travels' && (
          <TravelList onNavigateToExpense={handleQuickSubmit} />
        )}
        
        {activeTab === 'expenses' && (
          <div className="space-y-8">
            {role === 'EMPLOYEE' && showForm && (
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <ExpenseForm 
                  preSelectedTravelId={preSelectedId} 
                  onSuccess={() => {
                    setPreSelectedId(undefined);
                    setShowForm(false); 
                    triggerRefresh();
                  }}
                  onCancel={()=>setShowForm(false)}
                />
              </div>
            )}           
            <ExpenseList key={refreshKey} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Travel;
