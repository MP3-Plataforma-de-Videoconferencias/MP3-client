import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { ENV } from '../config/env'
import googleLogo from '../assets/google-color.svg';

export function RegisterPage(): JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener token de Google si viene del login
  const googleToken = location.state?.googleToken;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const birthDateObj = new Date(birthDate);
    const ageNum = new Date().getFullYear() - birthDateObj.getFullYear();
    if (isNaN(ageNum) || ageNum < 1) {
      setError('Por favor ingresa una edad válida');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${ENV.API_URL}/users/register`, {
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

      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/meetings/create');
      } else {
        navigate('/login');
      }
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
      let idToken = googleToken;
      
      // Si no hay token (registro directo desde botón), obtener uno nuevo
      if (!idToken) {
        const result = await signInWithPopup(auth, googleProvider);
        idToken = await result.user.getIdToken();

        // Primero intentar hacer login para ver si el usuario ya existe
        const loginResponse = await fetch(`${ENV.API_URL}/users/loginGoogle`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
        });

        const loginData = await loginResponse.json();
        
        if (loginData.status === "incomplete_profile") {
          // Usuario no existe - mostrar campos de edad
          // Recargar la página con el token en el state
          navigate('/register', { state: { googleToken: idToken, email: loginData.email } });
          return;
        }
        
        if (loginResponse.ok) {
          // Usuario ya existe - redirigir al home
          localStorage.setItem('token', loginData.token);
          navigate('/meetings/create');
          return;
        }
      }

      // Si llegamos aquí, el usuario tiene un token y está completando el registro
      // Validar edad antes de enviar
      const birthDateObj = new Date(birthDate);
      const ageNum = new Date().getFullYear() - birthDateObj.getFullYear();
      if (isNaN(ageNum) || ageNum < 1) {
        setError('Por favor ingresa una edad válida para completar el registro');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${ENV.API_URL}/users/registerGoogle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          age: ageNum
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/meetings/create');
      } else {
        throw new Error(data.error || data.message || 'Error al registrarse con Google');
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
          {googleToken ? 'Completar Registro' : 'Crear Cuenta'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-700 bg-red-100 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {googleToken && (
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
              Por favor completa tu edad para finalizar el registro con Google
            </div>
          )}

          {/* Mostrar campos solo si NO es registro de Google */}
          {!googleToken && (
            <>
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
            </>
          )}

          {/* Birth Date - Siempre visible */}
          <div>
            <label htmlFor="birthDate" className="text-sm font-medium">
              Fecha de Nacimiento
            </label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                calendar_today
              </span>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {!googleToken && (
            <>
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
            </>
          )}

          {/* Google Register Button - Mostrar si viene del login */}
          {googleToken && (
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg text-black text-center font-medium transition
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#cfe6e3]/70 hover:bg-[#cfe6e3]/100'}`}
            >
              {isLoading ? 'Completando registro...' : 'Completar Registro'}
            </button>
          )}

          {!googleToken && (
            <>
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
                  <img src={googleLogo} alt="google" className="w-5" />
                  Google
                </button>

                <button type="button" className="flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-100 transition">
                  <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="facebook" className="w-5" />
                  Facebook
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}