import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { Link } from "react-router";
import { forgotPassword } from "../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      setMessage(null);
      const result = await forgotPassword(email);
      setMessage(result);
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Nie udało się wysłać linku do resetowania hasła.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h1>Nie pamiętasz hasła?</h1>
      <p>
        Podaj adres e-mail powiązany z kontem. Wyślemy na niego link do
        ustawienia nowego hasła.
      </p>
      {message && <p>{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <form className="car-form" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Wysyłanie..." : "Wyślij link"}
        </button>
      </form>
      <p>
        <Link to="/login">Wróć do logowania</Link>
      </p>
    </section>
  );
}
