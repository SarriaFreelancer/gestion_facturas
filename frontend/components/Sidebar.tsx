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
  Settings,
  Inbox,
  FileCheck2
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
  portalEnabled?: boolean;
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
  portalEnabled = true
}) => {
  const isSupplier = currentUser?.role === 'supplier';
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const menuItems = isSupplier
    ? [
        { id: 'internal_invoices', label: 'Bandeja Proveedores', icon: FileCheck2 }
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'invoices', label: 'Facturas / Cotizaciones', icon: FileText },
        { id: 'facture', label: 'Bandeja Facture.co', icon: Inbox },
        ...(portalEnabled ? [
          { id: 'internal_invoices', label: 'Bandeja Proveedores', icon: FileCheck2 }
        ] : []),
        { id: 'suppliers', label: 'Proveedores', icon: Users },
        { id: 'inventory', label: 'Inventario TI', icon: Laptop },
        { id: 'areas', label: 'Áreas Enriko', icon: Building2 },
        // Módulos exclusivos para Superadmin
        ...(isSuperAdmin ? [
          { id: 'categories', label: 'Categorías TI', icon: Tag, superadminOnly: true },
          { id: 'users', label: 'Usuarios & Roles', icon: Shield, superadminOnly: true }
        ] : []),
        { id: 'settings', label: 'Configuración', icon: Settings }
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
            background: isSupplier 
              ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' 
              : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            padding: isCollapsed ? '20px 8px' : '22px 18px 20px',
            boxShadow: isSupplier ? '0 2px 8px rgba(37, 99, 235, 0.25)' : '0 2px 8px rgba(220, 38, 38, 0.25)'
          }}
          onClick={() => setCurrentView(isSupplier ? 'internal_invoices' : 'dashboard')}
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
                  {isSupplier ? 'Portal de Proveedores' : 'S.A.S. — Sistema Corporativo'}
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
                    ? isSupplier
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 border-l-4 border-blue-800'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25 border-l-4 border-red-800' 
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

        {/* PIE DE SIDEBAR: USUARIO ACTIVO */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800">
          {!isCollapsed && (
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center gap-2.5 text-xs">
              <div className={`w-8 h-8 rounded-xl ${isSupplier ? 'bg-blue-600' : 'bg-red-600'} text-white font-black text-xs flex items-center justify-center flex-shrink-0`}>
                {isSupplier ? 'PV' : isSuperAdmin ? 'SA' : (currentUser?.area ? currentUser.area.substring(0, 2).toUpperCase() : 'AD')}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-extrabold text-slate-900 dark:text-white block truncate text-[11px]">
                  {currentUser?.name || 'Super Admin'}
                </span>
                <span className={`text-[10px] ${isSupplier ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'} font-bold block truncate`}>
                  {isSupplier ? `Proveedor • ${currentUser?.supplierNit || 'NIT'}` : isSuperAdmin ? 'Superadministrador' : `Admin • ${currentUser?.area}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
