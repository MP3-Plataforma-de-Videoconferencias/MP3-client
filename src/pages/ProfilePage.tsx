import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ENV } from '../config/env';

interface UserData {
  firstName: string;
  lastName: string;
  age: string;
  email: string;
}

interface JWTPayload {
  userId: string;  
  email: string;
  iat: number;
  exp: number;
}

export function ProfilePage(): JSX.Element {
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Decodificar el token para obtener el ID del usuario
        const decoded = jwtDecode<JWTPayload>(token);
        const userId = decoded.userId;  // Cambiar de decoded.id a decoded.userId
        console.log('Decoded user ID:', userId);

        // Usar GET /users/:id según tu API
        const response = await fetch(`${ENV.API_URL}/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar datos del usuario');
        }

        const data = await response.json();
        setUserData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          age: data.age?.toString() || '',
          email: data.email || '',
        });
      } catch (err) {
        console.error('Error loading user data:', err);
        navigate('/login');
      }
    };

    loadUserData();
  }, [navigate]);

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${ENV.API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          age: parseInt(userData.age),
          email: userData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${ENV.API_URL}/users/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar contraseña');
      }

      setSuccess('Contraseña cambiada correctamente');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${ENV.API_URL}/users/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar cuenta');
      }

      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cuenta');
    } finally {
      setIsLoading(false);
    }
  };


  return (
  <div className="min-h-screen flex justify-center bg-gray-100 px-4 py-8" aria-label="Página de perfil del usuario">
    <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-8 relative" aria-label="Formulario de perfil">

      {/* Back Arrow */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900"
        aria-label="Volver a la página anterior"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      {/* Título */}
      <div className="text-center mb-6" aria-label="Encabezado de perfil">
        <h1 className="text-2xl font-semibold">Editar perfil</h1>
        <p className="text-gray-600 mt-2">Edita tu información personal</p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="text-red-700 bg-red-100 p-3 rounded-md text-sm mb-4" aria-live="assertive" aria-label="Mensaje de error">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-700 bg-green-100 p-3 rounded-md text-sm mb-4" aria-live="polite" aria-label="Mensaje de éxito">
          {success}
        </div>
      )}

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleUpdateProfile} className="space-y-5" aria-label="Formulario para actualizar perfil">
        {/* Nombre */}
        <div>
          <label htmlFor="firstName" className="text-sm font-medium block mb-1" aria-label="Nombre">
            Nombre
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              person
            </span>
            <input
              id="firstName"
              type="text"
              value={userData.firstName}
              onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Apellido */}
        <div>
          <label htmlFor="lastName" className="text-sm font-medium block mb-1" aria-label="Apellido">
            Apellido
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              badge
            </span>
            <input
              id="lastName"
              type="text"
              value={userData.lastName}
              onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Edad */}
        <div>
          <label htmlFor="age" className="text-sm font-medium block mb-1" aria-label="Edad">
            Edad
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              calendar_today
            </span>
            <input
              id="age"
              type="number"
              min="1"
              value={userData.age}
              onChange={(e) => setUserData({ ...userData, age: e.target.value })}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="text-sm font-medium block mb-1" aria-label="Correo electrónico">
            Correo electrónico
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              mail
            </span>
            <input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Botón guardar */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg text-black font-medium transition
          ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#cfe6e3]/70 hover:bg-[#cfe6e3]/100'}`}
        >
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {/* CAMBIAR CONTRASEÑA */}
      <button
        type="button"
        onClick={() => setShowPasswordModal(true)}
        className="w-full py-2 text-blue-600 hover:underline text-sm mt-4"
      >
        Cambiar contraseña
      </button>

      {/* ELIMINAR CUENTA */}
      <div className="border rounded-lg p-4 mt-6" aria-label="Sección para eliminar cuenta">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600">warning</span>
          Eliminar cuenta
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Esta acción eliminará permanentemente todos tus datos.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
        >
          Eliminar cuenta
        </button>
      </div>
          
                   
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 id="delete-modal-title" className="text-xl font-semibold mb-4">¿Eliminar cuenta?</h3>
              <p className="text-gray-600 mb-6">
                Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  {isLoading ? 'Eliminando...' : 'Eliminar cuenta'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="password-modal-title">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 id="password-modal-title" className="text-xl font-semibold mb-4">Cambiar contraseña</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="text-sm font-medium block mb-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      lock
                    </span>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPasswordModal" className="text-sm font-medium block mb-1">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      lock_reset
                    </span>
                    <input
                      id="confirmPasswordModal"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 py-2 rounded-lg text-black
                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#cfe6e3]/70 hover:bg-[#cfe6e3]/100'}`}
                  >
                    {isLoading ? 'Cambiando...' : 'Cambiar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    
  );
}