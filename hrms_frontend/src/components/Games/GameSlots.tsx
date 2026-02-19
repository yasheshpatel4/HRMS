import { useState } from 'react';
import { Calendar, UserPlus, X } from 'lucide-react';

interface Slot {
  slotId: number;
  startTime: string;
  available: boolean;
}

export const GameSlots = ({ slots, onBook }: { slots: Slot[], onBook: (id: number, pIds: number[]) => void }) => {
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [participantInput, setParticipantInput] = useState("");

  const handleBookingConfirm = () => {
    const pIds = participantInput.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (bookingSlot) onBook(bookingSlot.slotId, pIds);
    setBookingSlot(null);
    setParticipantInput("");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="text-blue-600" />
        <h2 className="text-lg font-semibold">Today's Live Slots</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slots.map((slot) => (
          <button
            key={slot.slotId}
            onClick={() => setBookingSlot(slot)}
            className={`p-3 rounded-md text-center text-sm font-medium border transition-all
              ${slot.available 
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'}`}
          >
            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {!slot.available && <span className="block text-[10px] font-bold opacity-70">CONTESTABLE</span>}
          </button>
        ))}
      </div>

      {/* Participant Selection Modal */}
      {bookingSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="text-blue-600" /> Confirm Booking
              </h3>
              <button onClick={() => setBookingSlot(null)}><X /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {!bookingSlot.available && "Note: This slot is currently occupied. You can displace them if you have a higher fairness priority."}
            </p>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Participant User IDs (Comma separated)</label>
            <input 
              autoFocus
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 outline-none transition-all mb-6"
              placeholder="e.g. 104, 115, 201"
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
            />
            <button 
              onClick={handleBookingConfirm}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              Check Availability & Book
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
