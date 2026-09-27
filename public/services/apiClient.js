// public/services/apiClient.js
// Cliente de API REST centralizado para Alimentos Enriko

const API = {
  // 1. AUTENTICACIÓN
  auth: {
    login: async (username, password) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return await res.json();
    }
  },

  // 2. PROVEEDORES
  suppliers: {
    getAll: async () => {
      const res = await fetch('/api/suppliers');
      return await res.json();
    },
    save: async (supplierData) => {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      return await res.json();
    }
  },

  // 3. FACTURAS Y COTIZACIONES
  invoices: {
    getAll: async () => {
      const res = await fetch('/api/invoices');
      return await res.json();
    },
    save: async (invoiceData) => {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      return await res.json();
    },
    uploadPdf: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData
      });
      return await res.json();
    }
  },

  // 4. CRM DE COTIZACIONES (RFQS)
  crm: {
    getAll: async () => {
      const res = await fetch('/api/crm/quotations');
      return await res.json();
    },
    save: async (quotationData) => {
      const res = await fetch('/api/crm/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/crm/quotations/${id}`, { method: 'DELETE' });
      return await res.json();
    }
  },

  // 5. USUARIOS
  users: {
    getAll: async () => {
      const res = await fetch('/api/users');
      return await res.json();
    },
    save: async (userData) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      return await res.json();
    }
  },

  // 6. ÁREAS ORGANIZACIONALES
  areas: {
    getAll: async () => {
      const res = await fetch('/api/areas');
      return await res.json();
    },
    save: async (areaData) => {
      const res = await fetch('/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(areaData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/areas/${id}`, { method: 'DELETE' });
      return await res.json();
    }
  },

  // 7. INVENTARIO DE EQUIPOS Y PERIFÉRICOS TI
  inventory: {
    getAll: async () => {
      const res = await fetch('/api/inventory');
      return await res.json();
    },
    save: async (itemData) => {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      return await res.json();
    },
    deliver: async (deliverData) => {
      const res = await fetch('/api/inventory/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliverData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      return await res.json();
    }
  },

  // 8. PRESUPUESTOS TECNOLÓGICOS ANUALES
  budgets: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`/api/budgets${query ? '?' + query : ''}`);
      return await res.json();
    },
    save: async (budgetData) => {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      return await res.json();
    }
  },

  // 9. LIMPIEZA DE BASE DE DATOS
  system: {
    cleanDatabase: async () => {
      const res = await fetch('/api/clean-database', { method: 'POST' });
      return await res.json();
    }
  }
};

window.API = API;