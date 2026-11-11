import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { Link } from "react-router";
import type { RegisterData } from "../models/Auth";
import { register } from "../services/authService";

const emptyForm: RegisterData = {
  userName: "",
  email: "",
  password: "",
};

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      setMessage(null);
      const result = await register(formData);
      setMessage(result);
      setFormData(emptyForm);
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Nie udało się utworzyć konta.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h1>Rejestracja</h1>
      {message && <p>{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <form className="car-form" onSubmit={handleSubmit}>
        <label>
          Nazwa użytkownika
          <input
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          E-mail
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Hasło
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Rejestrowanie..." : "Zarejestruj"}
        </button>
      </form>
      <p>
        Masz już konto? <Link to="/login">Zaloguj się</Link>
      </p>
    </section>
  );
}
