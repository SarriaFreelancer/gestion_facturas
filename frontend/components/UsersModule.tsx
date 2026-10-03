'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  Key, 
  Building2, 
  Mail, 
  X, 
  CheckCircle2, 
  Shield, 
  Lock,
  UserPlus
} from 'lucide-react';
import { User, CompanyArea } from '../app/types';

interface UsersModuleProps {
  users: User[];
  areas: CompanyArea[];
  onSaveUser: (user: Partial<User>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export const UsersModule: React.FC<UsersModuleProps> = ({
  users,
  areas,
  onSaveUser,
  onDeleteUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'superadmin' | 'admin' | 'viewer' | 'supplier'>('admin');
  const [area, setArea] = useState('Tecnología (TI)');
  const [status, setStatus] = useState<'Activo' | 'Inactivo'>('Activo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setUsername('');
    setName('');
    setEmail('');
    setPassword('123456');
    setRole('admin');
    setArea(areas[0]?.name || 'Tecnología (TI)');
    setStatus('Activo');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setName(u.name);
    setEmail(u.email || '');
    setPassword('');
    setRole(u.role);
    setArea(u.area || 'General');
    setStatus(u.status || 'Activo');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) return;
    try {
      setIsSubmitting(true);
      await onSaveUser({
        id: editingUser?.id,
        username: username.trim(),
        name: name.trim(),
        email: email.trim() || undefined,
        password: password ? password.trim() : undefined,
        role,
        area: role === 'superadmin' ? 'Dirección General' : role === 'supplier' ? 'Proveedores Externos' : area,
        status
      });
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (r: string) => {
    if (r === 'superadmin') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>Super Administrador</span>
        </span>
      );
    }
    if (r === 'supplier') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 flex items-center gap-1">
          <Building2 className="w-3 h-3" />
          <span>Proveedor</span>
        </span>
      );
    }
    if (r === 'admin') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 flex items-center gap-1">
          <UserCheck className="w-3 h-3" />
          <span>Admin de Área</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
        Visualizador
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-600 flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Gestión de Usuarios y Roles
              </h1>
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                Alimentos Enriko S.A.S.
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Configura los administradores por departamento y accesos al sistema
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Crear Usuario</span>
        </button>
      </div>


      {/* REGLA DE ACCESO */}
      <div className="p-4 rounded-2xl bg-blue-50/75 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold block text-[11px] uppercase tracking-wider">
            Política de Control de Accesos por Departamento
          </span>
          <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300 mt-0.5">
            El <strong>Superadministrador</strong> tiene visibilidad total del sistema. Cada <strong>Admin de Área</strong> solo puede gestionar y registrar facturas y proveedores correspondientes a su área asignada en <strong>Alimentos Enriko S.A.S.</strong>
          </p>
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/75 dark:bg-zinc-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                <th className="px-4 py-3.5">Nombre & Usuario</th>
                <th className="px-4 py-3.5">Rol en el Sistema</th>
                <th className="px-4 py-3.5">Área Asignada</th>
                <th className="px-4 py-3.5">Correo Electrónico</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/75 dark:hover:bg-zinc-800/40 transition-colors">
                  {/* NOMBRE */}
                  <td className="px-4 py-3">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {u.name}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">@{u.username}</span>
                  </td>

                  {/* ROL */}
                  <td className="px-4 py-3">
                    {getRoleBadge(u.role)}
                  </td>

                  {/* ÁREA */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{u.area || 'General'}</span>
                    </div>
                  </td>

                  {/* EMAIL */}
                  <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                    {u.email || '—'}
                  </td>

                  {/* ESTADO */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === 'Activo'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>

                  {/* ACCIONES */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                        title="Editar usuario"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {u.role !== 'superadmin' && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR USUARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
                    {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Alimentos Enriko S.A.S.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                  Nombre Completo y Cargo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ing. Carlos Mendoza (Admin TI)..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-medium"
                />
              </div>


              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Nombre de Usuario <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin.ti"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Rol en el Sistema
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white cursor-pointer font-bold"
                  >
                    <option value="admin">Admin de Área</option>
                    <option value="superadmin">Super Administrador</option>
                    <option value="supplier">Proveedor Externo</option>
                    <option value="viewer">Visualizador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                  Área Asignada {role === 'admin' && <span className="text-red-500">*</span>}
                </label>
                <select
                  disabled={role === 'superadmin'}
                  value={role === 'superadmin' ? 'Dirección General' : area}
                  onChange={e => setArea(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white cursor-pointer ${
                    role === 'superadmin' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {areas.map(a => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                  Correo Corporativo Enriko
                </label>
                <input
                  type="email"
                  placeholder="usuario@alimentosenriko.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña Inicial'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingUser ? '••••••••' : '123456'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white cursor-pointer"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
