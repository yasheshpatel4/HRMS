import { useState } from 'react';
import type { User } from './OrgChart';


interface EmployeeNodeProps {
  employee: User;
  level: number;
}

const EmployeeNode = ({ employee, level }:EmployeeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`ml-${level * 6} border-l-2 border-gray-300 pl-4`}>
      <div className="flex items-center space-x-2 py-2">
        {employee.subordinates && employee.subordinates.length > 0 && (
          <button
            onClick={toggleExpanded}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        <div className="bg-blue-100 rounded-full p-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {employee.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{employee.name}</h3>
          <p className="text-sm text-gray-600">{employee.designation} - {employee.department}</p>
          <p className="text-xs text-gray-500">{employee.email}</p>
        </div>
      </div>

      {isExpanded && employee.subordinates && employee.subordinates.length > 0 && (
        <div className="ml-4">
          {employee.subordinates.map(sub=>(
            <EmployeeNode key={sub.userId} employee={sub} level={level+1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeNode;