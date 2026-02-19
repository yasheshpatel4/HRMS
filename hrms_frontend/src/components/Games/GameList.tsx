import { GameCard } from './GameCard';

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
  games: Game[];
  role: string; 
  onSelectGame: (id: number) => void;
  onEditGame: (game: Game) => void; 
}

export const GameList = ({ games, role, onSelectGame, onEditGame }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.length > 0 ? (
        games.map((game) => (
          <GameCard 
            key={game.gameId} 
            game={game} 
            role={role}
            onSelect={onSelectGame} 
            onEdit={onEditGame}
          />
        ))
      ) : (
        <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No games available at the moment.</p>
        </div>
      )}
    </div>
  );
};
