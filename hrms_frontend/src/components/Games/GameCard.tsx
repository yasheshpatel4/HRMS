import { useState } from 'react';
import { Heart, Clock, Users, Settings } from 'lucide-react';
import api from '../../api';

interface Game {
  gameId: number;
  gameName: string;
  isInterested?: boolean;
  configuration?: {
    operatingHoursStart: string;
    operatingHoursEnd: string;
    maxPlayers: number;
  };
}

interface Props {
  game: Game;
  role: string;
  onSelect: (id: number) => void;
  onEdit: (game: Game) => void;
}

export const GameCard = ({ game, role, onSelect, onEdit }: Props) => {
  const [isInterested, setIsInterested] = useState(game.isInterested || false);
  const isAdmin = role === 'ADMIN' || role === 'HR';

  const toggleInterest = async () => {
    const method = isInterested ? 'DELETE' : 'POST';
    
    try {
      await api(`/Game/${game.gameId}/interest`, {
        method: method,
        headers: { 'Content-Type': 'application/json' }
      });
      setIsInterested(!isInterested);
    } catch (error) {
      console.error("Failed to update interest:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 p-5">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-gray-800">{game.gameName}</h3>
        <div className="flex gap-2">
          {isAdmin && (
            <button 
              onClick={() => onEdit(game)} 
              className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
            >
              <Settings size={20} />
            </button>
          )}
          <button 
            onClick={toggleInterest}
            className={`transition-colors p-1.5 rounded-full ${
              isInterested ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
            }`}
          >
            <Heart size={20} fill={isInterested ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {game.configuration && (
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{game.configuration.operatingHoursStart} - {game.configuration.operatingHoursEnd}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>Max {game.configuration.maxPlayers} Players</span>
          </div>
        </div>
      )}

      <button 
        onClick={() => onSelect(game.gameId)} 
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
      >
        View Slots
      </button>
    </div>
  );
};
