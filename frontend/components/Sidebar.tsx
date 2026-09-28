'use client';

import React from 'react';
import { 
  Cloud, 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Bell, 
  Menu, 
  X,
  Sparkles,
  Laptop,
  Building2,
  Tag,
  Shield,
  Trash2
} from 'lucide-react';
import { User } from '../app/types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  alertCount?: number;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser?: User;
  onCleanDatabase?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  alertCount = 0,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  currentUser,
  onCleanDatabase
}) => {
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Facturas / Cotizaciones', icon: FileText },
    { id: 'suppliers', label: 'Proveedores', icon: Users },
    { id: 'inventory', label: 'Inventario TI', icon: Laptop },
    { id: 'areas', label: 'Áreas Enriko', icon: Building2 },
    // Módulos exclusivos para Superadmin
    ...(isSuperAdmin ? [
      { id: 'categories', label: 'Categorías TI', icon: Tag, superadminOnly: true },
      { id: 'users', label: 'Usuarios & Roles', icon: Shield, superadminOnly: true }
    ] : [])
  ];

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-zinc-900 
        border-r border-slate-200 dark:border-zinc-800 transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        {/* BRAND LOGO OFICIAL ENRIKO */}
        <div 
          className="relative text-white cursor-pointer select-none transition-all"
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            padding: isCollapsed ? '20px 8px' : '22px 18px 20px',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
          }}
          onClick={() => setCurrentView('dashboard')}
        >
          <div className="flex flex-col items-center justify-center text-center w-full">
            {!isCollapsed ? (
              <div className="flex flex-col items-center leading-none">
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <Cloud className="w-5 h-5 text-white" />
                  </span>
                  <span className="text-xs font-black text-white tracking-widest uppercase">Alimentos</span>
                </div>
                <span className="text-2xl font-black text-white tracking-tight drop-shadow-sm">ENRIKO</span>
                <span className="text-[8.5px] font-black text-white/90 tracking-widest uppercase italic mt-1.5 bg-black/20 px-2.5 py-0.5 rounded-full">
                  S.A.S. — Sistema Corporativo
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Cloud className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Toggle buttons */}
          <div className="absolute right-2 top-3 flex items-center gap-1">
            <button 
              className="hidden lg:flex w-6 h-6 rounded text-white/80 hover:text-white items-center justify-center bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
              title={isCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              <Menu className="w-3.5 h-3.5" />
            </button>
            <button 
              className="lg:hidden w-6 h-6 rounded text-white/80 hover:text-white flex items-center justify-center bg-white/10 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              title="Cerrar menú"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MENU ITEMS */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentView(item.id); onClose(); }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25 border-l-4 border-red-800' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'}
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-zinc-400'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                )}
                {!isCollapsed && (item as any).superadminOnly && (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    isActive ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                  }`}>
                    Super
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* PIE DE SIDEBAR: USUARIO ACTIVO Y VACIAR BASE DE DATOS */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
          {!isCollapsed && (
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                {isSuperAdmin ? 'SA' : (currentUser?.area ? currentUser.area.substring(0, 2).toUpperCase() : 'AD')}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-extrabold text-slate-900 dark:text-white block truncate text-[11px]">
                  {currentUser?.name || 'Super Admin'}
                </span>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold block truncate">
                  {isSuperAdmin ? 'Superadministrador' : `Admin • ${currentUser?.area}`}
                </span>
              </div>
            </div>
          )}

          {/* BOTÓN VACIAR FACTURAS (SOLO SUPERADMIN) */}
          {isSuperAdmin && onCleanDatabase && (
            <button
              onClick={onCleanDatabase}
              className={`w-full py-2 px-3 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
              title="Vaciar Facturas de Base de Datos"
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Vaciar Base de Datos</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
