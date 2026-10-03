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
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Award
} from 'lucide-react';
import { api } from '../lib/api';
import { notifyError, notifySuccess } from '../lib/alerts';
import { User } from '../app/types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  darkMode?: boolean;
  sessionExpiredReason?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, darkMode, sessionExpiredReason }) => {
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
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-slate-900/90 dark:bg-zinc-950 relative overflow-hidden select-none">
      {/* Luces y degradados ambientales de fondo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* CONTENEDOR SPLIT PRINCIPAL */}
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[620px] animate-in fade-in zoom-in-95 duration-200">
        
        {/* PANEL IZQUIERDO: HERO CORPORATIVO / IMAGEN Y BRANDING */}
        <div className="lg:col-span-6 bg-gradient-to-br from-red-600 via-red-700 to-zinc-900 text-white p-7 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Patrón de fondo geométrico */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          {/* PARTE SUPERIOR: LOGO Y TÍTULO */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg ring-1 ring-white/30">
                <Cloud className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xs font-black tracking-widest uppercase text-white/90">Alimentos</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">ENRIKO</h1>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-wider text-amber-300 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistema Corporativo de Gestión</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug drop-shadow-sm">
              Control de Facturas, Cotizaciones & Áreas Operativas
            </h2>
            <p className="text-xs text-white/80 mt-2 leading-relaxed">
              Plataforma centralizada para la auditoría, seguimiento presupuestal y control de servicios en Alimentos Enriko S.A.S.
            </p>
          </div>

          {/* PARTE MEDIA: TARJETAS DE CARACTERÍSTICAS / STATS */}
          <div className="my-6 sm:my-8 space-y-2.5 relative z-10">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                <FileSpreadsheet className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 text-xs">
                <span className="font-extrabold text-white block truncate">Auditoría Mensual & Rollover</span>
                <span className="text-[10px] text-white/70 block truncate">Sincronización automática de conceptos recurrentes</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 text-xs">
                <span className="font-extrabold text-white block truncate">Control por Áreas & Roles</span>
                <span className="text-[10px] text-white/70 block truncate">Permisos granulares: TI, Finanzas, Compras, Planta</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 text-xs">
                <span className="font-extrabold text-white block truncate">Calidad y Excelencia Enriko</span>
                <span className="text-[10px] text-white/70 block truncate">Tradición nutricional con tecnología de punta</span>
              </div>
            </div>
          </div>

          {/* PARTE INFERIOR: ESTADO DEL SISTEMA */}
          <div className="flex items-center justify-between pt-4 border-t border-white/15 text-[10px] text-white/80 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold">Base de Datos MySQL Sincronizada</span>
            </div>
            <span className="font-medium">v2.5 Corporativo</span>
          </div>
        </div>

        {/* PANEL DERECHO: FORMULARIO DE INICIO DE SESIÓN */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between bg-white dark:bg-zinc-900">
          <div>
            {/* ENCABEZADO FORMULARIO */}
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 block mb-1">
                Portal de Acceso Autorizado
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Ingresa tus credenciales para acceder al panel de control.
              </p>
            </div>

            {/* AVISO DE SESIÓN EXPIRADA / INACTIVIDAD */}
            {sessionExpiredReason && !errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 animate-ping" />
                <span>{sessionExpiredReason}</span>
              </div>
            )}

            {/* AVISO DE ERROR */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Usuario o Correo Corporativo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: superadmin o correo corporativo"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
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
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
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
                    <span>Validando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ACCESOS RÁPIDOS PARA PRUEBAS (DEMO PILLS) */}
          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 text-center">
              Acceso Rápido para Demostración / Pruebas:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10.5px]">
              <button
                type="button"
                onClick={() => handleQuickFill('superadmin', 'superadmin123')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-zinc-700 text-left cursor-pointer transition-all hover:border-red-300 group"
              >
                <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-red-600 truncate">
                  Superadmin
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Acceso Total
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin.ti', '123456')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-zinc-700 text-left cursor-pointer transition-all hover:border-red-300 group"
              >
                <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-red-600 truncate">
                  Admin TI
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Tecnología
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin.finanzas', '123456')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-zinc-700 text-left cursor-pointer transition-all hover:border-red-300 group"
              >
                <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-red-600 truncate">
                  Admin Finanzas
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Contabilidad
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin.compras', '123456')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-zinc-700 text-left cursor-pointer transition-all hover:border-red-300 group"
              >
                <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-red-600 truncate">
                  Admin Compras
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Adquisiciones
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin.planta', '123456')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-zinc-700 text-left cursor-pointer transition-all hover:border-red-300 group"
              >
                <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-red-600 truncate">
                  Admin Planta
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Operaciones
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('JR', 'enriko2026')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-zinc-700 text-left cursor-pointer transition-all hover:border-red-300 group"
              >
                <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-red-600 truncate">
                  Juan Rodríguez
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Facturas & Compras
                </span>
              </button>
            </div>

            <p className="text-[9.5px] text-center text-slate-400 mt-3">
              Alimentos Enriko S.A.S. • Conexión Segura TLS / AES-256
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
