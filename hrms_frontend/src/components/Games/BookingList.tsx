import api from '../../api';

interface Booking {
  bookingId: number;
  status: string;

  slot: {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    game:{
      gameName: string;
    }
  };
}

export const BookingList = ({ bookings, onRefresh }: { bookings: Booking[], onRefresh: () => void }) => {
  
  const handleAction = async (id: number, action: 'cancel' | 'complete') => {
    try {
      await api.put(`/Game/booking/${id}/${action}`);
      onRefresh(); 
    } catch (err) {
      console.error(`Failed to ${action} booking:`, err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-400">No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.bookingId} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-900">Slot #{new Date(b.slot.startTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                  })}
                </p>
                <p className="text-sm text-gray-500">{b.slot.game.gameName}</p>
                {/* <p className="text-sm text-gray-500">{b.slot.startTime}</p> */}
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {b.status}
                </span>
              </div>
              <div className="flex gap-2">
                {b.status == 'ACTIVE' && (
                  <>
                    <button 
                      onClick={() => handleAction(b.bookingId, 'complete')}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 transition"
                    >
                      Complete
                    </button>
                    <button 
                      onClick={() => handleAction(b.bookingId, 'cancel')}
                      className="px-4 py-2 border border-red-200 text-red-600 text-sm rounded-xl hover:bg-red-50 transition"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
