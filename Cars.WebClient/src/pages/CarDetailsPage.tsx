import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';

import CarPhotoUpload from '../components/CarPhotoUpload';
import FavoriteButton from '../components/FavoriteButton';
import { bodyTypeLabel, fuelTypeLabel } from '../models/carOptions';
import { deleteCarPhoto, getCarById } from '../services/carService';
import { queryKeys } from '../queries/queryKeys';
import { useAuthStore } from '../stores/useAuthStore';

export default function CarDetailsPage() {
  // ========================================================
  // ROUTING
  // ========================================================

  const { id } = useParams();
  // Jeżeli id nie istnieje, query nie zostanie wykonane (enabled).
  const carId = id ?? '';

  const queryClient = useQueryClient();

  // ========================================================
  // UŻYTKOWNIK
  // ========================================================

  const user = useAuthStore((state) => state.user);
  // Przycisk usuwania zdjęcia tylko dla admina.
  // Właściwe zabezpieczenie nadal znajduje się po stronie backendu.
  const isAdmin = user?.roles.includes('Admin') ?? false;

  // ========================================================
  // TANSTACK QUERY -- SZCZEGÓŁY SAMOCHODU
  // ========================================================

  const {
    data: car,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.car(carId),
    queryFn: ({ signal }) => getCarById(carId, signal),
    enabled: Boolean(id),
  });

  // ========================================================
  // TANSTACK QUERY -- USUWANIE ZDJĘCIA
  // ========================================================

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => deleteCarPhoto(carId, photoId),

    // Po usunięciu zdjęcia dane samochodu w cache są nieaktualne.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.car(carId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cars });
    },
  });

  function handleDeletePhoto(photoId: string) {
    const confirmed = window.confirm('Czy na pewno chcesz usunąć to zdjęcie?');
    if (!confirmed) {
      return;
    }
    deletePhotoMutation.mutate(photoId);
  }

  const backLink = (
    <Link className="btn" to="/cars">
      Wróć do listy
    </Link>
  );

  // ========================================================
  // STANY
  // ========================================================

  if (!id) {
    return (
      <section>
        <h1>Błąd</h1>
        <p className="alert alert-danger">Brak identyfikatora samochodu.</p>
        {backLink}
      </section>
    );
  }

  if (isPending) {
    return (
      <section>
        <p>Ładowanie samochodu...</p>
        <progress />
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <h1>Błąd</h1>
        <p className="alert alert-danger">{error.message}</p>
        {backLink}
      </section>
    );
  }

  // Najpierw zdjęcie oznaczone jako główne, a jeśli go nie ma – pierwsze.
  const mainPhoto = car.photos.find((photo) => photo.isMain) ?? car.photos[0];

  // ========================================================
  // WIDOK
  // ========================================================

  return (
    <section>
      <div className="page-header">
        <h1>
          {car.brand} {car.model}
        </h1>
        <FavoriteButton carId={car.id} />
      </div>

      {deletePhotoMutation.isError && (
        <p className="alert alert-danger">{deletePhotoMutation.error.message}</p>
      )}

      <div className="details-layout">
        <div className="main-photo">
          {mainPhoto ? (
            <img src={mainPhoto.url} alt={`${car.brand} ${car.model}`} />
          ) : (
            <span>Brak zdjęcia</span>
          )}
        </div>

        <fieldset>
          <legend>Dane samochodu</legend>
          <dl className="details">
            <dt>Marka</dt>
            <dd>{car.brand}</dd>
            <dt>Model</dt>
            <dd>{car.model}</dd>
            <dt>Liczba drzwi</dt>
            <dd>{car.doorsNumber}</dd>
            <dt>Pojemność bagażnika</dt>
            <dd>{car.luggageCapacity} l</dd>
            <dt>Pojemność silnika</dt>
            <dd>{car.engineCapacity} cm³</dd>
            <dt>Rodzaj paliwa</dt>
            <dd>{fuelTypeLabel(car.fuelType)}</dd>
            <dt>Data produkcji</dt>
            <dd>{car.productionDate.substring(0, 10)}</dd>
            <dt>Średnie spalanie</dt>
            <dd>{car.averageFuelConsumption} l/100 km</dd>
            <dt>Typ nadwozia</dt>
            <dd>{bodyTypeLabel(car.bodyType)}</dd>
          </dl>
        </fieldset>
      </div>

      <fieldset>
        <legend>Wyposażenie</legend>
        {car.features.length === 0 ? (
          <p>Brak przypisanego wyposażenia.</p>
        ) : (
          <ul className="chips">
            {car.features.map((feature) => (
              <li className="chip" key={feature.id}>
                {feature.name}
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset>
        <legend>Galeria zdjęć ({car.photos.length})</legend>
        {car.photos.length === 0 ? (
          <p>Brak zdjęć samochodu.</p>
        ) : (
          <div className="gallery">
            {car.photos.map((photo) => (
              <figure className="gallery-item" key={photo.id}>
                <a href={photo.url} target="_blank" rel="noreferrer">
                  <img src={photo.url} alt={`Zdjęcie ${car.brand} ${car.model}`} />
                </a>
                <figcaption>
                  {photo.isMain && <span className="chip chip-primary">Główne</span>}
                  {isAdmin && (
                    <button
                      type="button"
                      className="danger"
                      disabled={deletePhotoMutation.isPending}
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      Usuń
                    </button>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </fieldset>

      <CarPhotoUpload carId={car.id} />

      <div className="actions">
        <Link className="btn" to={`/cars/${car.id}/edit`}>
          Edytuj
        </Link>
        {backLink}
      </div>
    </section>
  );
}
