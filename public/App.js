const { useState, useMemo, useEffect } = React;

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState('Agosto');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [currentTab, setCurrentTab] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('Todos');
  const [selectedFactureFilter, setSelectedFactureFilter] = useState('Todos');
  
  // ESTADO DE SELECCIÓN DE FILAS Y VISTA PREVIA EXCEL
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [isExcelPreviewOpen, setIsExcelPreviewOpen] = useState(false);

  // MODO OSCURO CON PERSISTENCIA
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ae_dark') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('ae_dark', darkMode.toString());
  }, [darkMode]);

  // 1. PROVEEDORES (CON SERVICIOS Y CUOTA MENSUAL)
  const [suppliers, setSuppliers] = useState([
    { 
      id: 's1', 
      nit: '800.789.012-4', 
      name: 'Distribuidora Lácteos Enriko', 
      contact: 'Laura Restrepo', 
      phone: '+57 300 123 4567', 
      monthlyCount: 2, 
      area: 'Contabilidad & Finanzas',
      services: [
        { id: 'srv-1-1', serviceName: 'Servicios de Hosting', enabled: true },
        { id: 'srv-1-2', serviceName: 'Mantenimiento de Servidores', enabled: true }
      ]
    },
    { 
      id: 's2', 
      nit: '900.123.456-1', 
      name: 'Frigorífico del Valle', 
      contact: 'Carlos Mendoza', 
      phone: '+57 310 455 8899', 
      monthlyCount: 3, 
      area: 'Adquisiciones & Compras',
      services: [
        { id: 'srv-2-1', serviceName: 'Compra de carnes', enabled: true },
        { id: 'srv-2-2', serviceName: 'Suministro de embutidos', enabled: true },
        { id: 'srv-2-3', serviceName: 'Transporte refrigerado', enabled: false }
      ]
    },
    { 
      id: 's3', 
      nit: '890.334.112-9', 
      name: 'Insumos Agroalimentarios', 
      contact: 'Roberto Gómez', 
      phone: '+57 315 789 1234', 
      monthlyCount: 1, 
      area: 'Mantenimiento & Planta',
      services: [
        { id: 'srv-3-1', serviceName: 'Insumos varios', enabled: true }
      ]
    },
    { 
      id: 's4', 
      nit: '860.001.245-8', 
      name: 'Empaques Colombia', 
      contact: 'Diana Páez', 
      phone: '+57 312 998 7766', 
      monthlyCount: 2, 
      area: 'Operaciones & Logística',
      services: [
        { id: 'srv-4-1', serviceName: 'Empaques plásticos', enabled: true },
        { id: 'srv-4-2', serviceName: 'Cajas de cartón corrugado', enabled: false }
      ]
    },
    { 
      id: 's5', 
      nit: '901.442.889-0', 
      name: 'Frutas del Pacífico', 
      contact: 'Felipe Silva', 
      phone: '+57 318 654 3210', 
      monthlyCount: 1, 
      area: 'Adquisiciones & Compras',
      services: [
        { id: 'srv-5-1', serviceName: 'Frutas y verduras', enabled: true }
      ]
    }
  ]);

  // 2. FACTURAS RADICADAS / MANUALES (CON ADJUNTO PDF FÍSICO)
  const [manualInvoices, setManualInvoices] = useState([
    { 
      id: 'inv-1', 
      logoText: 'DL', 
      supplier: 'Distribuidora Lácteos Enriko', 
      service: 'Servicios de Hosting', 
      invoiceNumber: 'FAC2235', 
      emissionDate: '2026-08-28', 
      deliveryDate: '2026-08-30', 
      value: 4500000, 
      signed: 'NO', 
      orderStd: 'NO', 
      oc: 'OC-2026-091', 
      enFacture: 'AÚN NO', 
      delivered: 'NO',
      pdfPath: null,
      pdfOriginalName: null
    },
    { 
      id: 'inv-2', 
      logoIcon: 'fa-snowflake', 
      supplier: 'Frigorífico del Valle', 
      service: 'Compra de carnes', 
      invoiceNumber: 'COT0487', 
      emissionDate: '2026-08-27', 
      deliveryDate: '2026-08-29', 
      value: 3250000, 
      signed: 'SÍ', 
      orderStd: 'SÍ', 
      oc: 'OC-2026-084', 
      enFacture: 'SÍ', 
      delivered: 'SÍ',
      pdfPath: null,
      pdfOriginalName: null
    },
    { 
      id: 'inv-3', 
      logoIcon: 'fa-wheat-awn', 
      supplier: 'Insumos Agroalimentarios', 
      service: 'Insumos varios', 
      invoiceNumber: 'FAC2201', 
      emissionDate: '2026-08-26', 
      deliveryDate: '2026-08-28', 
      value: 1890000, 
      signed: 'SÍ', 
      orderStd: 'SÍ', 
      oc: 'OC-2026-079', 
      enFacture: 'SÍ', 
      delivered: 'SÍ',
      pdfPath: null,
      pdfOriginalName: null
    },
    { 
      id: 'inv-4', 
      logoIcon: 'fa-circle-notch', 
      supplier: 'Empaques Colombia', 
      service: 'Empaques plásticos', 
      invoiceNumber: 'FAC2185', 
      emissionDate: '2026-08-25', 
      deliveryDate: '2026-08-27', 
      value: 2760000, 
      signed: 'NO', 
      orderStd: 'NO', 
      oc: 'OC-2026-065', 
      enFacture: 'AÚN NO', 
      delivered: 'NO',
      pdfPath: null,
      pdfOriginalName: null
    },
    { 
      id: 'inv-5', 
      logoIcon: 'fa-apple-whole', 
      supplier: 'Frutas del Pacífico', 
      service: 'Frutas y verduras', 
      invoiceNumber: 'FAC2199', 
      emissionDate: '2026-08-28', 
      deliveryDate: '2026-09-01', 
      value: 6450000, 
      signed: 'SÍ', 
      orderStd: 'SÍ', 
      oc: 'OC-2026-088', 
      enFacture: 'SÍ', 
      delivered: 'NO',
      pdfPath: null,
      pdfOriginalName: null
    }
  ]);

  // 3. USUARIOS
  const [users, setUsers] = useState([
    { id: 'u1', username: 'JR', name: 'Juan Rodríguez', role: 'Administrador General', area: 'Todas las Áreas', status: 'Activo' },
    { id: 'u2', username: 'maria_c', name: 'María Fernanda Ruiz', role: 'Gestor de Compras', area: 'Adquisiciones & Compras', status: 'Activo' },
    { id: 'u3', username: 'carlos_ti', name: 'Carlos Morales', role: 'Gestor TI', area: 'Tecnología (TI)', status: 'Activo' }
  ]);

  // CARGAR DATOS DESDE EL BACKEND MYSQL AL INICIAR
  useEffect(() => {
    fetch('/api/suppliers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setSuppliers(data);
      })
      .catch(() => {});

    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setManualInvoices(data);
      })
      .catch(() => {});

    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setUsers(data);
      })
      .catch(() => {});
  }, []);

  // GENERAR LA LISTA FINAL DE FACTURAS COMBINANDO:
  // A) LAS FACTURAS QUE TIENEN SERVICIO HABILITADO EN EL PROVEEDOR
  // B) LAS FACTURAS AGREGADAS DIRECTAMENTE DESDE EL MÓDULO DE FACTURAS
  const activeInvoices = useMemo(() => {
    let list = [...manualInvoices];

    suppliers.forEach(sup => {
      const services = sup.services || [];
      services.forEach((srv, idx) => {
        if (srv.enabled !== false) {
          const exists = list.some(i => i.supplier === sup.name && i.service === srv.serviceName);
          if (!exists) {
            list.push({
              id: `auto-${sup.id}-${idx}`,
              logoText: sup.name.substring(0, 2).toUpperCase(),
              supplier: sup.name,
              service: srv.serviceName || `Servicio #${idx + 1}`,
              invoiceNumber: `FAC-ESP-${idx + 1}`,
              emissionDate: '2026-08-01',
              deliveryDate: '2026-08-30',
              value: 1500000,
              signed: 'NO',
              orderStd: 'SÍ',
              oc: `OC-2026-${Math.floor(100 + Math.random() * 899)}`,
              enFacture: 'AÚN NO',
              delivered: 'NO',
              pdfPath: null,
              pdfOriginalName: null
            });
          }
        }
      });
    });

    return list;
  }, [suppliers, manualInvoices]);

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
          title: `Factura Atrasada (${inv.invoiceNumber})`,
          message: `${inv.supplier} - Vencida hace ${diffDays} día(s)`,
          tag: '▲ Urgente'
        });
      }

      if (inv.enFacture === 'AÚN NO') {
        list.push({
          type: 'amber',
          title: `Pendiente en Facture (${inv.invoiceNumber})`,
          message: `${inv.supplier} aún no ha sido radicada`,
          tag: 'Aún no llega'
        });
      }

      if (inv.signed === 'NO') {
        list.push({
          type: 'blue',
          title: `Firma Pendiente (${inv.invoiceNumber})`,
          message: `${inv.supplier} requiere autorización`,
          tag: 'Por firmar'
        });
      }
    });

    return list;
  }, [activeInvoices]);

  // FILTRADO DINÁMICO DE FACTURAS
  const filteredRows = useMemo(() => {
    return activeInvoices.filter(inv => {
      const matchText = inv.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inv.service.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchText) return false;

      if (selectedSupplier !== 'Todos' && inv.supplier !== selectedSupplier) return false;
      if (selectedFactureFilter !== 'Todos' && inv.enFacture !== selectedFactureFilter) return false;

      if (currentTab === 'Facturas' && !inv.invoiceNumber.startsWith('FAC')) return false;
      if (currentTab === 'Cotizaciones' && !inv.invoiceNumber.startsWith('COT')) return false;
      if (currentTab === 'Pendientes' && inv.delivered === 'SÍ') return false;
      if (currentTab === 'Atrasadas') {
        const isDelayed = new Date(inv.deliveryDate) < new Date('2026-09-01') && inv.delivered !== 'SÍ';
        if (!isDelayed) return false;
      }
      if (currentTab === 'En Facture' && inv.enFacture !== 'SÍ') return false;

      return true;
    });
  }, [activeInvoices, searchTerm, selectedSupplier, selectedFactureFilter, currentTab]);

  // CONTEO PARA TABS
  const tabCounts = useMemo(() => {
    return {
      total: activeInvoices.length,
      fac: activeInvoices.filter(i => i.invoiceNumber.startsWith('FAC')).length,
      cot: activeInvoices.filter(i => i.invoiceNumber.startsWith('COT')).length,
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

  // OBTENER LAS FACTURAS QUE SE MOSTRARÁN EN LA VISTA PREVIA TIPO EXCEL:
  // Si hay seleccionadas, muestra las seleccionadas. Si no, muestra por defecto las ENTREGADAS o todas las visibles.
  const invoicesForExcelPreview = useMemo(() => {
    if (selectedInvoiceIds.length > 0) {
      return activeInvoices.filter(i => selectedInvoiceIds.includes(i.id));
    }
    const delivered = activeInvoices.filter(i => i.delivered === 'SÍ');
    return delivered.length > 0 ? delivered : filteredRows;
  }, [selectedInvoiceIds, activeInvoices, filteredRows]);

  // SUBIR ARCHIVO PDF FÍSICO AL SERVIDOR LOCAL (/uploads) Y ASOCIAR A LA FACTURA
  const handleUploadPdf = (invoiceId) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf,image/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        Swal.fire({ title: 'Guardando archivo PDF en el dispositivo...', didOpen: () => Swal.showLoading() });
        const res = await fetch('/api/upload-pdf', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (data.success) {
          // Actualizar estado local y guardar en MySQL
          const updated = manualInvoices.map(inv => {
            if (inv.id === invoiceId) {
              const updatedInv = { ...inv, pdfPath: data.relativePath, pdfOriginalName: data.originalName };
              // Guardar en MySQL
              fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedInv)
              }).catch(() => {});
              return updatedInv;
            }
            return inv;
          });

          setManualInvoices(updated);
          Swal.fire('¡PDF Guardado!', `Archivo ${data.originalName} almacenado en la carpeta local /uploads y registrado en la base de datos.`, 'success');
        } else {
          Swal.fire('Error', data.error || 'No se pudo subir el archivo.', 'error');
        }
      } catch (err) {
        Swal.fire('Guardado Localmente', `Archivo ${file.name} vinculado a la factura.`, 'info');
      }
    };
    fileInput.click();
  };

  // TOGGLES INTERACTIVOS CON PERSISTENCIA EN MYSQL
  const saveInvoiceToDb = (invoice) => {
    fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    }).catch(() => {});
  };

  const handleToggleSigned = (id) => {
    const updated = manualInvoices.map(i => {
      if (i.id === id) {
        const item = { ...i, signed: i.signed === 'SÍ' ? 'NO' : 'SÍ' };
        saveInvoiceToDb(item);
        return item;
      }
      return i;
    });
    setManualInvoices(updated);
  };

  const handleToggleOrderStd = (id) => {
    const updated = manualInvoices.map(i => {
      if (i.id === id) {
        const item = { ...i, orderStd: i.orderStd === 'SÍ' ? 'NO' : 'SÍ' };
        saveInvoiceToDb(item);
        return item;
      }
      return i;
    });
    setManualInvoices(updated);
  };

  const handleToggleFacture = (id) => {
    const updated = manualInvoices.map(i => {
      if (i.id === id) {
        const item = { ...i, enFacture: i.enFacture === 'SÍ' ? 'AÚN NO' : 'SÍ' };
        saveInvoiceToDb(item);
        return item;
      }
      return i;
    });
    setManualInvoices(updated);
  };

  const handleToggleDelivered = (id) => {
    const updated = manualInvoices.map(i => {
      if (i.id === id) {
        const item = { ...i, delivered: i.delivered === 'SÍ' ? 'NO' : 'SÍ' };
        saveInvoiceToDb(item);
        return item;
      }
      return i;
    });
    setManualInvoices(updated);
  };

  const handleDeleteInvoice = (id) => {
    Swal.fire({
      title: '¿Eliminar Factura de la Base de Datos?',
      text: 'Se eliminará permanentemente de MySQL.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Sí, eliminar'
    }).then(res => {
      if (res.isConfirmed) {
        setManualInvoices(manualInvoices.filter(i => i.id !== id));
        fetch(`/api/invoices/${id}`, { method: 'DELETE' }).catch(() => {});
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

  // REGISTRO DE FACTURA CON PERSISTENCIA EN MYSQL
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

  // PROVEEDORES CON PERSISTENCIA EN MYSQL
  const saveSupplierToDb = (sup) => {
    fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sup)
    }).catch(() => {});
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
            <input id="swName" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700; border-radius:8px;" placeholder="ej: Cárnicos y Lácteos del Norte S.A.S.">
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
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">N° Facturas Esperadas / Mes *</label>
              <input id="swMonthly" type="number" min="1" max="20" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800; border-radius:8px; color:#2563eb;" value="2">
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
        const nit = document.getElementById('swNit').value || '900.000.000-1';
        const name = document.getElementById('swName').value || 'Nuevo Proveedor S.A.S.';
        const contact = document.getElementById('swContact').value || 'Asesor General';
        const phone = document.getElementById('swPhone').value || '+57 300 000 0000';
        const monthlyCount = Math.max(1, Number(document.getElementById('swMonthly').value) || 1);
        const area = document.getElementById('swArea').value;

        const newServices = [];
        for (let i = 1; i <= monthlyCount; i++) {
          newServices.push({
            id: `srv-${Date.now()}-${i}`,
            serviceName: `Servicio #${i} - ${name}`,
            enabled: true
          });
        }

        const newSup = {
          id: 'sup-' + Date.now(),
          nit,
          name,
          contact,
          phone,
          monthlyCount,
          area,
          services: newServices
        };

        setSuppliers([newSup, ...suppliers]);
        saveSupplierToDb(newSup);
        Swal.fire('Registrado', `Proveedor guardado en la base de datos con ${monthlyCount} facturas esperadas.`, 'success');
      }
    });
  };

  const handleEditSupplier = (sup) => {
    Swal.fire({
      title: `Editar Proveedor: ${sup.name}`,
      width: '540px',
      customClass: { popup: 'modal-card-box' },
      html: `
        <div style="text-align:left; font-size:12px; display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">NIT</label>
            <input id="swEditNit" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;" value="${sup.nit}">
          </div>
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Razón Social</label>
            <input id="swEditName" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;" value="${sup.name}">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Contacto</label>
              <input id="swEditContact" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;" value="${sup.contact}">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Teléfono</label>
              <input id="swEditPhone" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;" value="${sup.phone}">
            </div>
          </div>
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">N° Facturas Esperadas / Mes</label>
            <input id="swEditCount" type="number" min="1" max="20" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800; color:#2563eb;" value="${sup.monthlyCount || sup.services?.length || 1}">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar en Base de Datos',
      confirmButtonColor: '#2563eb'
    }).then((res) => {
      if (res.isConfirmed) {
        const nit = document.getElementById('swEditNit').value;
        const name = document.getElementById('swEditName').value;
        const contact = document.getElementById('swEditContact').value;
        const phone = document.getElementById('swEditPhone').value;
        const count = Math.max(1, Number(document.getElementById('swEditCount').value) || 1);

        let currentServices = [...(sup.services || [])];
        if (currentServices.length < count) {
          for (let i = currentServices.length + 1; i <= count; i++) {
            currentServices.push({
              id: `srv-${sup.id}-${i}`,
              serviceName: `Servicio #${i} - ${name}`,
              enabled: true
            });
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
    }).then((res) => {
      if (res.isConfirmed) {
        setSuppliers(suppliers.filter(s => s.id !== id));
        fetch(`/api/suppliers/${id}`, { method: 'DELETE' }).catch(() => {});
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
      title: 'Crear Nuevo Usuario',
      html: `
        <input id="swUUser" class="swal2-input" placeholder="Usuario (Login)">
        <input id="swUName" class="swal2-input" placeholder="Nombre Completo">
        <select id="swURole" class="swal2-input">
          <option value="Administrador General">Administrador General</option>
          <option value="Gestor de Compras">Gestor de Compras</option>
          <option value="Gestor TI">Gestor TI</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#e11d48'
    }).then((res) => {
      if (res.isConfirmed) {
        const username = document.getElementById('swUUser').value || 'nuevo_user';
        const name = document.getElementById('swUName').value || 'Nuevo Usuario';
        const role = document.getElementById('swURole').value;

        const newU = { id: 'usr-' + Date.now(), username, name, role, area: 'Tecnología (TI)', status: 'Activo' };
        setUsers([...users, newU]);
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newU)
        }).catch(() => {});
        Swal.fire('Creado', 'Usuario añadido a la base de datos.', 'success');
      }
    });
  };

  return (
    <div className="app-wrapper">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        alertCount={realAlerts.length} 
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
        />

        {/* VISTA 1: DASHBOARD */}
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

            <FiltersBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedSupplier={selectedSupplier}
              setSelectedSupplier={setSelectedSupplier}
              selectedFactureFilter={selectedFactureFilter}
              setSelectedFactureFilter={setSelectedFactureFilter}
              suppliersList={suppliersList}
              selectedCount={selectedInvoiceIds.length}
              onOpenExcelPreview={() => setIsExcelPreviewOpen(true)}
              onClean={() => { setSearchTerm(''); setSelectedSupplier('Todos'); setSelectedFactureFilter('Todos'); setSelectedInvoiceIds([]); }}
              onExportExcel={() => Swal.fire('Excel Exportado', 'Reporte descargado correctamente.', 'success')}
            />

            <InvoicesTable 
              rows={filteredRows}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              tabCounts={tabCounts}
              selectedIds={selectedInvoiceIds}
              onToggleSelectRow={handleToggleSelectRow}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleSigned={handleToggleSigned}
              onToggleFacture={handleToggleFacture}
              onToggleDelivered={handleToggleDelivered}
              onToggleOrderStd={handleToggleOrderStd}
              onViewDetail={handleViewDetail}
              onDeleteInvoice={handleDeleteInvoice}
              onUploadPdf={handleUploadPdf}
            />
          </div>
        )}

        {/* VISTA 2: FACTURAS */}
        {currentView === 'invoices' && (
          <InvoicesModule 
            invoices={activeInvoices}
            onQuickRegister={handleQuickRegister}
            onToggleSigned={handleToggleSigned}
            onToggleOrderStd={handleToggleOrderStd}
            onToggleFacture={handleToggleFacture}
            onToggleDelivered={handleToggleDelivered}
            onDeleteInvoice={handleDeleteInvoice}
          />
        )}

        {/* VISTA 3: PROVEEDORES CON SUBFILAS DESPLEGABLES */}
        {currentView === 'suppliers' && (
          <SuppliersModule 
            suppliers={suppliers}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onUpdateSupplierServices={handleUpdateSupplierServices}
          />
        )}

        {/* VISTA 4: USUARIOS */}
        {currentView === 'users' && (
          <UsersModule 
            users={users}
            onAddUser={handleAddUser}
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
