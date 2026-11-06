import { useCarsUiStore } from '../stores/useCarsUiStore';

interface FavoriteButtonProps {
  carId: string;
}

export default function FavoriteButton({ carId }: FavoriteButtonProps) {
  const isFavorite = useCarsUiStore((state) => state.favoriteIds.includes(carId));
  const toggleFavorite = useCarsUiStore((state) => state.toggleFavorite);

  return (
    <button
      type="button"
      className="btn"
      aria-pressed={isFavorite}
      onClick={() => toggleFavorite(carId)}
    >
      {isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
    </button>
  );
}
