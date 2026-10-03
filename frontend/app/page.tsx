'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbar';
import { DashboardKpis } from '../components/DashboardKpis';
import { DashboardCharts } from '../components/DashboardCharts';
import { SuppliersModule } from '../components/SuppliersModule';
import { InvoicesModule } from '../components/InvoicesModule';
import { TechInventoryModule } from '../components/TechInventoryModule';
import { AreasModule } from '../components/AreasModule';
import { CategoriesModule } from '../components/CategoriesModule';
import { UsersModule } from '../components/UsersModule';
import { SupplierModal } from '../components/SupplierModal';
import { InvoiceModal } from '../components/InvoiceModal';
import { MonthRolloverModal } from '../components/MonthRolloverModal';
import { LoginScreen } from '../components/LoginScreen';
import { DeliveredInvoicesModal } from '../components/DeliveredInvoicesModal';
import { EmailSettingsModal } from '../components/EmailSettingsModal';
import { SettingsModule } from '../components/SettingsModule';
import { FactureModule } from '../components/FactureModule';
import { api } from '../lib/api';
import { 
  notifySuccess, 
  notifyError, 
  notifyInfo, 
  confirmDelete, 
  confirmAction,
  EnrikoToast 
} from '../lib/alerts';
import { 
  Invoice, 
  Supplier, 
  DashboardMetrics, 
  TechInventoryItem, 
  InventoryMovement, 
  InventoryCategory, 
  CompanyArea, 
  User,
  EmailSettings
} from './types';
import { Trash2, AlertCircle, Sparkles, Filter, CheckCircle2, Calendar, Shield, Building2 } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentViewState] = useState<'dashboard' | 'invoices' | 'facture' | 'suppliers' | 'inventory' | 'areas' | 'categories' | 'users' | 'settings' | 'reports' | 'alerts'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Sincronizador de vistas con la URL del navegador
  const setCurrentView = useCallback((view: string) => {
    const validViews = ['dashboard', 'invoices', 'facture', 'suppliers', 'inventory', 'areas', 'categories', 'users', 'settings', 'reports', 'alerts'];
    const target = (validViews.includes(view) ? view : 'dashboard') as any;
    setCurrentViewState(target);
    if (typeof window !== 'undefined') {
      const newUrl = target === 'dashboard' ? window.location.pathname : `?view=${target}`;
      window.history.pushState({ view: target }, '', newUrl);
    }
  }, []);

  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Modo claro como predeterminado (false) tanto en servidor como cliente
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Leer vista desde la URL si viene en la query (?view=invoices o ?tab=suppliers o #facture)
    const validViews = ['dashboard', 'invoices', 'facture', 'suppliers', 'inventory', 'areas', 'categories', 'users', 'settings', 'reports', 'alerts'];
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') || params.get('tab') || window.location.hash.replace('#', '');
    if (viewParam && validViews.includes(viewParam)) {
      setCurrentViewState(viewParam as any);
    }

    // Escuchar botones de Atrás / Adelante del navegador
    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const v = p.get('view') || p.get('tab') || window.location.hash.replace('#', '');
      if (v && validViews.includes(v)) {
        setCurrentViewState(v as any);
      } else {
        setCurrentViewState('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);

    const saved = localStorage.getItem('ae_dark_mode');
    if (saved === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Verificar sesión previa guardada
    const savedUser = localStorage.getItem('ae_auth_user');
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        setCurrentUser(userObj);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('ae_dark_mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('ae_dark_mode', 'false');
      }
      return next;
    });
  }, []);

  // Filtros Globales de Mes y Año (Sincronizados con la fecha actual del día)
  const [selectedMonth, setSelectedMonth] = useState('Septiembre');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Estado de Datos Principales
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<TechInventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [areas, setAreas] = useState<CompanyArea[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Usuario Activo (Por defecto SuperAdmin de Alimentos Enriko)
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-superadmin',
    username: 'superadmin',
    name: 'David Sarria (Superadmin)',
    email: 'superadmin@alimentosenriko.com',
    role: 'superadmin',
    area: 'Dirección General',
    status: 'Activo'
  });

  // Estados de Modales
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedSupplierForEdit, setSelectedSupplierForEdit] = useState<Supplier | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | null>(null);

  // Modal Inicio de Mes (Rollover de no entregadas y plantilla en blanco)
  const [isRolloverModalOpen, setIsRolloverModalOpen] = useState(false);
  const [rolloverTargetMonth, setRolloverTargetMonth] = useState('Octubre');
  const [rolloverTargetYear, setRolloverTargetYear] = useState('2026');
  const [rolloverPreviousMonth, setRolloverPreviousMonth] = useState('Septiembre');
  const [serverDateInfo, setServerDateInfo] = useState<any>(null);

  // Estados de Facturas Entregadas & Configuración Correo
  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);
  const [isEmailSettingsModalOpen, setIsEmailSettingsModalOpen] = useState(false);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);

  // Cargar datos desde FastAPI backend con soporte a filtros de mes y año
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [invs, sups, mets, invt, movs, cats, ars, usrs, srvDate, mailSet] = await Promise.all([
        api.getInvoices().catch(() => []),
        api.getSuppliers().catch(() => []),
        api.getMetrics(selectedMonth, selectedYear).catch(() => null),
        api.getInventory().catch(() => []),
        api.getInventoryMovements().catch(() => []),
        api.getInventoryCategories().catch(() => []),
        api.getCompanyAreas().catch(() => []),
        api.getUsers().catch(() => []),
        api.getSystemDateStatus(selectedMonth !== 'Todos' ? selectedMonth : undefined, selectedYear).catch(() => null),
        api.getEmailSettings().catch(() => null)
      ]);
      setInvoices(invs);
      setSuppliers(sups);
      setMetrics(mets);
      setInventory(invt);
      setMovements(movs);
      setCategories(cats);
      setAreas(ars);
      setUsers(usrs);
      if (mailSet) setEmailSettings(mailSet);

      if (srvDate) {
        setServerDateInfo(srvDate);
        setRolloverPreviousMonth(srvDate.previousMonth || 'Septiembre');
      }

      // Si hay usuarios cargados y el usuario actual aún no tiene datos completos del servidor
      if (usrs.length > 0 && currentUser.id === 'usr-superadmin') {
        const foundSuper = usrs.find((u: User) => u.role === 'superadmin');
        if (foundSuper) setCurrentUser(foundSuper);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  // Sincronización con fecha de hoy al iniciar la sesión
  useEffect(() => {
    const initDate = async () => {
      try {
        const dateCheck = await api.getSystemDateStatus();
        if (dateCheck) {
          setServerDateInfo(dateCheck);
          setSelectedMonth(dateCheck.currentMonth);
          setSelectedYear(dateCheck.currentYear);
        }
      } catch (e) {
        // Fallback local
        const today = new Date();
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        setSelectedMonth(monthNames[today.getMonth()]);
        setSelectedYear(String(today.getFullYear()));
      }
    };
    initDate();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Conteo de facturas y cotizaciones no entregadas
  const undeliveredCount = useMemo(() => {
    return invoices.filter(i => (i.delivered || '').toUpperCase() !== 'SÍ').length;
  }, [invoices]);

  const quotationsToRollCount = useMemo(() => {
    return invoices.filter(i => {
      const isCot = (i.invoiceNumber || '').toUpperCase().startsWith('COT') || (i.service || '').toUpperCase().startsWith('COT');
      return isCot && (i.delivered || '').toUpperCase() !== 'SÍ';
    }).length;
  }, [invoices]);

  // Selector unificado de Mes y Año por Calendario
  const handleSelectMonthYear = async (newMonth: string, newYear: string) => {
    if (newMonth === 'Todos') {
      setSelectedMonth('Todos');
      setSelectedYear(newYear);
      return;
    }

    const monthMap: Record<string, number> = {
      'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
      'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
      'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
    };
    const targetNum = monthMap[newMonth.toLowerCase()];
    
    // Comprobar si existen facturas ya cargadas para ese mes y año
    const existsInMonth = invoices.some(inv => {
      if (inv.id && inv.id.toLowerCase().includes(`${newYear}-${newMonth.toLowerCase()}`)) {
        return true;
      }
      const d = inv.emissionDate || inv.createdAt || '';
      if (!d) return false;
      const cleanDate = d.split('T')[0].split(' ')[0];
      const parts = cleanDate.split(/[-/]/);
      if (parts.length >= 3) {
        const y = parts[0].length === 4 ? parts[0] : parts[2];
        const m = parseInt(parts[0].length === 4 ? parts[1] : parts[1], 10);
        return m === targetNum && y === newYear;
      }
      return false;
    });

    if (existsInMonth) {
      setSelectedMonth(newMonth);
      setSelectedYear(newYear);
    } else {
      // Si el mes no tiene facturas aún, preguntar para inicializar
      // NO modificamos selectedMonth/selectedYear hasta que el usuario confirme
      try {
        const dateCheck = await api.getSystemDateStatus(newMonth, newYear);
        if (dateCheck) {
          setServerDateInfo(dateCheck);
          if (dateCheck.previousMonth) {
            setRolloverPreviousMonth(dateCheck.previousMonth);
          }
        }
      } catch (e) {
        // fallback
      }
      setRolloverTargetMonth(newMonth);
      setRolloverTargetYear(newYear);
      setIsRolloverModalOpen(true);
    }
  };

  // Confirmación de inicio de mes
  const handleConfirmRollover = async (keepUndelivered: boolean) => {
    try {
      await api.handleMonthTransition(
        rolloverTargetYear,
        rolloverTargetMonth,
        selectedYear,
        rolloverPreviousMonth,
        keepUndelivered
      );
      setSelectedMonth(rolloverTargetMonth);
      setSelectedYear(rolloverTargetYear);
      setIsRolloverModalOpen(false);
      notifySuccess(
        `Mes ${rolloverTargetMonth} Inicializado`,
        keepUndelivered
          ? 'Se cargó la plantilla en $0.00 y se mantuvieron las facturas pendientes.'
          : 'Se generó la plantilla de conceptos recurrentes en $0.00.'
      );
      await loadData();
    } catch (err: any) {
      notifyError('Error en inicio de mes', err.message);
    }
  };

  // CONTROL DE ACCESOS POR ÁREA:
  // Si el usuario es Superadmin, ve todos los proveedores y facturas.
  // Si es Admin de Área, solo ve y gestiona proveedores y facturas de su área.
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const userArea = currentUser?.area || 'General';

  const scopedSuppliers = useMemo(() => {
    if (isSuperAdmin) return suppliers;
    return suppliers.filter(s => (s.area || '').toLowerCase() === userArea.toLowerCase());
  }, [suppliers, isSuperAdmin, userArea]);

  const scopedSupplierNames = useMemo(() => {
    return scopedSuppliers.map(s => s.name.toLowerCase());
  }, [scopedSuppliers]);

  // Filtrado reactivo en el frontend para facturas según mes, año y área
  const filteredInvoicesByDate = useMemo(() => {
    const monthMap: Record<string, number> = {
      'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
      'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
      'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
    };

    return invoices.filter(inv => {
      // Alcance por área para Admin de Área
      if (!isSuperAdmin) {
        const matchesSupplier = scopedSupplierNames.includes((inv.supplier || '').toLowerCase());
        if (!matchesSupplier) return false;
      }

      // Si el id contiene explícitamente el mes y año (ej: rec-sup-1-0-2026-octubre)
      if (selectedMonth !== 'Todos') {
        const monthTag = `${selectedYear}-${selectedMonth.toLowerCase()}`;
        if (inv.id && inv.id.toLowerCase().includes(monthTag)) {
          return true;
        }
      }

      const dateStr = inv.emissionDate || inv.createdAt || '';
      if (!dateStr) return selectedMonth === 'Todos';
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
  }, [invoices, selectedMonth, selectedYear, isSuperAdmin, scopedSupplierNames]);

  // Actualización rápida de campo inline en tabla de facturas
  const handleUpdateInvoiceField = async (id: string, field: string, value: any) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, [field]: value } : inv));
    try {
      await api.updateInvoiceField(id, field, value);
      if (field === 'delivered' && value === 'SÍ') {
        notifySuccess('Factura Entregada', 'Se registró la entrega efectiva del documento.');
      }
    } catch (err: any) {
      notifyError('Error al actualizar campo', err.message);
      loadData();
    }
  };

  // Guardar Proveedor (Crear o Editar)
  const handleSaveSupplier = async (supplierData: Partial<Supplier>) => {
    try {
      // Si el usuario es admin de área, auto-asigna su área
      const dataToSave = {
        ...supplierData,
        area: !isSuperAdmin ? userArea : (supplierData.area || 'General')
      };
      await api.createOrUpdateSupplier(dataToSave);
      notifySuccess('Proveedor Guardado', 'Los datos del proveedor se actualizaron correctamente.');
      await loadData();
    } catch (err: any) {
      notifyError('Error al guardar proveedor', err.message);
    }
  };

  // Guardar Factura / Cotización (No recurrente o regular)
  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      await api.createOrUpdateInvoice(invoiceData);
      notifySuccess('Factura Registrada', 'El documento se guardó correctamente.');
      await loadData();
    } catch (err: any) {
      notifyError('Error al guardar documento', err.message);
    }
  };

  // Editar factura (abrir modal con lápiz)
  const handleEditInvoice = (inv: Invoice) => {
    setSelectedInvoiceForEdit(inv);
    setIsInvoiceModalOpen(true);
  };

  // Eliminación de factura
  const handleDeleteInvoice = async (id: string) => {
    const confirmed = await confirmDelete(
      '¿Eliminar Factura?',
      '¿Deseas eliminar este registro de factura? Esta acción no se puede revertir.',
      'Sí, eliminar factura'
    );
    if (!confirmed) return;
    try {
      await api.deleteInvoice(id);
      notifySuccess('Factura eliminada', 'El registro ha sido removido del sistema.');
      loadData();
    } catch (err: any) {
      notifyError('Error al eliminar', err.message);
    }
  };

  // Eliminación de proveedor
  const handleDeleteSupplier = async (id: string) => {
    const confirmed = await confirmDelete(
      '¿Eliminar Proveedor?',
      'Se removerá este proveedor del directorio corporativo junto con sus conceptos asociados.',
      'Sí, eliminar proveedor'
    );
    if (!confirmed) return;
    try {
      await api.deleteSupplier(id);
      notifySuccess('Proveedor eliminado', 'El proveedor fue retirado del sistema.');
      loadData();
    } catch (err: any) {
      notifyError('Error al eliminar proveedor', err.message);
    }
  };

  // Actualización de conceptos / servicios de un proveedor
  const handleUpdateSupplierServices = async (supId: string, services: any[]) => {
    setSuppliers(prev => prev.map(s => s.id === supId ? { ...s, services } : s));
    try {
      await api.updateSupplierServices(supId, services);
      notifySuccess('Conceptos Actualizados', 'La lista de conceptos recurrentes se actualizó.');
    } catch (err: any) {
      notifyError('Error al guardar conceptos', err.message);
      loadData();
    }
  };

  // Funciones de Inventario TI
  const handleSaveInventoryItem = async (item: Partial<TechInventoryItem>) => {
    try {
      await api.saveInventoryItem(item);
      notifySuccess('Artículo Guardado', 'El equipo o periférico fue registrado con éxito en el stock.');
      await loadData();
    } catch (err: any) {
      notifyError('Error al guardar artículo', err.message);
    }
  };

  const handleLoanInventoryItem = async (id: string, qty: number, recipient: string, area: string, actionType: string) => {
    try {
      await api.loanInventoryItem(id, qty, recipient, area, actionType);
      notifySuccess('Movimiento Registrado', `${actionType} procesado para ${recipient} (${area}).`);
      await loadData();
    } catch (err: any) {
      notifyError('Error en préstamo / entrega', err.message);
    }
  };

  const handleReturnInventoryMovement = async (movementId: string, returnQty?: number, notes?: string) => {
    try {
      await api.returnInventoryMovement(movementId, returnQty, notes);
      notifySuccess('Devolución Procesada', 'El equipo fue reincorporado al stock disponible de TI.');
      await loadData();
    } catch (err: any) {
      notifyError('Error al procesar devolución', err.message);
    }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    const confirmed = await confirmDelete(
      '¿Eliminar del Inventario?',
      '¿Deseas eliminar definitivamente este artículo del inventario de TI?',
      'Sí, eliminar equipo'
    );
    if (!confirmed) return;
    try {
      await api.deleteInventoryItem(id);
      notifySuccess('Artículo Eliminado', 'El registro fue retirado del inventario.');
      await loadData();
    } catch (err: any) {
      notifyError('Error al eliminar artículo', err.message);
    }
  };

  // Funciones de Categorías TI
  const handleSaveCategory = async (cat: Partial<InventoryCategory>) => {
    try {
      await api.saveInventoryCategory(cat);
      notifySuccess('Categoría Guardada', 'La categoría fue registrada con éxito.');
      await loadData();
    } catch (err: any) {
      notifyError('Error al guardar categoría', err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmed = await confirmDelete(
      '¿Eliminar Categoría?',
      'Se eliminará este tipo de clasificación del inventario.',
      'Sí, eliminar'
    );
    if (!confirmed) return;
    try {
      await api.deleteInventoryCategory(id);
      notifySuccess('Categoría Eliminada', 'Se eliminó la categoría del inventario.');
      await loadData();
    } catch (err: any) {
      notifyError('Error al eliminar categoría', err.message);
    }
  };

  // Funciones de Áreas de la Empresa
  const handleSaveArea = async (areaData: Partial<CompanyArea>) => {
    try {
      await api.saveCompanyArea(areaData);
      notifySuccess('Área Guardada', 'El área corporativa fue registrada con éxito.');
      await loadData();
    } catch (err: any) {
      notifyError('Error al guardar área', err.message);
    }
  };

  const handleDeleteArea = async (id: string) => {
    const confirmed = await confirmDelete(
      '¿Eliminar Área?',
      'Se eliminará este departamento de la estructura corporativa.',
      'Sí, eliminar área'
    );
    if (!confirmed) return;
    try {
      await api.deleteCompanyArea(id);
      notifySuccess('Área Eliminada', 'El área fue retirada del sistema.');
      await loadData();
    } catch (err: any) {
      notifyError('Error al eliminar área', err.message);
    }
  };

  // Funciones de Usuarios del Sistema
  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      await api.saveUser(userData);
      notifySuccess('Usuario Guardado', 'El usuario y sus permisos se configuraron correctamente.');
      await loadData();
    } catch (err: any) {
      notifyError('Error al guardar usuario', err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const confirmed = await confirmDelete(
      '¿Eliminar Usuario?',
      'Se removerá el acceso de este usuario al sistema de Alimentos Enriko.',
      'Sí, eliminar usuario'
    );
    if (!confirmed) return;
    try {
      await api.deleteUser(id);
      notifySuccess('Usuario Eliminado', 'El usuario fue retirado del sistema.');
      await loadData();
    } catch (err: any) {
      notifyError('Error al eliminar usuario', err.message);
    }
  };

  // Manejador de Login Exitoso
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('ae_auth_user', JSON.stringify(user));
    loadData();
  };

  // Manejador de Cerrar Sesión
  const handleLogout = async () => {
    const confirmed = await confirmAction(
      '¿Deseas cerrar la sesión activa del sistema?',
      'Se cerrará la sesión de trabajo actual y regresarás a la pantalla de login.',
      'Sí, cerrar sesión'
    );
    if (confirmed) {
      localStorage.removeItem('ae_auth_user');
      localStorage.removeItem('token');
      localStorage.removeItem('current_user');
      setIsAuthenticated(false);
      notifySuccess('Sesión Cerrada', 'Has cerrado tu sesión de forma segura.');
    }
  };

  // Pantalla de Carga Inicial
  if (!mounted || isAuthenticated === null) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-slate-100 dark:bg-zinc-950 ${darkMode ? 'dark' : ''}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 tracking-wider uppercase">Cargando Alimentos Enriko...</span>
        </div>
      </div>
    );
  }

  // Pantalla de Autenticación / Login Oficial
  if (isAuthenticated === false) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* SIDEBAR CORPORATIVO */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={(v) => setCurrentView(v as any)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        currentUser={currentUser}
      />

      {/* CONTENIDO PRINCIPAL CON AJUSTE COMPLETO Y SCROLL SUAVE */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <TopNavbar 
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          onSelectMonthYear={handleSelectMonthYear}
          serverDateInfo={serverDateInfo}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          currentUser={currentUser}
          users={users}
          onSwitchUser={(u) => {
            setCurrentUser(u);
            localStorage.setItem('ae_auth_user', JSON.stringify(u));
            notifyInfo(`Sesión cambiada a: ${u.name}`, u.role === 'superadmin' ? 'Acceso global total activo' : `Permisos restringidos a: ${u.area}`);
          }}
          onLogout={handleLogout}
        />

        <main className="p-3 sm:p-7 flex-1 max-w-full overflow-x-hidden">
          {/* BANNER AVISO SI ES ADMIN DE ÁREA CON BOTÓN RÁPIDO PARA VOLVER */}
          {!isSuperAdmin && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="truncate">
                  Estás navegando como <strong>Admin de Área ({userArea})</strong>. Solo puedes gestionar proveedores y facturas correspondientes a tu departamento.
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    const superAdmin = users.find(u => u.role === 'superadmin') || {
                      id: 'usr-superadmin',
                      username: 'superadmin',
                      name: 'David Sarria (Superadmin)',
                      email: 'superadmin@alimentosenriko.com',
                      role: 'superadmin',
                      area: 'Dirección General',
                      status: 'Activo'
                    };
                    setCurrentUser(superAdmin);
                    notifySuccess('Sesión Restaurada', 'Has vuelto al perfil de Superadministrador con control global.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  title="Regresar al usuario Super Administrador"
                >
                  <span>↩ Volver a Superadmin</span>
                </button>
                <span className="font-bold text-[10px] uppercase tracking-wider bg-amber-200/60 dark:bg-amber-900/60 px-2 py-1 rounded-lg">
                  Vista Filtrada
                </span>
              </div>
            </div>
          )}

          {/* VISTA DASHBOARD */}
          {currentView === 'dashboard' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2 flex-wrap">
                    <span>Panel de Control y Analítica</span>
                    <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                      {selectedMonth} {selectedYear}
                    </span>
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Control documental y cumplimiento en Alimentos Enriko S.A.S.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      setSelectedInvoiceForEdit(null);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    <span>+ Agregar Factura / Cotización</span>
                  </button>
                </div>
              </div>


              {/* KPIS Y GRAFICOS */}
              <DashboardKpis metrics={metrics} loading={loading} />
              <DashboardCharts 
                monthlyStats={metrics?.monthlyStats}
                weeklyData={metrics?.weeklyReceivedDelivered}
                recurrenceStudy={metrics?.recurrenceStudy}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
              />
            </div>
          )}

          {/* VISTA FACTURAS Y COTIZACIONES */}
          {currentView === 'invoices' && (
            <InvoicesModule 
              invoices={filteredInvoicesByDate}
              onUpdateField={handleUpdateInvoiceField}
              onDeleteInvoice={handleDeleteInvoice}
              onEditInvoice={handleEditInvoice}
              onAddInvoice={() => {
                setSelectedInvoiceForEdit(null);
                setIsInvoiceModalOpen(true);
              }}
              onOpenDeliveredModal={() => setIsDeliveredModalOpen(true)}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}

          {/* VISTA BANDEJA FACTURE.CO & TRAZABILIDAD */}
          {currentView === 'facture' && (
            <FactureModule onInvoicesUpdated={loadData} />
          )}

          {/* VISTA PROVEEDORES */}
          {currentView === 'suppliers' && (
            <SuppliersModule 
              suppliers={scopedSuppliers}
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

          {/* VISTA INVENTARIO TI */}
          {currentView === 'inventory' && (
            <TechInventoryModule 
              inventory={inventory}
              movements={movements}
              categories={categories}
              onSaveItem={handleSaveInventoryItem}
              onLoanItem={handleLoanInventoryItem}
              onReturnMovement={handleReturnInventoryMovement}
              onDeleteItem={handleDeleteInventoryItem}
            />
          )}

          {/* VISTA ÁREAS CORPORATIVAS */}
          {currentView === 'areas' && (
            <AreasModule 
              areas={areas}
              invoices={invoices}
              suppliers={suppliers}
              inventory={inventory}
              onSaveArea={handleSaveArea}
              onDeleteArea={handleDeleteArea}
            />
          )}

          {/* VISTA CATEGORÍAS TI (SOLO SUPERADMIN) */}
          {currentView === 'categories' && isSuperAdmin && (
            <CategoriesModule 
              categories={categories}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* VISTA USUARIOS & ROLES (SOLO SUPERADMIN) */}
          {currentView === 'users' && isSuperAdmin && (
            <UsersModule 
              users={users}
              areas={areas}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* VISTA CONFIGURACIONES DEL SISTEMA & CORREO OUTLOOK */}
          {currentView === 'settings' && (
            <SettingsModule onSettingsUpdated={loadData} />
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
        suppliers={scopedSuppliers}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
        initialInvoice={selectedInvoiceForEdit}
      />

      {/* MODAL PREGUNTA INICIO DE MES & ROLLOVER DE NO ENTREGADAS */}
      <MonthRolloverModal 
        isOpen={isRolloverModalOpen}
        onClose={() => setIsRolloverModalOpen(false)}
        onConfirm={handleConfirmRollover}
        targetMonth={rolloverTargetMonth}
        targetYear={rolloverTargetYear}
        previousMonth={rolloverPreviousMonth}
        undeliveredCount={undeliveredCount}
        quotationsToRollCount={quotationsToRollCount}
        serverDateInfo={serverDateInfo}
      />

      {/* MODAL FACTURAS ENTREGADAS (REPORTE EXCEL & OUTLOOK) */}
      <DeliveredInvoicesModal 
        isOpen={isDeliveredModalOpen}
        onClose={() => setIsDeliveredModalOpen(false)}
        invoices={filteredInvoicesByDate}
        onRefreshData={loadData}
        onOpenSettings={() => setIsEmailSettingsModalOpen(true)}
        emailSettings={emailSettings}
      />

      {/* MODAL CONFIGURACIÓN RÁPIDA DE CORREO / OUTLOOK */}
      <EmailSettingsModal 
        isOpen={isEmailSettingsModalOpen}
        onClose={() => setIsEmailSettingsModalOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}
