import { Heart, Clock, Users, Settings } from 'lucide-react';

interface Game {
  gameId: number;
  gameName: string;
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
  const isAdmin = role == 'ADMIN' || role == 'HR';
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 p-5">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-gray-800">{game.gameName}</h3>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={() => onEdit(game)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors">
              <Settings size={20} />
            </button>
          )}
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <Heart size={20} />
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
