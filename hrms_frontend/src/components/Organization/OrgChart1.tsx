import { useEffect, useState, useMemo } from 'react';
import { OrganizationChart } from 'primereact/organizationchart';
import type { TreeNode } from 'primereact/treenode';
import api from '../../api';
import { useAuth } from '../../Context/AuthContext';

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
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const {user}=useAuth();
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/User/all');
            const userData: User[] = response.data;
            setUsers(userData);
            if (userData.length > 0) setSelectedUserId(user?.userId  || userData[0].userId);
        } catch (err) {
            setError('Failed to load organization chart');
        } finally {
            setLoading(false);
        }
    };

    const buildFocusedHierarchy = (allUsers: User[], targetId: number | null): TreeNode[] => {
        if (!targetId) return [];

        const userMap = new Map<number, User>(allUsers.map(u => [u.userId, u]));
        const targetUser = userMap.get(targetId);
        if (!targetUser) return [];

        const ancestors: User[] = [];
        let curr: User | undefined = userMap.get(targetUser.manager!);
        while (curr) {
            ancestors.unshift(curr);
            curr = curr.manager ? userMap.get(curr.manager) : undefined;
        }

        const subordinates = allUsers.filter(u => u.manager === targetId);

        const createNode = (user: User, children: TreeNode[] = []): TreeNode => {
        const isSelected = user.userId === selectedUserId;
            return {
                expanded: true,
                label: user.name,
                data: user,
                className: `border-round-xl border-2 shadow-2 cursor-pointer transition-colors ${
                    isSelected 
                        ? 'bg-blue-50 border-blue-600' 
                        : 'bg-white border-gray-300 hover:border-blue-500'
                }`,
                children: children
            };
        };

        const targetNode = createNode(targetUser, subordinates.map(sub => createNode(sub)));

        let resultNode = targetNode;
        for (let i = ancestors.length - 1; i >= 0; i--) {
            resultNode = createNode(ancestors[i], [resultNode]);
        }

        return [resultNode];
    };

    const nodeTemplate = (node: TreeNode) => {
        const person = node.data as User;
        const isSelected = person.userId === selectedUserId;

        return (
            <div 
            className={`p-2 flex flex-col items-center border-round-xl border-2 transition-colors w-full h-full ${
                isSelected 
                ? 'bg-blue-50 border-blue-600 shadow-3' 
                : 'bg-white border-gray-300 hover:border-blue-500 shadow-1'
            }`}
            onClick={() => setSelectedUserId(person.userId)}
            >
            <div className="font-bold text-gray-900">{person.name}</div>
            <div className="text-sm text-gray-600 italic">{person.designation}</div>
            <div className="text-xs text-blue-500 mt-1">{person.department}</div>
            </div>
        );
    };

    const focusedData = useMemo(() => buildFocusedHierarchy(users, selectedUserId), [users, selectedUserId]);

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div className="p-6 overflow-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Org Chart</h2>
            <div className="flex justify-center">
                <OrganizationChart value={focusedData} nodeTemplate={nodeTemplate} />
            </div>
        </div>
    );
};

export default OrgChart1;
