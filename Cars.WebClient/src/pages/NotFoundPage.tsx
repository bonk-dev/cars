import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <section>
      <h1>404 - nie znaleziono strony</h1>
      <p>Strona o podanym adresie nie istnieje.</p>
      <Link to="/" className="btn">Wróć na stronę główną</Link>
    </section>
  );
}
