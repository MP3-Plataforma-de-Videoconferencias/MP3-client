import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function ResetPasswordPage(): JSX.Element {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Obtener el token de la URL
  const token = searchParams.get('token');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar que el token exista
    if (!token) {
      setError('Token inválido o expirado');
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud mínima
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: password,
          confirmPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error al restablecer la contraseña');
      }

      setSuccess('Contraseña restablecida exitosamente. Redirigiendo al login...');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-blue-600 text-5xl mb-2">
            lock_reset
          </span>
          <h1 className="text-2xl font-semibold">
            Restablecer Contraseña
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Ingresa tu nueva contraseña
          </p>
        </div>

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

          {/* Nueva Contraseña */}
          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Nueva Contraseña
            </label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                lock
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || !!success}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial
            </p>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                lock_reset
              </span>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading || !!success}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !!success}
            className={`w-full py-3 rounded-lg text-black text-center font-medium transition
            ${isLoading || success ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#cfe6e3]/70 hover:bg-[#cfe6e3]/100'}`}
          >
            {isLoading ? 'Restableciendo...' : success ? 'Contraseña Restablecida' : 'Restablecer Contraseña'}
          </button>

          {/* Volver al Login */}
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