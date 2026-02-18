import { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../api';

interface NotificationType {
    notificationId: number;
    message: string;
    type: string | null;
    read: boolean;
    createdAt: string; 
}

const Notification = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');

    const fetchNotifications = async () => {
        if (!user?.userId) return; 
        try {
            const response = await api.get(`/Notification/${user.userId}`);
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user?.userId]);

    const handleMarkRead = async (id: number) => {
        try {
            await api.put(`/Notification/${id}/read`); 
            setNotifications(prev => 
                prev.map(n => n.notificationId === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const unreadList = notifications.filter(n => !n.read);
    const readList = notifications.filter(n => n.read);
    const displayList = activeTab === 'unread' ? unreadList : readList;

    if (!user) return <div className="p-6 md:p-10 text-center text-gray-600">Please login to view notifications.</div>;
    if (loading) return <div className="p-6 md:p-10 text-center animate-pulse text-blue-600 font-medium">Loading notifications...</div>;

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-6 md:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Notifications
                </h1>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs md:text-sm font-semibold w-fit">
                    {unreadList.length} Unread
                </div>
            </div>

            <div className="flex border-b border-gray-200 mb-6 w-full">
                <button
                    onClick={() => setActiveTab('unread')}
                    className={`flex-1 sm:flex-none py-3 px-6 text-sm font-bold transition-all border-b-2 outline-none ${
                        activeTab === 'unread' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Unread <span className="ml-1 opacity-70">({unreadList.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('read')}
                    className={`flex-1 sm:flex-none py-3 px-6 text-sm font-bold transition-all border-b-2 outline-none ${
                        activeTab === 'read' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Read <span className="ml-1 opacity-70">({readList.length})</span>
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {displayList.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm md:text-base font-medium">
                            No {activeTab} notifications found.
                        </p>
                    </div>
                ) : (
                    displayList.map((n) => (
                        <div 
                            key={n.notificationId}
                            onClick={() => !n.read && handleMarkRead(n.notificationId)}
                            className={`group relative p-4 md:p-5 rounded-xl border-l-4 transition-all duration-200 shadow-sm active:scale-[0.98] ${
                                n.read 
                                ? 'bg-white border-gray-300 opacity-75' 
                                : 'bg-white border-blue-600 hover:shadow-md cursor-pointer ring-1 ring-blue-50'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2 gap-2">
                                <span className={`text-[10px] md:text-xs font-black uppercase px-2 py-1 rounded-md tracking-wider ${
                                    n.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700'
                                }`}>
                                    {n.type || 'Alert'}
                                </span>
                                <span className="text-[10px] md:text-xs text-gray-400 whitespace-nowrap">
                                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                                </span>
                            </div>
                            
                            <p className={`text-sm md:text-base leading-snug break-words ${
                                n.read ? 'text-gray-500' : 'text-gray-900 font-medium'
                            }`}>
                                {n.message}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notification;
