import { useState, useMemo } from 'react';
import api from '../../api';

interface Booking {
  bookingId: number;
  status: string;
  bookedBy?: {
    name: string;
    email: string;
   };
  slot: { 
    startTime: string; 
    endTime: string; 
    isAvailable: boolean; 
    game:{
     gameName: string;
    } 
  };
}

export const BookingList = ({ bookings, onRefresh, isAdminMode = false }: { bookings: Booking[], onRefresh: () => void, isAdminMode?: boolean }) => {
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  const groupedBookings = useMemo(() => {
    return bookings.reduce((acc, b) => {
      const gameName = b.slot.game.gameName;
      if (!acc[gameName]) acc[gameName] = [];
      acc[gameName].push(b);
      return acc;
    }, {} as Record<string, Booking[]>);
  }, [bookings]);

  const toggleGame = (gameName: string) => {
    setExpandedGame(expandedGame === gameName ? null : gameName);
  };

  const handleAction = async (id: number, action: 'cancel' | 'complete') => {
    try {
      await api.put(`/Game/booking/${id}/${action}`);
      onRefresh();
    } catch (err) {
      console.error(`Failed to ${action} booking:`, err);
    }
  };

  return (
    <div className="mt-6 space-y-4">

      {Object.entries(groupedBookings).map(([gameName, items]) => (
        <div key={gameName} className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleGame(gameName)}
            className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className={`transform transition-transform duration-200 ${expandedGame === gameName ? 'rotate-90' : ''}`}>
                ▶
              </span>
              <h3 className="font-bold text-gray-800">{gameName}</h3>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? 'Booking' : 'Bookings'}
            </span>
          </button>

          {expandedGame === gameName && (
            <div className="overflow-x-auto border-t">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Time Slot</th>
                    {isAdminMode && <th className="px-6 py-3 text-left">Booked By</th>}
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-sm text-gray-900">
                          {new Date(b.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                        <p className="text-[10px] text-gray-400">ID: #{b.bookingId}</p>
                      </td>
                      
                      {isAdminMode && (
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-700">{b.bookedBy?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{b.bookedBy?.email}</p>
                        </td>
                      )}

                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                          b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {!isAdminMode && b.status === 'ACTIVE' ? (
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleAction(b.bookingId, 'complete')}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition"
                            >
                              Complete
                            </button>
                            <button 
                              onClick={() => handleAction(b.bookingId, 'cancel')}
                              className="px-3 py-1 border border-red-200 text-red-600 text-xs rounded-md hover:bg-red-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p> ... </p>
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

      {bookings.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-sm">No bookings available to display.</p>
        </div>
      )}
    </div>
  );
};
