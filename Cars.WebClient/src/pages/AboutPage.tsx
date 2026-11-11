import { Link } from "react-router";

export default function AboutPage() {
  return (
    <section>
      <h1>O aplikacji</h1>
      <p>
        Cars to aplikacja do zarządzania listą samochodów, przygotowana w
        ramach przedmiotu Aplikacje webowe i sieciowe.
      </p>
      <ul>
        <li>Frontend: React, React Router, Zustand, Axios</li>
        <li>Backend: ASP.NET Core Web API z uwierzytelnianiem JWT</li>
        <li>Konta użytkowników z potwierdzaniem e-maila i resetem hasła</li>
        <li>Ulubione samochody zapisywane osobno dla każdego użytkownika</li>
      </ul>
      <Link to="/" className="btn">
        Wróć na stronę główną
      </Link>
    </section>
  );
}
