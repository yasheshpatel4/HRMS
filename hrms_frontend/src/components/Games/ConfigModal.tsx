import { useState } from "react";

export const ConfigModal = ({ game, onClose, onSave }: any) => {
  const [error, setError] = useState("");

  const handleSave = () => {
    const validationError = validate(); 
    
    if (validationError) {
      alert(validationError);
    } else {
      onSave(game.gameId, formData);
    }
  };

  const validate = () => {
    const { maxPlayers, slotDurationMins, operatingHoursStart: start, operatingHoursEnd: end } = formData;
    
    const getMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const startMins = getMinutes(start);
    const endMins = getMinutes(end);
    const windowDuration = endMins - startMins;
    let errorMsg = "";

    if (maxPlayers < 1) {
      errorMsg = "At least 1 player required";
    } else if (endMins <= startMins) {
      errorMsg = "End time must be after start time";
    } else if (windowDuration < slotDurationMins) {
      errorMsg = "Operating window too short for slot duration";
    } else if (slotDurationMins < 10) {
      errorMsg = "Duration must be greater than 10 min";
    }

    setError(errorMsg); 
    return errorMsg;
  };

  
  const [formData, setFormData] = useState(game?.configuration || {
    operatingHoursStart: "10:00",
    operatingHoursEnd: "18:00",
    slotDurationMins: 60,
    maxPlayers: 4
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-2">Update {game?.gameName}</h2>
        <p className="text-sm text-amber-600 mb-6 font-medium">Changes will take effect from tomorrow.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-bold uppercase text-gray-500">Start Time</label>
            <input type="time" className="w-full border p-2 rounded" value={formData.operatingHoursStart} onChange={e => setFormData({...formData, operatingHoursStart: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-500">End Time</label>
            <input type="time" className="w-full border p-2 rounded" value={formData.operatingHoursEnd} onChange={e => setFormData({...formData, operatingHoursEnd: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-500">Duration (Mins)</label>
            <input type="number" className="w-full border p-2 rounded" value={formData.slotDurationMins} min="10" onChange={e => setFormData({...formData, slotDurationMins: Number(e.target.value)})} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-500">Max Players</label>
            <input type="number" className="w-full border p-2 rounded" value={formData.maxPlayers} min="1" onChange={e => setFormData({...formData, maxPlayers: Number(e.target.value)})} />
          </div>
        </div>
        
        <div className="flex gap-4">
          <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">Apply Tomorrow</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancel</button>
        </div>
      </div>
    </div>
  );
};




