'use client';

import React, { useState } from 'react';
import { 
  Cloud, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Building2,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';
import { notifyError, notifySuccess } from '../lib/alerts';
import { User } from '../app/types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  darkMode?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, darkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.login(username.trim(), password.trim());
      if (res.success && res.user) {
        notifySuccess(`¡Bienvenido, ${res.user.name}!`, `Sesión iniciada como ${res.user.role === 'superadmin' ? 'Superadministrador' : `Admin de ${res.user.area}`}`);
        onLoginSuccess(res.user);
      } else {
        setErrorMsg('Credenciales inválidas. Por favor verifica tus datos.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
      notifyError('No se pudo iniciar sesión', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-red-50/30 to-slate-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 relative overflow-hidden select-none">
      {/* Elementos decorativos de fondo */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/10 dark:bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/10 dark:bg-red-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER BRANDING ENRIKO */}
        <div className="bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white p-6 sm:p-8 text-center relative">
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-3 shadow-md ring-1 ring-white/30">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center gap-1.5 justify-center mb-0.5">
              <span className="text-xs font-black tracking-widest uppercase text-white/90">Alimentos</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">ENRIKO</h1>
            <span className="text-[9.5px] font-black tracking-widest uppercase italic bg-black/20 px-3 py-0.5 rounded-full mt-2 text-white/95">
              S.A.S. — Sistema Corporativo
            </span>
          </div>
          <p className="text-xs text-white/80 mt-3 font-medium">
            Control Centralizado de Facturas, Cotizaciones y Áreas
          </p>
        </div>

        {/* FORMULARIO DE ACCESO */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Iniciar Sesión</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Ingresa tus credenciales autorizadas
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Usuario o Correo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="superadmin o tu correo"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:shadow-red-600/40 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ACCESOS RÁPIDOS PARA PRUEBAS Y DEMOSTRACIÓN */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center mb-2.5">
              Cuentas Demo para Acceso Rápido:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('superadmin', 'superadmin123')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/70 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-zinc-700 text-left cursor-pointer transition-all hover:border-red-300 group"
              >
                <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-red-600">
                  Superadmin
                </span>
                <span className="text-[9.5px] text-slate-400 block truncate">
                  Acceso Total Global
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin.ti', '123456')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/70 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-zinc-700 text-left cursor-pointer transition-all hover:border-red-300 group"
              >
                <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-red-600">
                  Admin TI
                </span>
                <span className="text-[9.5px] text-slate-400 block truncate">
                  Tecnología Enriko
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin.finanzas', '123456')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/70 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-zinc-700 text-left cursor-pointer transition-all hover:border-red-300 group"
              >
                <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-red-600">
                  Admin Finanzas
                </span>
                <span className="text-[9.5px] text-slate-400 block truncate">
                  Contabilidad & Pagos
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin.compras', '123456')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/70 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-zinc-700 text-left cursor-pointer transition-all hover:border-red-300 group"
              >
                <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-red-600">
                  Admin Compras
                </span>
                <span className="text-[9.5px] text-slate-400 block truncate">
                  Adquisiciones
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="py-3 px-6 bg-slate-50 dark:bg-zinc-800/40 border-t border-slate-100 dark:border-zinc-800 text-center text-[10px] text-slate-400">
          Alimentos Enriko S.A.S. • Conexión Segura TLS / AES-256
        </div>
      </div>
    </div>
  );
};
