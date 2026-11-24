import { useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadCarPhoto } from '../services/carService';
import { queryKeys } from '../queries/queryKeys';

interface Props {
  carId: string;
}

export default function CarPhotoUpload({ carId }: Props) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (selectedFile: File) => uploadCarPhoto(carId, selectedFile),

    onSuccess: () => {
      // Szczegóły auta (razem z listą zdjęć) są już nieaktualne.
      queryClient.invalidateQueries({ queryKey: queryKeys.car(carId) });
      // Lista aut pokazuje miniaturę głównego zdjęcia.
      queryClient.invalidateQueries({ queryKey: queryKeys.cars });

      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
  });

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      return;
    }
    uploadMutation.mutate(file);
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>Dodaj zdjęcie</legend>

        <div className="field-row">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Plik zdjęcia (JPG, PNG, WebP)"
            onChange={handleFileChange}
          />
          <button type="submit" disabled={!file || uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Wysyłanie...' : 'Wyślij zdjęcie'}
          </button>
        </div>

        {uploadMutation.isPending && <progress className="upload-progress" />}

        {uploadMutation.isError && (
          <p className="field-error">{uploadMutation.error.message}</p>
        )}
      </fieldset>
    </form>
  );
}
