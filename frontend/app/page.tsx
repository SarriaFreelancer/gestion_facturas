'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbar';
import { DashboardKpis } from '../components/DashboardKpis';
import { DashboardCharts } from '../components/DashboardCharts';
import { SuppliersModule } from '../components/SuppliersModule';
import { InvoicesModule } from '../components/InvoicesModule';
import { SupplierModal } from '../components/SupplierModal';
import { InvoiceModal } from '../components/InvoiceModal';
import { api } from '../lib/api';
import { Invoice, Supplier, DashboardMetrics } from './types';
import { Trash2, AlertCircle, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'invoices' | 'suppliers' | 'reports' | 'alerts'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Requisito: "Pon el modo claro en el thema" -> valor por defecto false (modo claro activo)
  const [darkMode, setDarkMode] = useState(false);

  // Filtros Globales de Mes y Año
  const [selectedMonth, setSelectedMonth] = useState('Todos');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Estado de Datos
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de Modales
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedSupplierForEdit, setSelectedSupplierForEdit] = useState<Supplier | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | null>(null);

  // Cargar datos desde FastAPI backend con soporte a filtros de mes y año
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [invs, sups, mets] = await Promise.all([
        api.getInvoices().catch(() => []),
        api.getSuppliers().catch(() => []),
        api.getMetrics(selectedMonth, selectedYear).catch(() => null)
      ]);
      setInvoices(invs);
      setSuppliers(sups);
      setMetrics(mets);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrado reactivo en el frontend para facturas según el mes y año seleccionados
  const filteredInvoicesByDate = useMemo(() => {
    const monthMap: Record<string, number> = {
      'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
      'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
      'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
    };

    return invoices.filter(inv => {
      const dateStr = inv.emissionDate || inv.createdAt || '';
      if (!dateStr) return true;
      const cleanDate = dateStr.split('T')[0].split(' ')[0];
      const parts = cleanDate.split(/[-/]/);
      if (parts.length >= 3) {
        const year = parts[0].length === 4 ? parts[0] : parts[2];
        const month = parseInt(parts[0].length === 4 ? parts[1] : parts[1], 10);

        if (selectedYear !== 'Todos' && year !== selectedYear) {
          return false;
        }

        if (selectedMonth !== 'Todos') {
          const targetMonthNum = monthMap[selectedMonth.toLowerCase()];
          if (targetMonthNum && month !== targetMonthNum) {
            return false;
          }
        }
      }
      return true;
    });
  }, [invoices, selectedMonth, selectedYear]);

  // Actualización de campo en factura (PATCH inmediato)
  const handleUpdateInvoiceField = async (id: string, field: string, value: any) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, [field]: value } : inv));
    try {
      await api.updateInvoiceField(id, field, value);
      const updatedMetrics = await api.getMetrics(selectedMonth, selectedYear);
      setMetrics(updatedMetrics);
    } catch (err) {
      console.error('Error al actualizar campo:', err);
      loadData();
    }
  };

  // Guardar Proveedor (Crear o Editar)
  const handleSaveSupplier = async (supplierData: Partial<Supplier>) => {
    await api.createOrUpdateSupplier(supplierData);
    await loadData();
  };

  // Guardar Factura / Cotización (No recurrente o regular)
  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    await api.createOrUpdateInvoice(invoiceData);
    await loadData();
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
                  <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                    <span>Panel de Control y Analítica</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                      Filtro Activo: {selectedMonth} {selectedYear}
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Visualiza métricas, evolución mes a mes, flujos semanales y estudio de conceptos recurrentes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setSelectedInvoiceForEdit(null);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/25 transition-all cursor-pointer"
                  >
                    <span>+ Factura / Cotización</span>
                  </button>

                  <button 
                    onClick={handleCleanDatabase}
                    className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-red-50 hover:text-red-600 text-slate-600 dark:text-zinc-300 text-xs font-bold border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Vaciar facturas de prueba"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar BD</span>
                  </button>
                </div>
              </div>

              {/* KPIS PRINCIPALES (SENSIBLES AL FILTRO DE MES Y AÑO) */}
              <DashboardKpis metrics={metrics} loading={loading} />

              {/* GRÁFICOS SOLICITADOS: MES A MES, FLUJO SEMANAL Y ESTUDIO DE RECURRENCIA */}
              <DashboardCharts 
                monthlyStats={metrics?.monthlyStats || []}
                weeklyData={metrics?.weeklyReceivedDelivered || []}
                recurrenceStudy={metrics?.recurrenceStudy || []}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
              />
            </div>
          )}

          {/* VISTA FACTURAS */}
          {currentView === 'invoices' && (
            <InvoicesModule 
              invoices={filteredInvoicesByDate}
              onUpdateField={handleUpdateInvoiceField}
              onDeleteInvoice={handleDeleteInvoice}
              onAddInvoice={() => {
                setSelectedInvoiceForEdit(null);
                setIsInvoiceModalOpen(true);
              }}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}

          {/* VISTA PROVEEDORES */}
          {currentView === 'suppliers' && (
            <SuppliersModule 
              suppliers={suppliers}
              onAddSupplier={() => {
                setSelectedSupplierForEdit(null);
                setIsSupplierModalOpen(true);
              }}
              onEditSupplier={(sup) => {
                setSelectedSupplierForEdit(sup);
                setIsSupplierModalOpen(true);
              }}
              onDeleteSupplier={handleDeleteSupplier}
              onUpdateSupplierServices={handleUpdateSupplierServices}
            />
          )}

          {/* OTRAS VISTAS */}
          {(currentView === 'reports' || currentView === 'alerts') && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
              <h2 className="text-base font-black text-slate-800 dark:text-white mb-2">Módulo en Desarrollo</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Los datos se sincronizan con los endpoints analíticos de FastAPI y MySQL.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* MODAL PARA CREACIÓN / EDICIÓN DE PROVEEDORES */}
      <SupplierModal 
        isOpen={isSupplierModalOpen}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setSelectedSupplierForEdit(null);
        }}
        onSave={handleSaveSupplier}
        initialSupplier={selectedSupplierForEdit}
      />

      {/* MODAL PARA CREACIÓN / EDICIÓN DE FACTURAS O COTIZACIONES NO RECURRENTES */}
      <InvoiceModal 
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceForEdit(null);
        }}
        onSave={handleSaveInvoice}
        suppliers={suppliers}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
        initialInvoice={selectedInvoiceForEdit}
      />
    </div>
  );
}
