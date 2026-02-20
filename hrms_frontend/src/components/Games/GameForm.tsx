import { useForm } from 'react-hook-form';

interface GameFormData {
  gameName: string;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  slotDurationMins: number;
  maxPlayers: number;
}

export const GameForm = ({ onClose, onSave }: { onClose: () => void, onSave: (data: GameFormData) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<GameFormData>({
    defaultValues: {
      operatingHoursStart: '09:00',
      operatingHoursEnd: '18:00',
      slotDurationMins: 60,
      maxPlayers: 4
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Game</h2>
        
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Game Name</label>
            <input 
              {...register("gameName", { required: "Game name is required" })}
              className={`w-full p-3 bg-gray-50 border ${errors.gameName ? 'border-red-500' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., Table Tennis"
            />
            {errors.gameName && <p className="text-red-500 text-xs mt-1">{errors.gameName.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input type="time" {...register("operatingHoursStart", { required: true })} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input type="time" {...register("operatingHoursEnd", { required: true })} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Mins)</label>
              <input type="number" {...register("slotDurationMins", { required: true, min: 15 })} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Players</label>
              <input type="number" {...register("maxPlayers", { required: true, min: 1 })} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200">
              Create Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
