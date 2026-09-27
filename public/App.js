const { useState, useMemo, useEffect, useCallback } = React;

// Mapeo de rutas web limpias a vistas internas
const ROUTE_MAP = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/facturas': 'invoices',
  '/proveedores': 'suppliers',
  '/crm': 'crm',
  '/inventario': 'inventory',
  '/presupuestos': 'budgets',
  '/areas': 'areas',
  '/reportes': 'reports',
  '/alertas': 'alerts',
  '/usuarios': 'users',
  '/configuracion': 'settings',
  '/carpetas': 'folders',
  '/historial': 'history'
};

const VIEW_TO_PATH = {
  'dashboard': '/dashboard',
  'invoices': '/facturas',
  'suppliers': '/proveedores',
  'crm': '/crm',
  'inventory': '/inventario',
  'budgets': '/presupuestos',
  'areas': '/areas',
  'reports': '/reportes',
  'alerts': '/alertas',
  'users': '/usuarios',
  'settings': '/configuracion',
  'folders': '/carpetas',
  'history': '/historial'
};

function getInitialView() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  return ROUTE_MAP[path] || 'dashboard';
}

function App() {
  const [currentView, setCurrentViewInternal] = useState(getInitialView);

  // Función de navegación con actualización de la URL en la barra de direcciones
  const navigateTo = useCallback((view, replace = false) => {
    setCurrentViewInternal(view);
    const targetPath = VIEW_TO_PATH[view] || '/dashboard';
    if (window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({ view }, '', targetPath);
      } else {
        window.history.pushState({ view }, '', targetPath);
      }
    }
  }, []);

  // Escuchar eventos de navegación del navegador (flechas atrás / adelante)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setCurrentViewInternal(event.state.view);
      } else {
        const viewFromPath = getInitialView();
        setCurrentViewInternal(viewFromPath);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Asegurar que la URL actual tenga el estado inicial
    const currentPath = VIEW_TO_PATH[currentView] || '/dashboard';
    window.history.replaceState({ view: currentView }, '', currentPath);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setCurrentView = (view) => navigateTo(view);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('ae_sidebar_collapsed') === 'true');
  const [selectedMonth, setSelectedMonth] = useState('Todos');
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [currentTab, setCurrentTab] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('Todos');
  const [selectedFactureFilter, setSelectedFactureFilter] = useState('Todos');
  
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [isExcelPreviewOpen, setIsExcelPreviewOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('ae_sidebar_collapsed', next.toString());
      return next;
    });
  };

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ae_dark') === 'true');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ae_user');
      return saved ? JSON.parse(saved) : null;
    } catch(e) {
      return null;
    }
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('ae_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      text: 'Tendrás que iniciar sesión nuevamente para acceder.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48'
    }).then(res => {
      if (res.isConfirmed) {
        setCurrentUser(null);
        localStorage.removeItem('ae_user');
      }
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('ae_dark', darkMode.toString());
  }, [darkMode]);

  const [suppliers, setSuppliers] = useState([]);
  const [manualInvoices, setManualInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [users, setUsers] = useState([]);
  const [techInventory, setTechInventory] = useState([]);
  const [techBudgets, setTechBudgets] = useState([]);
  const [areas, setAreas] = useState([]);

  const loadInitialData = async () => {
    try {
      const [supData, invData, crmData, usrData, invTiData, budData, areaData] = await Promise.all([
        window.API.suppliers.getAll(),
        window.API.invoices.getAll(),
        window.API.crm.getAll(),
        window.API.users.getAll(),
        window.API.inventory.getAll(),
        window.API.budgets.getAll(),
        window.API.areas.getAll()
      ]);
      if (Array.isArray(supData)) setSuppliers(supData);
      if (Array.isArray(invData)) setManualInvoices(invData);
      if (Array.isArray(crmData)) setQuotations(crmData);
      if (Array.isArray(usrData) && usrData.length > 0) setUsers(usrData);
      if (Array.isArray(invTiData)) setTechInventory(invTiData);
      if (Array.isArray(budData)) setTechBudgets(budData);
      if (Array.isArray(areaData)) setAreas(areaData);
    } catch (e) {
      console.error('Error cargando datos iniciales:', e);
    }
  };

  const handleSaveQuotation = async (quotationObj) => {
    try {
      await window.API.crm.save(quotationObj);
      const data = await window.API.crm.getAll();
      if (Array.isArray(data)) setQuotations(data);
    } catch (e) {
      console.error('Error guardando cotización:', e);
    }
  };

  const handleDeleteQuotation = async (quotationId) => {
    try {
      await window.API.crm.delete(quotationId);
      setQuotations(prev => prev.filter(q => q.id !== quotationId));
      Swal.fire('Eliminado', 'Solicitud removida.', 'success');
    } catch (e) {
      console.error('Error eliminando cotización:', e);
    }
  };

  // HANDLERS DE INVENTARIO TI
  const handleAddOrUpdateInventoryItem = async (item) => {
    try {
      await window.API.inventory.save(item);
      const data = await window.API.inventory.getAll();
      if (Array.isArray(data)) setTechInventory(data);
      Swal.fire('Guardado', 'Equipo registrado en inventario MySQL.', 'success');
    } catch (e) {
      console.error('Error guardando inventario:', e);
      Swal.fire('Error', 'No se pudo guardar en inventario.', 'error');
    }
  };

  const handleDeliverInventoryItem = async (deliverData) => {
    try {
      const res = await window.API.inventory.deliver(deliverData);
      if (res.success) {
        const data = await window.API.inventory.getAll();
        if (Array.isArray(data)) setTechInventory(data);
        Swal.fire('¡Entrega Registrada!', `${res.deliveredQuantity} unidades entregadas exitosamente. Stock restante: ${res.remainingQuantity}`, 'success');
      } else {
        Swal.fire('Error', res.error || 'No se pudo registrar la entrega.', 'error');
      }
    } catch (e) {
      console.error('Error entregando equipo:', e);
      Swal.fire('Error', 'No se pudo completar la entrega.', 'error');
    }
  };

  const handleDeleteInventoryItem = async (id) => {
    try {
      await window.API.inventory.delete(id);
      setTechInventory(prev => prev.filter(i => i.id !== id));
      Swal.fire('Eliminado', 'Equipo removido del inventario.', 'success');
    } catch (e) {
      console.error('Error eliminando inventario:', e);
    }
  };

  // HANDLERS DE PRESUPUESTOS TI
  const handleSaveBudget = async (budgetObj) => {
    try {
      await window.API.budgets.save(budgetObj);
      const data = await window.API.budgets.getAll();
      if (Array.isArray(data)) setTechBudgets(data);
      Swal.fire('Guardado', 'Ítem presupuestal registrado en MySQL.', 'success');
    } catch (e) {
      console.error('Error guardando presupuesto:', e);
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await window.API.budgets.delete(id);
      setTechBudgets(prev => prev.filter(b => b.id !== id));
      Swal.fire('Eliminado', 'Rubro presupuestal eliminado.', 'success');
    } catch (e) {
      console.error('Error eliminando presupuesto:', e);
    }
  };

  // HANDLERS DE ÁREAS
  const handleSaveArea = async (areaObj) => {
    try {
      await window.API.areas.save(areaObj);
      const data = await window.API.areas.getAll();
      if (Array.isArray(data)) setAreas(data);
      Swal.fire('Guardado', 'Área organizacional registrada en MySQL.', 'success');
    } catch (e) {
      console.error('Error guardando área:', e);
    }
  };

  const handleDeleteArea = async (id) => {
    try {
      await window.API.areas.delete(id);
      setAreas(prev => prev.filter(a => a.id !== id));
      Swal.fire('Eliminado', 'Área removida de la estructura.', 'success');
    } catch (e) {
      console.error('Error eliminando área:', e);
    }
  };

  useEffect(() => {
    loadInitialData();

    // LIVE REAL-TIME SSE: Sincronización instantánea entre pestañas/navegadores sin recargar
    let eventSource = null;
    let reconnectTimeout = null;

    const setupSSE = () => {
      try {
        eventSource = new EventSource('/api/events');
        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'SUPPLIERS_UPDATED') {
              window.API.suppliers.getAll()
                .then(data => { if (Array.isArray(data)) setSuppliers(data); });
            } else if (parsed.type === 'INVOICES_UPDATED') {
              window.API.invoices.getAll()
                .then(data => { if (Array.isArray(data)) setManualInvoices(data); });
            } else if (parsed.type === 'CRM_UPDATED') {
              window.API.crm.getAll()
                .then(data => { if (Array.isArray(data)) setQuotations(data); });
            } else if (parsed.type === 'INVENTORY_UPDATED') {
              window.API.inventory.getAll()
                .then(data => { if (Array.isArray(data)) setTechInventory(data); });
            } else if (parsed.type === 'BUDGETS_UPDATED') {
              window.API.budgets.getAll()
                .then(data => { if (Array.isArray(data)) setTechBudgets(data); });
            } else if (parsed.type === 'AREAS_UPDATED') {
              window.API.areas.getAll()
                .then(data => { if (Array.isArray(data)) setAreas(data); });
            }
          } catch (e) {}
        };
        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (!reconnectTimeout) {
            reconnectTimeout = setTimeout(() => {
              reconnectTimeout = null;
              setupSSE();
            }, 10000);
          }
        };
      } catch(e) {}
    };

    setupSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) eventSource.close();
    };
  }, []);

  const [selectedSignedFilter, setSelectedSignedFilter] = useState('Todos');
  const [selectedOrderStdFilter, setSelectedOrderStdFilter] = useState('Todos');
  const [selectedOcFilter, setSelectedOcFilter] = useState('Todos');
  const [selectedDeliveredFilter, setSelectedDeliveredFilter] = useState('Todos');

  const monthMap = {
    'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
    'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
    'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
  };

  const activeInvoices = useMemo(() => {
    let list = [...(manualInvoices || [])];
    const targetYear = selectedYear !== 'Todos' ? selectedYear : '2026';
    const targetMonthNum = (selectedMonth !== 'Todos' && monthMap[selectedMonth]) ? monthMap[selectedMonth] : '';

    (suppliers || []).forEach(sup => {
      const services = sup.services || [];
      services.forEach((srv, idx) => {
        if (srv.enabled !== false) {
          const supName = sup.name || '';
          const srvName = srv.serviceName || `Servicio #${idx + 1}`;
          const isQuotation = srv.type === 'cotizacion';
          
          const exists = list.some(i => {
            const sameSup = (i.supplier || '') === supName;
            const sameSrv = (i.service || '') === srvName;
            if (!sameSup || !sameSrv) return false;

            if (targetMonthNum) {
              const iMonth = (i.emissionDate || '').substring(5, 7) || (i.deliveryDate || '').substring(5, 7);
              const iYear = (i.emissionDate || '').substring(0, 4) || (i.deliveryDate || '').substring(0, 4);
              return (!iMonth || iMonth === targetMonthNum) && (!iYear || iYear === targetYear);
            }
            return true;
          });

          if (!exists) {
            list.push({
              id: `auto-${sup.id}-${idx}-${targetYear}-${targetMonthNum || 'all'}`,
              logoText: (supName.substring(0, 2) || 'PR').toUpperCase(),
              supplier: supName,
              service: srvName,
              docType: isQuotation ? 'cotizacion' : 'factura',
              invoiceNumber: isQuotation ? 'COT-' : '',
              emissionDate: '',
              deliveryDate: '',
              value: 0,
              signed: 'NO',
              orderStd: 'NO',
              oc: '',
              enFacture: 'NO',
              delivered: 'NO',
              pdfPath: null,
              pdfOriginalName: null
            });
          }
        }
      });
    });

    return list;
  }, [suppliers, manualInvoices, selectedMonth, selectedYear]);

  // PROVEEDORES DISPONIBLES EN EL DROPDOWN
  const suppliersList = useMemo(() => {
    return Array.from(new Set(activeInvoices.map(i => i.supplier)));
  }, [activeInvoices]);

  // ALERTAS REALES CALCULADAS
  const realAlerts = useMemo(() => {
    const list = [];
    const now = new Date('2026-09-01');

    activeInvoices.forEach(inv => {
      const delivDate = new Date(inv.deliveryDate);
      if (delivDate < now && inv.delivered !== 'SÍ') {
        const diffDays = Math.max(1, Math.floor((now - delivDate) / (1000 * 60 * 60 * 24)));
        list.push({
          type: 'red',
          title: `Factura Atrasada (${inv.invoiceNumber || 'Sin N°'})`,
          message: `${inv.supplier} - Vencida hace ${diffDays} día(s)`,
          tag: '▲ Urgente'
        });
      }

      if (inv.enFacture === 'NO' || inv.enFacture === 'AÚN NO') {
        list.push({
          type: 'amber',
          title: `Pendiente en Facture (${inv.invoiceNumber || 'Sin N°'})`,
          message: `${inv.supplier} aún no ha sido radicada`,
          tag: 'Aún no llega'
        });
      }

      if (inv.signed === 'NO') {
        list.push({
          type: 'blue',
          title: `Firma Pendiente (${inv.invoiceNumber || 'Sin N°'})`,
          message: `${inv.supplier} requiere autorización`,
          tag: 'Por firmar'
        });
      }
    });

    return list;
  }, [activeInvoices]);

  // FILTRADO DINÁMICO DE FACTURAS POR TEXTO, PROVEEDOR, FIRMADA, ORDEN STD, OC, FACTURE, ENTREGADA, PESTAÑAS, MES Y AÑO
  const filteredRows = useMemo(() => {
    return activeInvoices.filter(inv => {
      // 1. Filtro por texto
      const matchText = (inv.supplier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (inv.service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (inv.oc || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchText) return false;

      // 2. Filtro por proveedor
      if (selectedSupplier !== 'Todos' && inv.supplier !== selectedSupplier) return false;

      // 3. Filtro por estado en Facture
      if (selectedFactureFilter !== 'Todos') {
        const isFactureYes = inv.enFacture === 'SÍ';
        if (selectedFactureFilter === 'SÍ' && !isFactureYes) return false;
        if (selectedFactureFilter === 'NO' && isFactureYes) return false;
      }

      // 4. Filtro por Firmada
      if (selectedSignedFilter !== 'Todos') {
        const isSignedYes = inv.signed === 'SÍ';
        if (selectedSignedFilter === 'SÍ' && !isSignedYes) return false;
        if (selectedSignedFilter === 'NO' && isSignedYes) return false;
      }

      // 5. Filtro por Orden STD
      if (selectedOrderStdFilter !== 'Todos') {
        const isOrderStdYes = inv.orderStd === 'SÍ';
        if (selectedOrderStdFilter === 'SÍ' && !isOrderStdYes) return false;
        if (selectedOrderStdFilter === 'NO' && isOrderStdYes) return false;
      }

      // 6. Filtro por OC
      if (selectedOcFilter !== 'Todos') {
        const hasOc = !!(inv.oc && inv.oc.trim().length > 0);
        if (selectedOcFilter === 'CON_OC' && !hasOc) return false;
        if (selectedOcFilter === 'SIN_OC' && hasOc) return false;
      }

      // 7. Filtro por Entregada
      if (selectedDeliveredFilter !== 'Todos') {
        const isDeliveredYes = inv.delivered === 'SÍ';
        if (selectedDeliveredFilter === 'SÍ' && !isDeliveredYes) return false;
        if (selectedDeliveredFilter === 'NO' && isDeliveredYes) return false;
      }

      // 8. Filtro por Año
      if (selectedYear !== 'Todos') {
        const invYear = (inv.emissionDate || '').substring(0, 4) || (inv.deliveryDate || '').substring(0, 4);
        if (invYear && invYear !== selectedYear) return false;
      }

      // 9. Filtro por Mes
      if (selectedMonth !== 'Todos') {
        const monthNum = monthMap[selectedMonth];
        const invMonth = (inv.emissionDate || '').substring(5, 7) || (inv.deliveryDate || '').substring(5, 7);
        if (monthNum && invMonth && invMonth !== monthNum) return false;
      }

      // 10. Filtro por Pestañas
      const isCot = (inv.invoiceNumber || '').toUpperCase().startsWith('COT') || inv.docType === 'cotizacion';
      const isFac = (inv.invoiceNumber || '').toUpperCase().startsWith('FAC') || (!isCot && inv.docType !== 'cotizacion');

      if (currentTab === 'Facturas' && !isFac) return false;
      if (currentTab === 'Cotizaciones' && !isCot) return false;
      if (currentTab === 'Pendientes' && inv.delivered === 'SÍ') return false;
      if (currentTab === 'Atrasadas') {
        const isDelayed = new Date(inv.deliveryDate) < new Date('2026-09-01') && inv.delivered !== 'SÍ';
        if (!isDelayed) return false;
      }
      if (currentTab === 'En Facture' && inv.enFacture !== 'SÍ') return false;

      return true;
    });
  }, [
    activeInvoices, searchTerm, selectedSupplier, selectedFactureFilter, 
    selectedSignedFilter, selectedOrderStdFilter, selectedOcFilter, selectedDeliveredFilter,
    selectedMonth, selectedYear, currentTab
  ]);

  // CONTEO PARA TABS
  const tabCounts = useMemo(() => {
    return {
      total: activeInvoices.length,
      fac: activeInvoices.filter(i => (i.invoiceNumber || '').toUpperCase().startsWith('FAC') || i.docType === 'factura').length,
      cot: activeInvoices.filter(i => (i.invoiceNumber || '').toUpperCase().startsWith('COT') || i.docType === 'cotizacion').length,
      pending: activeInvoices.filter(i => i.delivered !== 'SÍ').length,
      delayed: activeInvoices.filter(i => new Date(i.deliveryDate) < new Date('2026-09-01') && i.delivered !== 'SÍ').length,
      facture: activeInvoices.filter(i => i.enFacture === 'SÍ').length
    };
  }, [activeInvoices]);

  // SELECCION DE CHECKBOXES PARA VISTA PREVIA EXCEL
  const handleToggleSelectRow = (id) => {
    if (selectedInvoiceIds.includes(id)) {
      setSelectedInvoiceIds(selectedInvoiceIds.filter(i => i !== id));
    } else {
      setSelectedInvoiceIds([...selectedInvoiceIds, id]);
    }
  };

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      const visibleIds = filteredRows.map(r => r.id);
      setSelectedInvoiceIds(Array.from(new Set([...selectedInvoiceIds, ...visibleIds])));
    } else {
      const visibleIds = filteredRows.map(r => r.id);
      setSelectedInvoiceIds(selectedInvoiceIds.filter(id => !visibleIds.includes(id)));
    }
  };

  const invoicesForExcelPreview = useMemo(() => {
    if (selectedInvoiceIds.length > 0) {
      return activeInvoices.filter(i => selectedInvoiceIds.includes(i.id));
    }
    const delivered = activeInvoices.filter(i => i.delivered === 'SÍ');
    return delivered.length > 0 ? delivered : filteredRows;
  }, [selectedInvoiceIds, activeInvoices, filteredRows]);

  // SUBIR ARCHIVO PDF FÍSICO AL SERVIDOR LOCAL (/uploads)
  const handleUploadPdf = (invoiceId) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf,image/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        Swal.fire({ title: 'Guardando archivo PDF en el dispositivo...', didOpen: () => Swal.showLoading() });
        const data = await window.API.invoices.uploadPdf(file);

        if (data.success) {
          const invObj = activeInvoices.find(i => i.id === invoiceId) || { id: invoiceId };
          const updatedInv = { ...invObj, pdfPath: data.relativePath, pdfOriginalName: data.originalName };
          
          setManualInvoices(prev => {
            const exists = prev.some(i => i.id === invoiceId);
            return exists ? prev.map(i => i.id === invoiceId ? updatedInv : i) : [updatedInv, ...prev];
          });
          window.API.invoices.save(updatedInv).catch(() => {});
          Swal.fire('¡PDF Guardado!', `Archivo ${data.originalName} almacenado y registrado.`, 'success');
        } else {
          Swal.fire('Error', data.error || 'No se pudo subir el archivo.', 'error');
        }
      } catch (err) {
        Swal.fire('Guardado', `Archivo vinculado.`, 'info');
      }
    };
    fileInput.click();
  };

  // PERSISTENCIA EN MYSQL & ACTUALIZACIÓN DIRECTA EN TABLA CON TIEMPO REAL
  const saveInvoiceDebounceRef = React.useRef({});

  const saveInvoiceToDb = (invoice) => {
    window.API.invoices.save(invoice).catch(err => {
      console.error('Error guardando factura en MySQL:', err);
    });
  };

  const handleUpdateInvoiceField = (id, field, value) => {
    const invObj = activeInvoices.find(i => i.id === id) || { id };
    const updated = { ...invObj, [field]: value };
    
    // 1. Actualización inmediata y reactiva del estado en memoria
    setManualInvoices(prev => {
      const exists = prev.some(i => i.id === id);
      return exists ? prev.map(i => i.id === id ? updated : i) : [updated, ...prev];
    });

    // 2. Guardado en base de datos MySQL con debounce para campos de texto/número y directo para conmutadores
    if (field === 'invoiceNumber' || field === 'oc' || field === 'value') {
      if (saveInvoiceDebounceRef.current[id]) {
        clearTimeout(saveInvoiceDebounceRef.current[id]);
      }
      saveInvoiceDebounceRef.current[id] = setTimeout(() => {
        saveInvoiceToDb(updated);
      }, 400);
    } else {
      saveInvoiceToDb(updated);
    }
  };

  const handleToggleSigned = (id) => {
    const inv = activeInvoices.find(i => i.id === id) || { id };
    const newSigned = inv.signed === 'SÍ' ? 'NO' : 'SÍ';
    handleUpdateInvoiceField(id, 'signed', newSigned);
  };

  const handleToggleOrderStd = (id) => {
    const inv = activeInvoices.find(i => i.id === id) || { id };
    const newOrder = inv.orderStd === 'SÍ' ? 'NO' : 'SÍ';
    handleUpdateInvoiceField(id, 'orderStd', newOrder);
  };

  const handleToggleFacture = (id) => {
    const inv = activeInvoices.find(i => i.id === id) || { id };
    const willBeFactureYes = inv.enFacture !== 'SÍ';
    const isCot = (inv.invoiceNumber || '').toUpperCase().startsWith('COT') || inv.docType === 'cotizacion';

    let updated = { ...inv };

    if (willBeFactureYes) {
      // Al marcar En Facture: SÍ
      if (isCot) {
        // Se convierte en Factura (cambia prefijo COT a FAC o docType a factura)
        let newCode = inv.invoiceNumber || '';
        if (newCode.toUpperCase().startsWith('COT')) {
          newCode = 'FAC' + newCode.substring(3);
        } else if (!newCode || newCode === 'COT-') {
          newCode = 'FAC-';
        }
        
        updated = {
          ...updated,
          enFacture: 'SÍ',
          docType: 'factura',
          invoiceNumber: newCode,
          signed: 'NO', // El usuario la firmará cuando su jefe autorice
          delivered: 'NO' // Entrega es acción manual
        };
      } else {
        // Si ya es Factura normal
        updated = {
          ...updated,
          enFacture: 'SÍ'
        };
      }
    } else {
      // Al desmarcar En Facture (volver a NO)
      updated = {
        ...updated,
        enFacture: 'NO'
      };
    }

    setManualInvoices(prev => {
      const exists = prev.some(i => i.id === id);
      return exists ? prev.map(i => i.id === id ? updated : i) : [updated, ...prev];
    });
    saveInvoiceToDb(updated);
  };

  const handleToggleDelivered = (id) => {
    const inv = activeInvoices.find(i => i.id === id) || { id };
    const isNowDelivered = inv.delivered !== 'SÍ';
    const todayStr = new Date().toISOString().split('T')[0];
    
    const updated = {
      ...inv,
      delivered: isNowDelivered ? 'SÍ' : 'NO',
      // Si se marca como entregada y no tenía fecha de entrega, colocar la fecha actual
      deliveryDate: (isNowDelivered && !inv.deliveryDate) ? todayStr : inv.deliveryDate
    };

    setManualInvoices(prev => {
      const exists = prev.some(i => i.id === id);
      return exists ? prev.map(i => i.id === id ? updated : i) : [updated, ...prev];
    });
    saveInvoiceToDb(updated);
  };

  const handleCleanAllFilters = () => {
    setSearchTerm('');
    setSelectedSupplier('Todos');
    setSelectedFactureFilter('Todos');
    setSelectedSignedFilter('Todos');
    setSelectedOrderStdFilter('Todos');
    setSelectedOcFilter('Todos');
    setSelectedDeliveredFilter('Todos');
    setSelectedMonth('Todos');
    setSelectedYear('Todos');
    setSelectedInvoiceIds([]);
  };

  const handleDeleteInvoice = (id) => {
    Swal.fire({
      title: '¿Eliminar Factura de la Base de Datos?',
      text: 'Se eliminará permanentemente de MySQL.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Sí, eliminar'
    }).then(async (res) => {
      if (res.isConfirmed) {
        setManualInvoices(manualInvoices.filter(i => i.id !== id));
        await window.API.invoices.delete(id).catch(() => {});
        Swal.fire('Eliminado', 'Comprobante removido de la base de datos.', 'success');
      }
    });
  };

  const handleViewDetail = (row) => {
    Swal.fire({
      title: `Detalle Factura ${row.invoiceNumber}`,
      html: `
        <div style="text-align:left; font-size:13px; line-height:1.6;">
          <p><strong>Proveedor:</strong> ${row.supplier}</p>
          <p><strong>Servicio:</strong> ${row.service}</p>
          <p><strong>Fecha Emisión:</strong> ${row.emissionDate}</p>
          <p><strong>Fecha Entrega:</strong> ${row.deliveryDate}</p>
          <p><strong>Valor:</strong> $${Number(row.value || 0).toLocaleString('es-CO')}</p>
          <p><strong>Orden STD:</strong> ${row.orderStd}</p>
          <p><strong>OC:</strong> ${row.oc}</p>
          <p><strong>En Facture:</strong> ${row.enFacture}</p>
          <p><strong>Entregada:</strong> ${row.delivered}</p>
          <p><strong>Archivo PDF Local:</strong> ${row.pdfPath ? `<a href="${row.pdfPath}" target="_blank" style="color:#e11d48; font-weight:700;">Ver PDF Adjunto</a>` : 'Sin archivo adjunto'}</p>
        </div>
      `,
      confirmButtonColor: '#e11d48'
    });
  };

  // REGISTRO DE FACTURA CON FECHA PERSONALIZADA
  const handleQuickRegister = () => {
    Swal.fire({
      title: 'Registrar Factura / Cotización',
      html: `
        <input id="swSupplier" class="swal2-input" placeholder="Nombre Proveedor">
        <input id="swService" class="swal2-input" placeholder="Servicio prestado">
        <input id="swInvoiceNumber" class="swal2-input" placeholder="N DE FACTURA (ej: FAC2240)">
        <input id="swEmission" type="date" class="swal2-input">
        <input id="swDelivery" type="date" class="swal2-input">
        <input id="swAmount" type="number" class="swal2-input" placeholder="VALOR ($)">
        <select id="swOrderStd" class="swal2-input">
          <option value="SÍ">ORDEN STD: SÍ</option>
          <option value="NO">ORDEN STD: NO</option>
        </select>
        <input id="swOc" class="swal2-input" placeholder="OC (ej: OC-2026-102)">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar en Base de Datos',
      confirmButtonColor: '#e11d48'
    }).then((res) => {
      if (res.isConfirmed) {
        const supplier = document.getElementById('swSupplier').value || 'Distribuidora Lácteos Enriko';
        const service = document.getElementById('swService').value || 'Suministro de insumos';
        const invoiceNumber = document.getElementById('swInvoiceNumber').value || 'FAC2240';
        const emissionDate = document.getElementById('swEmission').value || '2026-08-29';
        const deliveryDate = document.getElementById('swDelivery').value || '2026-08-31';
        const value = Number(document.getElementById('swAmount').value) || 3500000;
        const orderStd = document.getElementById('swOrderStd').value || 'SÍ';
        const oc = document.getElementById('swOc').value || 'OC-2026-102';

        const newInv = {
          id: 'man-' + Date.now(),
          logoText: supplier.substring(0, 2).toUpperCase(),
          supplier,
          service,
          invoiceNumber,
          emissionDate,
          deliveryDate,
          value,
          signed: 'SÍ',
          orderStd,
          oc,
          enFacture: 'SÍ',
          delivered: 'NO',
          pdfPath: null,
          pdfOriginalName: null
        };

        setManualInvoices([newInv, ...manualInvoices]);
        saveInvoiceToDb(newInv);
        Swal.fire('Guardado', 'Factura almacenada en la base de datos MySQL.', 'success');
      }
    });
  };

  // PROVEEDORES
  const saveSupplierToDb = (sup) => {
    window.API.suppliers.save(sup).catch(() => {});
  };

  const handleAddSupplier = () => {
    Swal.fire({
      title: '🏢 Registrar Nuevo Proveedor',
      width: '540px',
      customClass: { popup: 'modal-card-box' },
      html: `
        <div style="text-align:left; font-size:12px; display:flex; flex-direction:column; gap:10px; margin-top:8px;">
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">NIT o RUT *</label>
            <input id="swNit" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700; border-radius:8px;" placeholder="ej: 900.123.456-1">
          </div>
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Razón Social del Proveedor *</label>
            <input id="swName" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700; border-radius:8px;" placeholder="ej: Cárnicos del Norte S.A.S.">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Asesor Comercial</label>
              <input id="swContact" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; border-radius:8px;" placeholder="ej: Laura Restrepo">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Teléfono Contacto</label>
              <input id="swPhone" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; border-radius:8px;" placeholder="ej: +57 300 123 4567">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">N° Servicios Recurrentes / Mes</label>
              <input id="swMonthly" type="number" min="0" max="20" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800; border-radius:8px; color:#2563eb;" value="0" placeholder="0">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Área Asignada</label>
              <select id="swArea" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700; border-radius:8px;">
                <option value="Adquisiciones & Compras">Adquisiciones & Compras</option>
                <option value="Contabilidad & Finanzas">Contabilidad & Finanzas</option>
                <option value="Tecnología (TI)">Tecnología (TI)</option>
                <option value="Mantenimiento & Planta">Mantenimiento & Planta</option>
                <option value="Operaciones & Logística">Operaciones & Logística</option>
              </select>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Proveedor',
      confirmButtonColor: '#e11d48'
    }).then((res) => {
      if (res.isConfirmed) {
        const nit = (document.getElementById('swNit').value || '').trim();
        const name = (document.getElementById('swName').value || '').trim();
        const contact = document.getElementById('swContact').value || '';
        const phone = document.getElementById('swPhone').value || '';
        const monthlyCount = Math.max(0, Number(document.getElementById('swMonthly').value) || 0);
        const area = document.getElementById('swArea').value;

        if (!nit || !name) {
          return Swal.fire('Campos requeridos', 'Debes ingresar el NIT y la Razón Social.', 'warning');
        }

        const existsNit = suppliers.some(s => s.nit && s.nit.toLowerCase().replace(/[^a-z0-9]/g, '') === nit.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const existsName = suppliers.some(s => s.name && s.name.trim().toLowerCase() === name.toLowerCase());

        if (existsNit) {
          return Swal.fire('NIT Ya Registrado', `Ya existe un proveedor registrado con el NIT/RUT "${nit}".`, 'error');
        }
        if (existsName) {
          return Swal.fire('Nombre Ya Registrado', `Ya existe un proveedor con la Razón Social "${name}".`, 'error');
        }

        const newServices = [];
        for (let i = 1; i <= monthlyCount; i++) {
          newServices.push({ id: `srv-${Date.now()}-${i}`, serviceName: `Servicio #${i} - ${name}`, enabled: true });
        }

        const newSup = { id: 'sup-' + Date.now(), nit, name, contact, phone, monthlyCount, area, services: newServices };
        setSuppliers([newSup, ...suppliers]);
        saveSupplierToDb(newSup);
        Swal.fire('Registrado', `Proveedor "${name}" guardado exitosamente en MySQL.`, 'success');
      }
    });
  };

  const handleEditSupplier = (sup) => {
    Swal.fire({
      title: `✏️ Editar Proveedor: ${sup.name || ''}`,
      width: '540px',
      customClass: { popup: 'modal-card-box' },
      html: `
        <div style="text-align:left; font-size:12px; display:flex; flex-direction:column; gap:10px; margin-top:8px;">
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">NIT / Identificación</label>
            <input id="swEditNit" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700; border-radius:8px;" value="${sup.nit || ''}">
          </div>
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Razón Social</label>
            <input id="swEditName" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700; border-radius:8px;" value="${sup.name || ''}">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Contacto Asesor</label>
              <input id="swEditContact" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; border-radius:8px;" value="${sup.contact || ''}">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Teléfono</label>
              <input id="swEditPhone" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; border-radius:8px;" value="${sup.phone || ''}">
            </div>
          </div>
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">N° Facturas Esperadas / Mes</label>
            <input id="swEditCount" type="number" min="1" max="20" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800; color:#e11d48; border-radius:8px;" value="${sup.monthlyCount || sup.services?.length || 1}">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar en Base de Datos',
      confirmButtonColor: '#e11d48'
    }).then((res) => {
      if (res.isConfirmed) {
        const nit = (document.getElementById('swEditNit').value || '').trim();
        const name = (document.getElementById('swEditName').value || '').trim();
        const contact = document.getElementById('swEditContact').value;
        const phone = document.getElementById('swEditPhone').value;
        const count = Math.max(1, Number(document.getElementById('swEditCount').value) || 1);

        if (!nit || !name) {
          return Swal.fire('Campos requeridos', 'Debes ingresar el NIT y la Razón Social.', 'warning');
        }

        const existsNit = suppliers.some(s => s.id !== sup.id && s.nit && s.nit.toLowerCase().replace(/[^a-z0-9]/g, '') === nit.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const existsName = suppliers.some(s => s.id !== sup.id && s.name && s.name.trim().toLowerCase() === name.toLowerCase());

        if (existsNit) {
          return Swal.fire('NIT Ya Registrado', `Otro proveedor ya tiene registrado el NIT/RUT "${nit}".`, 'error');
        }
        if (existsName) {
          return Swal.fire('Nombre Ya Registrado', `Otro proveedor ya tiene la Razón Social "${name}".`, 'error');
        }

        let currentServices = [...(sup.services || [])];
        if (currentServices.length < count) {
          for (let i = currentServices.length + 1; i <= count; i++) {
            currentServices.push({ id: `srv-${sup.id}-${i}`, serviceName: `Servicio #${i} - ${name}`, enabled: true });
          }
        } else if (currentServices.length > count) {
          currentServices = currentServices.slice(0, count);
        }

        const updatedSup = { ...sup, nit, name, contact, phone, monthlyCount: count, services: currentServices };
        setSuppliers(suppliers.map(s => s.id === sup.id ? updatedSup : s));
        saveSupplierToDb(updatedSup);
        Swal.fire('Actualizado', 'Datos actualizados en MySQL.', 'success');
      }
    });
  };

  const handleDeleteSupplier = (id) => {
    Swal.fire({
      title: '¿Eliminar Proveedor de la Base de Datos?',
      text: 'Se eliminará permanentemente de MySQL.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48'
    }).then(async (res) => {
      if (res.isConfirmed) {
        setSuppliers(suppliers.filter(s => s.id !== id));
        await window.API.suppliers.delete(id).catch(() => {});
        Swal.fire('Eliminado', 'Proveedor removido.', 'success');
      }
    });
  };

  const handleUpdateSupplierServices = (supId, newServices) => {
    const updated = suppliers.map(s => {
      if (s.id === supId) {
        const item = { ...s, services: newServices, monthlyCount: newServices.length };
        saveSupplierToDb(item);
        return item;
      }
      return s;
    });
    setSuppliers(updated);
  };

  // USUARIOS
  const handleAddUser = () => {
    Swal.fire({
      title: '👤 Crear Nuevo Usuario',
      width: '500px',
      html: `
        <div style="text-align:left; font-size:12px; display:flex; flex-direction:column; gap:10px; margin-top:8px;">
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Usuario (Login) *</label>
            <input id="swUUser" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;" placeholder="ej: asesor_compras">
          </div>
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Nombre Completo *</label>
            <input id="swUName" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;" placeholder="ej: Andrea Valbuena">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Contraseña *</label>
              <input id="swUPass" type="password" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;" placeholder="••••••••">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Rol de Sistema *</label>
              <select id="swURole" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
                <option value="admin">🛡️ Admin (Gestión)</option>
                <option value="superadmin">👑 Superadmin (Control Total)</option>
              </select>
            </div>
          </div>
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Área Asignada</label>
            <select id="swUArea" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;">
              <option value="Adquisiciones & Compras">Adquisiciones & Compras</option>
              <option value="Contabilidad & Finanzas">Contabilidad & Finanzas</option>
              <option value="Tecnología (TI)">Tecnología (TI)</option>
              <option value="Operaciones & Planta">Operaciones & Planta</option>
              <option value="Dirección General">Dirección General</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Usuario',
      confirmButtonColor: '#e11d48'
    }).then(async (res) => {
      if (res.isConfirmed) {
        const username = (document.getElementById('swUUser').value || '').trim();
        const name = (document.getElementById('swUName').value || '').trim();
        const password = (document.getElementById('swUPass').value || '').trim();
        const role = document.getElementById('swURole').value;
        const area = document.getElementById('swUArea').value;

        if (!username || !name || !password) {
          return Swal.fire('Campos Obligatorios', 'Por favor ingresa usuario, nombre y contraseña.', 'warning');
        }

        const newU = { id: 'usr-' + Date.now(), username, name, password, role, area, status: 'Activo' };
        setUsers([...users, newU]);
        await window.API.users.save(newU).catch(() => {});
        Swal.fire('Usuario Creado', `La cuenta de ${name} ha sido registrada con rol ${role.toUpperCase()}.`, 'success');
      }
    });
  };

  const handleDeleteUser = (id) => {
    Swal.fire({
      title: '¿Eliminar Usuario?',
      text: 'Este usuario ya no podrá iniciar sesión en el sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Sí, Eliminar'
    }).then(async (res) => {
      if (res.isConfirmed) {
        setUsers(users.filter(u => u.id !== id));
        await window.API.users.delete(id).catch(() => {});
        Swal.fire('Eliminado', 'Usuario removido correctamente.', 'success');
      }
    });
  };

  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`app-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* TELÓN DE FONDO PARA DISPOSITIVOS MÓVILES */}
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        alertCount={realAlerts.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <main className="main-content">
        <TopNavbar 
          selectedMonth={selectedMonth} 
          setSelectedMonth={setSelectedMonth} 
          selectedYear={selectedYear} 
          setSelectedYear={setSelectedYear} 
          alertCount={realAlerts.length}
          onOpenAlerts={() => setCurrentView('alerts')}
          onOpenUsers={() => setCurrentView('users')}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(!isSidebarOpen);
            } else {
              toggleSidebarCollapse();
            }
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* VISTA 1: DASHBOARD LIMPIO (SIN TABLAS PESADAS) */}
        {currentView === 'dashboard' && (
          <div className="dashboard-container">
            <KpiCards 
              total={activeInvoices.length}
              facCount={tabCounts.fac}
              cotCount={tabCounts.cot}
              toSignCount={activeInvoices.filter(i => i.signed === 'NO').length}
              pendingFactureCount={activeInvoices.filter(i => i.enFacture === 'AÚN NO').length}
              pendingManagementCount={activeInvoices.filter(i => i.delivered !== 'SÍ').length}
              delayedCount={tabCounts.delayed}
            />

            <ChartsSection 
              managedCount={activeInvoices.filter(i => i.delivered === 'SÍ').length}
              pendingCount={activeInvoices.filter(i => i.delivered !== 'SÍ').length}
              enFactureCount={activeInvoices.filter(i => i.enFacture === 'SÍ').length}
              otherCount={activeInvoices.filter(i => i.signed === 'NO').length}
              totalCount={activeInvoices.length}
              onQuickRegister={handleQuickRegister}
              onGoInvoices={() => setCurrentView('invoices')}
              onGoReports={() => setCurrentView('reports')}
              onGoSuppliers={() => setCurrentView('suppliers')}
            />

            {/* TARJETAS DE ACCESO RÁPIDO EJECUTIVO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-8">
              <div 
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-slate-200/90 dark:border-zinc-800 cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                onClick={() => setCurrentView('inventory')}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/30 text-rose-600 flex items-center justify-center text-xl flex-shrink-0 border border-rose-200 dark:border-rose-900/50 group-hover:scale-105 transition-transform shadow-sm">
                  <Icon name="inventory" size={26} className="text-rose-600" />
                </div>
                <div>
                  <div className="font-black text-base text-slate-900 dark:text-white">Inventario TI</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">{techInventory.length} referencias físicas y licencias</div>
                </div>
              </div>

              <div 
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-slate-200/90 dark:border-zinc-800 cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                onClick={() => setCurrentView('budgets')}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0 border border-emerald-200 dark:border-emerald-900/50 group-hover:scale-105 transition-transform shadow-sm">
                  <Icon name="budgets" size={26} className="text-emerald-600" />
                </div>
                <div>
                  <div className="font-black text-base text-slate-900 dark:text-white">Presupuestos TI 2026</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">{techBudgets.length} rubros planificados y AI</div>
                </div>
              </div>

              <div 
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-slate-200/90 dark:border-zinc-800 cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                onClick={() => setCurrentView('areas')}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 text-purple-600 flex items-center justify-center text-xl flex-shrink-0 border border-purple-200 dark:border-purple-900/50 group-hover:scale-105 transition-transform shadow-sm">
                  <Icon name="areas" size={26} className="text-purple-600" />
                </div>
                <div>
                  <div className="font-black text-base text-slate-900 dark:text-white">Áreas & Directores</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">{areas.length} áreas organizacionales</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: FACTURAS CON FILTROS DE MESES Y AÑOS FUTUROS */}
        {currentView === 'invoices' && (
          <InvoicesModule 
            invoices={filteredRows}
            onQuickRegister={handleQuickRegister}
            onToggleSigned={handleToggleSigned}
            onToggleOrderStd={handleToggleOrderStd}
            onToggleFacture={handleToggleFacture}
            onToggleDelivered={handleToggleDelivered}
            onUpdateInvoiceField={handleUpdateInvoiceField}
            onDeleteInvoice={handleDeleteInvoice}
            onUploadPdf={handleUploadPdf}
            onViewDetail={handleViewDetail}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedSupplier={selectedSupplier}
            setSelectedSupplier={setSelectedSupplier}
            selectedFactureFilter={selectedFactureFilter}
            setSelectedFactureFilter={setSelectedFactureFilter}
            selectedSignedFilter={selectedSignedFilter}
            setSelectedSignedFilter={setSelectedSignedFilter}
            selectedOrderStdFilter={selectedOrderStdFilter}
            setSelectedOrderStdFilter={setSelectedOrderStdFilter}
            selectedOcFilter={selectedOcFilter}
            setSelectedOcFilter={setSelectedOcFilter}
            selectedDeliveredFilter={selectedDeliveredFilter}
            setSelectedDeliveredFilter={setSelectedDeliveredFilter}
            suppliersList={suppliersList}
            onOpenExcelPreview={() => setIsExcelPreviewOpen(true)}
            selectedCount={selectedInvoiceIds.length}
            onCleanFilters={handleCleanAllFilters}
          />
        )}

        {/* VISTA 3: PROVEEDORES CON SUBFILAS DESPLEGABLES */}
        {currentView === 'suppliers' && (
          <SuppliersModule 
            suppliers={suppliers}
            invoices={manualInvoices}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onUpdateSupplierServices={handleUpdateSupplierServices}
          />
        )}

        {/* VISTA CRM: CRM DE COTIZACIONES Y PROVEEDORES EN PROCESO */}
        {currentView === 'crm' && (
          <CrmModule 
            suppliers={suppliers}
            quotations={quotations}
            onSaveQuotation={handleSaveQuotation}
            onDeleteQuotation={handleDeleteQuotation}
          />
        )}

        {/* VISTA INVENTARIO TI */}
        {currentView === 'inventory' && (
          <TechInventoryModule 
            inventory={techInventory}
            areas={areas}
            onAddOrUpdateItem={handleAddOrUpdateInventoryItem}
            onDeliverItem={handleDeliverInventoryItem}
            onDeleteItem={handleDeleteInventoryItem}
          />
        )}

        {/* VISTA PRESUPUESTOS TI */}
        {currentView === 'budgets' && (
          <TechBudgetModule 
            budgets={techBudgets}
            areas={areas}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {/* VISTA ÁREAS ORGANIZACIONALES */}
        {currentView === 'areas' && (
          <AreasModule 
            areas={areas}
            onSaveArea={handleSaveArea}
            onDeleteArea={handleDeleteArea}
          />
        )}

        {/* VISTA 4: USUARIOS */}
        {currentView === 'users' && (
          <UsersModule 
            users={users}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            currentUser={currentUser}
          />
        )}

        {/* VISTA 5: ALERTAS REALES */}
        {currentView === 'alerts' && (
          <AlertsModule 
            alerts={realAlerts}
            onGoDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {/* VISTAS RESTANTES */}
        {['reports', 'settings', 'folders', 'history'].includes(currentView) && (
          <div className="dashboard-container">
            <div style={{background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center'}}>
              <div style={{fontSize: '32px', color: '#e11d48', marginBottom: '8px'}}><i className="fa-solid fa-folder-open"></i></div>
              <h2 style={{fontSize: '16px', fontWeight: 800, textTransform: 'capitalize'}}>Módulo {currentView} Activo</h2>
              <p style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>Sincronizado con la suite Alimentos Enriko.</p>
              <button className="btn-red-action" style={{marginTop: '16px'}} onClick={() => setCurrentView('dashboard')}>Volver al Dashboard</button>
            </div>
          </div>
        )}

        {/* MODAL DE VISTA PREVIA EXCEL PARA FACTURAS SELECCIONADAS / ENTREGADAS */}
        <ExcelPreviewModal 
          isOpen={isExcelPreviewOpen}
          onClose={() => setIsExcelPreviewOpen(false)}
          selectedInvoices={invoicesForExcelPreview}
          onToggleDelivered={handleToggleDelivered}
          onUploadPdf={handleUploadPdf}
        />

      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
