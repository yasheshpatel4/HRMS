import { Heart, Clock, Users } from 'lucide-react';

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
  onSelect: (id: number) => void;
}

export const GameCard = ({ game, onSelect }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800">{game.gameName}</h3>
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <Heart size={20} />
          </button>
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
          className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          View Slots
        </button>
      </div>
    </div>
  );
};
