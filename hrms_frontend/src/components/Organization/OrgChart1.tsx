import { useEffect, useState } from 'react';
import { OrganizationChart } from 'primereact/organizationchart';
import type { TreeNode } from 'primereact/treenode';
import api from '../../Api';

export interface User {
  userId: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  manager?: number;
}

const OrgChart1 = () => {
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
    } catch (err) {
      setError('Failed to load organization chart');
    } finally {
      setLoading(false);
    }
  };


  const buildHierarchy = (userData: User[]): TreeNode[] => {
    const userMap = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];

    userData.forEach(u => {
      userMap.set(u.userId, {
        expanded: true,
        label:u.name, 
        data: u, 
        className: 'border-round-xl border-2 border-gray-300 shadow-2 ',    
        children: []
      });
    });

    userMap.forEach((node) => {
      const user = node.data as User;
      const managerId = user.manager;

      if (managerId && userMap.has(managerId)) {
        userMap.get(managerId)!.children?.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const nodeTemplate = (node: TreeNode) => {
    const person = node.data as User;
    return (
      <div className="p-2 flex flex-col items-center">
        <div className="font-bold text-gray-900">{person.name}</div>
        <div className="text-sm text-gray-600 italic">{person.designation}</div>
        <div className="text-xs text-blue-500 mt-1">{person.department}</div>
      </div>
    );
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="p-6 overflow-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Organization Chart</h2>
      <div className="flex justify-center">
        <OrganizationChart 
          value={buildHierarchy(users)} 
          nodeTemplate={nodeTemplate} 
        />
      </div>
    </div>
  );
};

export default OrgChart1;
