import { useAuthStore } from "../stores/useAuthStore";
import { useCarsUiStore } from "../stores/useCarsUiStore";

interface FavoriteButtonProps {
  carId: string;
}

export default function FavoriteButton({ carId }: FavoriteButtonProps) {
  const user = useAuthStore((state) => state.user);

  const toggleFavorite = useCarsUiStore((state) => state.toggleFavorite);
  const favoriteCarIdsByUser = useCarsUiStore(
    (state) => state.favoriteCarIdsByUser,
  );
  const favoriteCarIds = user ? (favoriteCarIdsByUser[user.id] ?? []) : [];
  const isFavorite = favoriteCarIds.includes(carId);

  return (
    <button
      type="button"
      className="btn"
      aria-pressed={isFavorite}
      onClick={() => {
        if (user) {
          toggleFavorite(user.id, carId);
        }
      }}
    >
      {isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
    </button>
  );
}
