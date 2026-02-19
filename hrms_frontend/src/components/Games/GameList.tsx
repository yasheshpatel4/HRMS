import { GameCard } from './GameCard';

interface Props {
  games: any[];
  onSelectGame: (id: number) => void;
}

export const GameList = ({ games, onSelectGame }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <GameCard key={game.gameId} game={game} onSelect={onSelectGame} />
      ))}
    </div>
  );
};
