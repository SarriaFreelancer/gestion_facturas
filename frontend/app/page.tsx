'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbar';
import { DashboardKpis } from '../components/DashboardKpis';
import { SuppliersModule } from '../components/SuppliersModule';
import { InvoicesModule } from '../components/InvoicesModule';
import { api } from '../lib/api';
import { Invoice, Supplier, DashboardMetrics } from './types';
import { Trash2, AlertCircle, Sparkles } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'invoices' | 'suppliers' | 'reports' | 'alerts'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState('Todos');
  const [selectedYear, setSelectedYear] = useState('2026');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde FastAPI backend
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [invs, sups, mets] = await Promise.all([
        api.getInvoices().catch(() => []),
        api.getSuppliers().catch(() => []),
        api.getMetrics().catch(() => null)
      ]);
      setInvoices(invs);
      setSuppliers(sups);
      setMetrics(mets);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actualización de campo en factura (PATCH inmediato)
  const handleUpdateInvoiceField = async (id: string, field: string, value: any) => {
    // Actualización optimista local
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, [field]: value } : inv));
    try {
      await api.updateInvoiceField(id, field, value);
      const updatedMetrics = await api.getMetrics();
      setMetrics(updatedMetrics);
    } catch (err) {
      console.error('Error al actualizar campo:', err);
      loadData(); // Revertir si hay error
    }
  };

  // Eliminación de factura
  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('¿Deseas eliminar este registro de factura?')) return;
    try {
      await api.deleteInvoice(id);
      loadData();
    } catch (err) {
      console.error('Error al eliminar factura:', err);
    }
  };

  // Eliminación de proveedor
  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('¿Deseas eliminar este proveedor del directorio?')) return;
    try {
      await api.deleteSupplier(id);
      loadData();
    } catch (err) {
      console.error('Error al eliminar proveedor:', err);
    }
  };

  // Actualización de conceptos / servicios de un proveedor
  const handleUpdateSupplierServices = async (supId: string, services: any[]) => {
    setSuppliers(prev => prev.map(s => s.id === supId ? { ...s, services } : s));
    try {
      await api.updateSupplierServices(supId, services);
    } catch (err) {
      console.error('Error al guardar conceptos:', err);
      loadData();
    }
  };

  // Limpiar base de datos
  const handleCleanDatabase = async () => {
    if (!confirm('¿Seguro que deseas vaciar todas las facturas de la base de datos para comenzar en limpio?')) return;
    try {
      await api.cleanDatabase();
      loadData();
    } catch (err) {
      console.error('Error al limpiar base de datos:', err);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 flex ${darkMode ? 'dark' : ''}`}>
      {/* SIDEBAR CORPORATIVO */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={(v) => setCurrentView(v as any)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* CONTENIDO PRINCIPAL */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <TopNavbar 
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(prev => !prev)}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />

        <main className="p-4 sm:p-7 flex-1">
          {/* VISTA DASHBOARD */}
          {currentView === 'dashboard' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-6">
                <div>
                  <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                    Panel de Control y Analítica
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Visualiza métricas en tiempo real con almacenamiento en MySQL y arquitectura moderna.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCleanDatabase}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-red-50 hover:text-red-600 text-slate-600 dark:text-zinc-300 text-xs font-bold border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Vaciar facturas de prueba"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar BD</span>
                  </button>
                </div>
              </div>

              {/* KPIS */}
              <DashboardKpis metrics={metrics} loading={loading} />

              {/* RESUMEN RÁPIDO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-600" />
                    <span>Estado del Backend FastAPI</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Conectado activamente al API en <code>http://localhost:8000</code>. El backend implementa el patrón Service-Repository con validación estricta de esquemas Pydantic v2 y pool directo a la base de datos MySQL <code>GESTION_FACTURAS</code>.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Compatibilidad y Portabilidad</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Toda la interfaz mantiene la paleta corporativa <strong>Alimentos Enriko</strong> (Rojo #dc2626, switches de estado, campos semirredondeados y selectores de conceptos desplegables) sin alterar el servidor de producción actual.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VISTA FACTURAS */}
          {currentView === 'invoices' && (
            <InvoicesModule 
              invoices={invoices}
              onUpdateField={handleUpdateInvoiceField}
              onDeleteInvoice={handleDeleteInvoice}
            />
          )}

          {/* VISTA PROVEEDORES */}
          {currentView === 'suppliers' && (
            <SuppliersModule 
              suppliers={suppliers}
              onAddSupplier={() => alert('Para registrar un proveedor rápido, puedes usar el formulario o la API.')}
              onEditSupplier={(sup) => alert(`Editando proveedor: ${sup.name}`)}
              onDeleteSupplier={handleDeleteSupplier}
              onUpdateSupplierServices={handleUpdateSupplierServices}
            />
          )}

          {/* OTRAS VISTAS */}
          {(currentView === 'reports' || currentView === 'alerts') && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
              <h2 className="text-base font-black text-slate-800 dark:text-white mb-2">Módulo en Desarrollo</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Los datos de este módulo se procesan con los endpoints de analítica FastAPI.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
