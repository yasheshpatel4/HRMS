import { useState } from "react";

export const ConfigModal = ({ game, onClose, onSave }: any) => {
  const [formData, setFormData] = useState(game?.configuration || {
    operatingHoursStart: "09:00",
    operatingHoursEnd: "18:00",
    slotDurationMins: 30,
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
            <input type="number" className="w-full border p-2 rounded" value={formData.slotDurationMins} onChange={e => setFormData({...formData, slotDurationMins: parseInt(e.target.value)})} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-500">Max Players</label>
            <input type="number" className="w-full border p-2 rounded" value={formData.maxPlayers} onChange={e => setFormData({...formData, maxPlayers: parseInt(e.target.value)})} />
          </div>
        </div>
        
        <div className="flex gap-4">
          <button onClick={() => onSave(game.gameId, formData)} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">Apply Tomorrow</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancel</button>
        </div>
      </div>
    </div>
  );
};
