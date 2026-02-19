import { useState, useEffect } from 'react';
import { GameList } from './GameList';
import { GameSlots } from './GameSlots';
import api from '../../api';

const Games = () => {
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    api.get('/Game/all').then(res => setGames(res.data));
  }, []);

  const handleSelectGame = (id: number) => {
    setSelectedGameId(id);
    
    api.get(`/Game/${id}/slots/available`).then(res => setSlots(res.data));
  };

  const handleBookSlot = (slotId: number) => {
    alert(`Booking slot ${slotId}...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Game Center</h1>
          <p className="text-gray-500">Book your favorite activities.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <GameList games={games} onSelectGame={handleSelectGame} />
          </div>
          
          <div className="lg:col-span-2">
            {selectedGameId && (
              <GameSlots slots={slots} onBook={handleBookSlot} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
