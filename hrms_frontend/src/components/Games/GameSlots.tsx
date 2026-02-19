import { Calendar } from 'lucide-react';

interface Slot {
  slotId: number;
  startTime: string;
  endTime: string;
  available: boolean;
}

export const GameSlots = ({ slots, onBook }: { slots: Slot[], onBook: (id: number) => void }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="text-blue-600" />
        <h2 className="text-lg font-semibold">Available Slots</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slots.map((slot) => (
          <button
            key={slot.slotId}
            disabled={!slot.available}
            onClick={() => onBook(slot.slotId)}
            className={`p-3 rounded-md text-center text-sm font-medium transition-all
              ${slot.available 
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </button>
        ))}
      </div>
    </div>
  );
};
