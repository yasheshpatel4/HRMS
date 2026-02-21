import { useEffect,useState } from 'react';
import EmployeeNode from './EmployeeNode'
import OrgChart1 from './OrgChart1';
import api from '../../api';

export interface User {
  userId: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  manager?: number | { userId: number };
  subordinates?: User[]; 
}

const OrgChart = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/User/all');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      setError('Failed to load organization chart');
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (users: User[]): User[] => {
        const userMap = new Map<number, User>();
        const roots: User[] = [];

        users.forEach(u => {
            userMap.set(u.userId, { ...u, subordinates: [] });
        });

        userMap.forEach((user) => {

            const managerId= user.manager as number;

            if (managerId) {
            const manager = userMap.get(managerId)!;
            manager.subordinates?.push(user);
            } else {
            roots.push(user);
            }
        });

        return roots;
    };

  if (loading) {
    return <div className="text-center py-8">Loading organization chart...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  const hierarchy = buildHierarchy(users);

  return (
    <div className="space-y-6">
      <OrgChart1/>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Organization List</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        {hierarchy.length > 0 ? (
          <div className="space-y-4">
            {hierarchy.map(root => (
              <EmployeeNode key={root.userId} employee={root} level={0} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No employees found
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgChart;
