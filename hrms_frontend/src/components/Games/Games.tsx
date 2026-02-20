import { useState, useEffect } from 'react';
import { GameList } from './GameList';
import { GameSlots } from './GameSlots';
import { ConfigModal } from './ConfigModal';
import { GameForm } from './GameForm';
import api from '../../api';
import { useAuth } from '../../Context/AuthContext';
import { BookingList } from './BookingList';

interface Game {
  gameId: number;
  gameName: string;
  configuration?: any;
}

const Games = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [slots, setSlots] = useState([]);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  
  const { user, role } = useAuth();
  const isAdminOrHR = role === 'ADMIN' || role === 'HR';

  useEffect(() => {
    loadGames();
    loadBookings();
  }, []);
  
  const loadGames = () => api.get('/Game/all').then(res => setGames(res.data));
  const loadBookings = () => api.get('/Game/booking/user').then(res => setBookings(res.data));

  const handleSelectGame = (id: number) => {
    setSelectedGameId(id);
    api.get(`/Game/${id}/slots/today`).then(res => setSlots(res.data));
  };

  const handleBookSlot = async (slotId: number, participantIds: number[]) => {
    try {
      await api.post(`/Game/slots/${slotId}/book`, participantIds, {
        params: { userId: user?.userId }
      });
      handleSelectGame(selectedGameId!); 
      loadBookings();
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateGame = async (data: any) => {
    try {

      const gameRes = await api.post('/Game/create', null, {
      params: { gameName: data.gameName }
      });

      const newGameId = gameRes.data.gameId;

      const params = new URLSearchParams();
      params.append('operatingHoursStart', `${data.operatingHoursStart}:00`);
      params.append('operatingHoursEnd', `${data.operatingHoursEnd}:00`);
      params.append('slotDurationMins', data.slotDurationMins.toString());
      params.append('maxPlayers', data.maxPlayers.toString());

      await api.put(`/Game/${newGameId}/configure`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      setShowCreateModal(false);
      loadGames();
    } catch (err) {
      console.error("Creation failed", err);
    }
  };

  const handleSaveConfig = async (gameId: number, config: any) => {
    try {
      const params = new URLSearchParams();
      params.append('operatingHoursStart', config.operatingHoursStart);
      params.append('operatingHoursEnd', config.operatingHoursEnd);
      params.append('slotDurationMins', config.slotDurationMins.toString());
      params.append('maxPlayers', config.maxPlayers.toString());
      
      await api.put(`/Game/${gameId}/configure`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      setEditingGame(null);
      loadGames();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Arena Booking</h1>
            {/* <p className="text-gray-500">Fairness-based scheduling system</p> */}
          </div>
          <div className="flex items-center gap-4">
            {isAdminOrHR && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition shadow-lg"
              >
                + Create Game
              </button>
            )}
            {/* <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {role} Mode
            </span> */}
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2">
            <GameList 
              games={games} 
              role={role} 
              onSelectGame={handleSelectGame} 
              onEditGame={(g) => setEditingGame(g)} 
            />
          </div>
          
          <div className="xl:col-span-3">
            {selectedGameId ? (
              <GameSlots slots={slots} onBook={handleBookSlot} />
            ) : (
              <div className="h-64 border-4 border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-gray-400 font-medium">
                Select a game to check priority status
              </div>
            )}
          </div>
          <div className="xl:col-span-3">
            <BookingList bookings={bookings} onRefresh={loadBookings} />
          </div>
        </div>
      </div>

      {editingGame && (
        <ConfigModal 
          game={editingGame} 
          onClose={() => setEditingGame(null)} 
          onSave={handleSaveConfig} 
        />
      )}

      {showCreateModal && (
        <GameForm 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleCreateGame} 
        />
      )}
    </div>
  );
};

export default Games;
