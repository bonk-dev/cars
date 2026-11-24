import { Link } from 'react-router';

import type { Car } from '../models/Car';
import { bodyTypeLabel, fuelTypeLabel } from '../models/carOptions';
import FavoriteButton from './FavoriteButton';

interface Props {
  car: Car;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: (car: Car) => void;
}

export default function CarCard({ car, canDelete, isDeleting, onDelete }: Props) {
  const mainPhoto = car.photos.find((photo) => photo.isMain) ?? car.photos[0];

  return (
    <article className="window car-card">
      <div className="title-bar">
        <div className="title-bar-text">
          {car.brand} {car.model}
        </div>
      </div>

      <div className="window-body">
        <Link to={`/cars/${car.id}`} className="car-card-photo" tabIndex={-1}>
          {mainPhoto ? (
            <img src={mainPhoto.url} alt={`${car.brand} ${car.model}`} />
          ) : (
            <span>Brak zdjęcia</span>
          )}
        </Link>

        <p className="car-card-meta">
          {car.productionDate.substring(0, 4)} · {fuelTypeLabel(car.fuelType)} ·{' '}
          {bodyTypeLabel(car.bodyType)}
        </p>

        <div className="actions">
          <Link to={`/cars/${car.id}`} className="btn">
            Szczegóły
          </Link>
          <Link to={`/cars/${car.id}/edit`} className="btn">
            Edytuj
          </Link>
          <FavoriteButton carId={car.id} />
          {canDelete && (
            <button
              type="button"
              className="danger"
              disabled={isDeleting}
              onClick={() => onDelete(car)}
            >
              {isDeleting ? 'Usuwanie...' : 'Usuń'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
