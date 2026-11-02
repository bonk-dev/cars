import { Link } from 'react-router';

export default function HomePage() {
  return (
    <section>
      <h1>Cars</h1>
      <p>Aplikacja listy samochodów</p>
      <Link to="/cars" className="btn primary">Przejdź do listy samochodów</Link>
    </section>
  );
}
