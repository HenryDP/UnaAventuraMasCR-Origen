import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AdminPanel from '../components/AdminPanel';
import { Link } from 'react-router-dom';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Login Form
  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: errorsLogin } } = useForm();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const onLogin = async (data: any) => {
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      console.error("Login error:", error);
      alert("Error al iniciar sesión. Verifique sus credenciales.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-stone-800">Configuración Requerida</h2>
          <p className="text-stone-600 mb-6">
            Para acceder al panel de administración, necesitas configurar Firebase en tu proyecto.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-white">A</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center text-stone-800">Admin Login</h2>
          <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input 
                {...registerLogin("email", { required: true })}
                type="email"
                className="block w-full rounded-lg border-stone-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-3 transition-all"
                placeholder="admin@ejemplo.com"
              />
              {errorsLogin.email && <span className="text-xs text-red-500">Email es requerido</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
              <input 
                {...registerLogin("password", { required: true })}
                type="password"
                className="block w-full rounded-lg border-stone-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-3 transition-all"
                placeholder="••••••••"
              />
              {errorsLogin.password && <span className="text-xs text-red-500">Contraseña es requerida</span>}
            </div>
            <button 
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform active:scale-95"
            >
              Entrar al Panel
            </button>
          </form>
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-stone-500 hover:text-emerald-600 transition-colors">
              ← Volver a la web pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminPanel user={user} />;
}
