import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export function RegisterPage(): JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar edad
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1) {
      setError('Por favor ingresa una edad válida');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          age: ageNum,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      // Redirigir al login después del registro exitoso
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Solo enviar el token, el backend extrae toda la info del usuario
      const response = await fetch('http://localhost:3000/users/loginGoogle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}` // Solo el token
        },
        // ❌ NO enviar body con datos del usuario
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        throw new Error(data.message || 'Error al registrarse con Google');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse con Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Crear Cuenta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-700 bg-red-100 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="text-sm font-medium">
              Nombre
            </label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                person
              </span>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="text-sm font-medium">
              Apellido
            </label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                badge
              </span>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Age */}
          <div>
            <label htmlFor="age" className="text-sm font-medium">
              Edad
            </label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                calendar_today
              </span>
              <input
                id="age"
                type="number"
                min="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar Contraseña
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-black text-center font-medium transition
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#cfe6e3]/70 hover:bg-[#cfe6e3]/100'}`}
          >
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="text-blue-600 font-medium hover:underline">
              Inicia sesión aquí
            </a>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">O regístrate con</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col space-y-3">
            <button 
              type="button" 
              onClick={handleGoogleRegister}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-100 transition disabled:opacity-50"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" className="w-5" />
              Google
            </button>

            <button type="button" className="flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-100 transition">
              <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="facebook" className="w-5" />
              Facebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}