import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Forgot password page component
 * @returns {JSX.Element} Forgot password page
 */
export function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el correo de recuperación');
      }

      setSuccess('Se ha enviado un correo con instrucciones para recuperar tu contraseña');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Recuperar contraseña
        </h1>
        <p className="text-center text-gray-600 text-sm mb-6">
          Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-700 bg-red-100 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-700 bg-green-100 p-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Correo electrónico
            </label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                mail
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-black text-center font-medium transition
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#cfe6e3]/70 hover:bg-[#cfe6e3]/100'}`}
          >
            {isLoading ? 'Enviando...' : 'Enviar correo'}
          </button>

          {/* Back to Login */}
          <p className="text-center text-sm">
            <a href="/login" className="text-blue-600 font-medium hover:underline">
              Volver al inicio de sesión
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

