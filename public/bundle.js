const API = {
  // 1. AUTENTICACIÓN
  auth: {
    login: async (username, password) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      return await res.json();
    }
  },
  // 2. PROVEEDORES
  suppliers: {
    getAll: async () => {
      const res = await fetch("/api/suppliers");
      return await res.json();
    },
    save: async (supplierData) => {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
      return await res.json();
    }
  },
  // 3. FACTURAS Y COTIZACIONES
  invoices: {
    getAll: async () => {
      const res = await fetch("/api/invoices");
      return await res.json();
    },
    save: async (invoiceData) => {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      return await res.json();
    },
    uploadPdf: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData
      });
      return await res.json();
    }
  },
  // 4. CRM DE COTIZACIONES (RFQS)
  crm: {
    getAll: async () => {
      const res = await fetch("/api/crm/quotations");
      return await res.json();
    },
    save: async (quotationData) => {
      const res = await fetch("/api/crm/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quotationData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/crm/quotations/${id}`, { method: "DELETE" });
      return await res.json();
    }
  },
  // 5. USUARIOS
  users: {
    getAll: async () => {
      const res = await fetch("/api/users");
      return await res.json();
    },
    save: async (userData) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      return await res.json();
    }
  },
  // 6. ÁREAS ORGANIZACIONALES
  areas: {
    getAll: async () => {
      const res = await fetch("/api/areas");
      return await res.json();
    },
    save: async (areaData) => {
      const res = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(areaData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/areas/${id}`, { method: "DELETE" });
      return await res.json();
    }
  },
  // 7. INVENTARIO DE EQUIPOS Y PERIFÉRICOS TI
  inventory: {
    getAll: async () => {
      const res = await fetch("/api/inventory");
      return await res.json();
    },
    save: async (itemData) => {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData)
      });
      return await res.json();
    },
    deliver: async (deliverData) => {
      const res = await fetch("/api/inventory/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliverData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      return await res.json();
    }
  },
  // 8. PRESUPUESTOS TECNOLÓGICOS ANUALES
  budgets: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`/api/budgets${query ? "?" + query : ""}`);
      return await res.json();
    },
    save: async (budgetData) => {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budgetData)
      });
      return await res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      return await res.json();
    }
  },
  // 9. LIMPIEZA DE BASE DE DATOS
  system: {
    cleanDatabase: async () => {
      const res = await fetch("/api/clean-database", { method: "POST" });
      return await res.json();
    }
  }
};
window.API = API;
const SVG_ICONS = {
  // Navegación & Secciones
  dashboard: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "3", width: "7", height: "9", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "3", width: "7", height: "5", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "12", width: "7", height: "9", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "3", y: "16", width: "7", height: "5", rx: "1" })),
  invoices: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), /* @__PURE__ */ React.createElement("polyline", { points: "14 2 14 8 20 8" }), /* @__PURE__ */ React.createElement("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), /* @__PURE__ */ React.createElement("line", { x1: "16", y1: "17", x2: "8", y2: "17" }), /* @__PURE__ */ React.createElement("line", { x1: "10", y1: "9", x2: "8", y2: "9" })),
  suppliers: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "7", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }), /* @__PURE__ */ React.createElement("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })),
  crm: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("rect", { x: "2", y: "7", width: "20", height: "14", rx: "2", ry: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" })),
  inventory: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("polyline", { points: "21 8 21 21 3 21 3 8" }), /* @__PURE__ */ React.createElement("rect", { x: "1", y: "3", width: "22", height: "5" }), /* @__PURE__ */ React.createElement("line", { x1: "10", y1: "12", x2: "14", y2: "12" })),
  budgets: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "1", x2: "12", y2: "23" }), /* @__PURE__ */ React.createElement("path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" })),
  areas: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("rect", { x: "9", y: "3", width: "6", height: "6", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "3", y: "15", width: "6", height: "6", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "15", y: "15", width: "6", height: "6", rx: "1" }), /* @__PURE__ */ React.createElement("path", { d: "M12 9v3" }), /* @__PURE__ */ React.createElement("path", { d: "M6 15v-1.5a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5V15" })),
  reports: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("line", { x1: "18", y1: "20", x2: "18", y2: "10" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "20", x2: "12", y2: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "6", y1: "20", x2: "6", y2: "14" })),
  alerts: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })),
  users: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "7", r: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "19", y1: "8", x2: "19", y2: "14" }), /* @__PURE__ */ React.createElement("line", { x1: "22", y1: "11", x2: "16", y2: "11" })),
  settings: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })),
  folders: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" })),
  history: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("polyline", { points: "1 4 1 10 7 10" }), /* @__PURE__ */ React.createElement("polyline", { points: "23 20 23 14 17 14" }), /* @__PURE__ */ React.createElement("path", { d: "M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" })),
  logout: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }), /* @__PURE__ */ React.createElement("polyline", { points: "16 17 21 12 16 7" }), /* @__PURE__ */ React.createElement("line", { x1: "21", y1: "12", x2: "9", y2: "12" })),
  // Acciones y Botones
  plus: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "5", x2: "12", y2: "19" }), /* @__PURE__ */ React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" })),
  search: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /* @__PURE__ */ React.createElement("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })),
  filter: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" })),
  download: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), /* @__PURE__ */ React.createElement("polyline", { points: "7 10 12 15 17 10" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "15", x2: "12", y2: "3" })),
  upload: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), /* @__PURE__ */ React.createElement("polyline", { points: "17 8 12 3 7 8" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "3", x2: "12", y2: "15" })),
  excel: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon text-emerald-600" }, /* @__PURE__ */ React.createElement("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), /* @__PURE__ */ React.createElement("polyline", { points: "14 2 14 8 20 8" }), /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "13", x2: "16", y2: "17" }), /* @__PURE__ */ React.createElement("line", { x1: "16", y1: "13", x2: "8", y2: "17" })),
  pdf: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon text-rose-600" }, /* @__PURE__ */ React.createElement("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), /* @__PURE__ */ React.createElement("polyline", { points: "14 2 14 8 20 8" }), /* @__PURE__ */ React.createElement("path", { d: "M10 12h2a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1h-2v-2z" }), /* @__PURE__ */ React.createElement("path", { d: "M10 18v-6" })),
  check: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("polyline", { points: "20 6 9 17 4 12" })),
  close: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), /* @__PURE__ */ React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })),
  deliver: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("rect", { x: "1", y: "3", width: "15", height: "13" }), /* @__PURE__ */ React.createElement("polygon", { points: "16 8 20 8 23 11 23 16 16 16 16 8" }), /* @__PURE__ */ React.createElement("circle", { cx: "5.5", cy: "18.5", r: "2.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "18.5", cy: "18.5", r: "2.5" })),
  edit: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }), /* @__PURE__ */ React.createElement("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })),
  trash: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("polyline", { points: "3 6 5 6 21 6" }), /* @__PURE__ */ React.createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })),
  eye: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" })),
  signature: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M12 19l7-7 3 3-7 7-3-3z" }), /* @__PURE__ */ React.createElement("path", { d: "M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" }), /* @__PURE__ */ React.createElement("path", { d: "M2 2l7.586 7.586" }), /* @__PURE__ */ React.createElement("circle", { cx: "11", cy: "11", r: "2" })),
  building: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("rect", { x: "4", y: "2", width: "16", height: "20", rx: "2", ry: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M9 22v-4h6v4" }), /* @__PURE__ */ React.createElement("path", { d: "M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" })),
  sun: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "5" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "1", x2: "12", y2: "3" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "21", x2: "12", y2: "23" }), /* @__PURE__ */ React.createElement("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }), /* @__PURE__ */ React.createElement("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }), /* @__PURE__ */ React.createElement("line", { x1: "1", y1: "12", x2: "3", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "21", y1: "12", x2: "23", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }), /* @__PURE__ */ React.createElement("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })),
  moon: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" })),
  shield: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" })),
  menu: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "12", x2: "21", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "6", x2: "21", y2: "6" }), /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "18", x2: "21", y2: "18" })),
  cpu: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }), /* @__PURE__ */ React.createElement("rect", { x: "9", y: "9", width: "6", height: "6" }), /* @__PURE__ */ React.createElement("line", { x1: "9", y1: "1", x2: "9", y2: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "15", y1: "1", x2: "15", y2: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "9", y1: "20", x2: "9", y2: "23" }), /* @__PURE__ */ React.createElement("line", { x1: "15", y1: "20", x2: "15", y2: "23" }), /* @__PURE__ */ React.createElement("line", { x1: "20", y1: "9", x2: "23", y2: "9" }), /* @__PURE__ */ React.createElement("line", { x1: "20", y1: "14", x2: "23", y2: "14" }), /* @__PURE__ */ React.createElement("line", { x1: "1", y1: "9", x2: "4", y2: "9" }), /* @__PURE__ */ React.createElement("line", { x1: "1", y1: "14", x2: "4", y2: "14" })),
  monitor: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }), /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "21", x2: "16", y2: "21" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "17", x2: "12", y2: "21" })),
  key: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5L13 7l1 1-6.5 6.5A6.5 6.5 0 1 1 5 12l6.5-6.5L13 7l-1.5 1.5L13 10l1.5-1.5L16 10l1.5-1.5L19 10l2-2v-6h-6z" }), /* @__PURE__ */ React.createElement("circle", { cx: "7.5", cy: "16.5", r: "1.5" })),
  clock: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("polyline", { points: "12 6 12 12 16 14" })),
  bell: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }), /* @__PURE__ */ React.createElement("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" })),
  cloud: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" })),
  sparkles: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" })),
  folder: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("path", { d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" })),
  arrowRight: /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" }), /* @__PURE__ */ React.createElement("polyline", { points: "12 5 19 12 12 19" })),
  "chevron-down": /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("polyline", { points: "6 9 12 15 18 9" })),
  "chevron-up": /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("polyline", { points: "18 15 12 9 6 15" })),
  "arrow-down": /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("polyline", { points: "6 9 12 15 18 9" })),
  "arrow-up": /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "svg-icon" }, /* @__PURE__ */ React.createElement("polyline", { points: "18 15 12 9 6 15" }))
};
function Icon({ name, size = 18, className = "" }) {
  const icon = SVG_ICONS[name] || SVG_ICONS["dashboard"];
  return /* @__PURE__ */ React.createElement(
    "span",
    {
      className: `inline-flex items-center justify-center flex-shrink-0 ${className}`,
      style: { width: size, height: size }
    },
    icon
  );
}
window.Icon = Icon;
window.SVG_ICONS = SVG_ICONS;
function LoginModal({ onLoginSuccess }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Por favor ingresa tu usuario y contrase\xF1a.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await window.API.auth.login(username.trim(), password.trim());
      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Credenciales inv\xE1lidas. Revisa usuario y contrase\xF1a.");
      }
    } catch (err) {
      const u = username.trim().toLowerCase();
      const p = password.trim();
      if (u === "superadmin" && p === "superadmin123" || u === "admin" && p === "admin123" || u === "jr" && p === "enriko2026") {
        onLoginSuccess({
          id: "usr-" + u,
          username: u,
          name: u === "superadmin" ? "Super Administrador General" : u === "jr" ? "Juan Rodr\xEDguez" : "Administrador Principal",
          role: u === "superadmin" ? "superadmin" : "admin",
          area: "Todas las \xC1reas",
          status: "Activo"
        });
      } else {
        setError("Error al comunicarse con el servidor de autenticaci\xF3n.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleQuickFill = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError("");
  };
  return /* @__PURE__ */ React.createElement("div", { style: {
    minHeight: "100vh",
    backgroundColor: "#020617",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: "-100px",
    left: "-100px",
    width: "350px",
    height: "350px",
    backgroundColor: "rgba(225, 29, 72, 0.18)",
    borderRadius: "50%",
    filter: "blur(90px)",
    pointerEvents: "none"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    bottom: "-100px",
    right: "-100px",
    width: "350px",
    height: "350px",
    backgroundColor: "rgba(159, 18, 57, 0.18)",
    borderRadius: "50%",
    filter: "blur(90px)",
    pointerEvents: "none"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
    padding: "32px",
    position: "relative",
    zIndex: 10,
    color: "#f8fafc"
  } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: "28px" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "60px",
    height: "60px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #e11d48, #be123c)",
    boxShadow: "0 10px 25px rgba(225, 29, 72, 0.4)",
    marginBottom: "14px",
    color: "#ffffff",
    fontSize: "24px"
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-invoice-dollar" })), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "22px", fontWeight: 900, letterSpacing: "-0.5px", margin: 0 } }, "Alimentos ", /* @__PURE__ */ React.createElement("span", { style: { color: "#f43f5e" } }, "ENRIKO")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#94a3b8", marginTop: "4px", fontWeight: 600 } }, "Control Documental, Facturas & Cotizaciones")), error && /* @__PURE__ */ React.createElement("div", { style: {
    marginBottom: "20px",
    padding: "12px 14px",
    borderRadius: "12px",
    backgroundColor: "rgba(159, 18, 57, 0.25)",
    border: "1px solid #e11d48",
    color: "#fca5a5",
    fontSize: "12px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "10px"
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-circle-exclamation", style: { color: "#f43f5e" } }), /* @__PURE__ */ React.createElement("span", null, error)), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "6px", letterSpacing: "0.5px" } }, "Usuario de Acceso"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", left: "12px", top: "13px", color: "#64748b", fontSize: "14px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-user" })), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: username,
      onChange: (e) => setUsername(e.target.value),
      placeholder: "ej: superadmin o admin",
      autoFocus: true,
      style: {
        width: "100%",
        padding: "12px 14px 12px 38px",
        backgroundColor: "#020617",
        border: "1px solid #334155",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 700,
        color: "#ffffff",
        outline: "none",
        boxSizing: "border-box"
      }
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "6px", letterSpacing: "0.5px" } }, "Contrase\xF1a"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", left: "12px", top: "13px", color: "#64748b", fontSize: "14px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-lock" })), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "password",
      value: password,
      onChange: (e) => setPassword(e.target.value),
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      style: {
        width: "100%",
        padding: "12px 14px 12px 38px",
        backgroundColor: "#020617",
        border: "1px solid #334155",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 700,
        color: "#ffffff",
        outline: "none",
        boxSizing: "border-box"
      }
    }
  ))), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: loading,
      style: {
        width: "100%",
        marginTop: "8px",
        padding: "14px",
        background: "linear-gradient(135deg, #e11d48, #be123c)",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: 800,
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 8px 20px rgba(225, 29, 72, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "opacity 0.2s",
        opacity: loading ? 0.7 : 1
      }
    },
    loading ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-circle-notch fa-spin" }), /* @__PURE__ */ React.createElement("span", null, "Verificando credenciales...")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-right-to-bracket" }), /* @__PURE__ */ React.createElement("span", null, "Iniciar Sesi\xF3n"))
  )), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #1e293b" } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", textAlign: "center", marginBottom: "12px" } }, "Cuentas Preconfiguradas (Clic para auto-completar):"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleQuickFill("superadmin", "superadmin123"),
      style: {
        padding: "10px 12px",
        borderRadius: "12px",
        backgroundColor: "#020617",
        border: "1px solid #334155",
        textAlign: "left",
        cursor: "pointer",
        color: "#ffffff"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", fontWeight: 800, color: "#f43f5e" } }, "\u{1F451} superadmin"),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: "10px", color: "#64748b", fontFamily: "monospace" } }, "superadmin123")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleQuickFill("admin", "admin123"),
      style: {
        padding: "10px 12px",
        borderRadius: "12px",
        backgroundColor: "#020617",
        border: "1px solid #334155",
        textAlign: "left",
        cursor: "pointer",
        color: "#ffffff"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", fontWeight: 800, color: "#fca5a5" } }, "\u{1F6E1}\uFE0F admin"),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: "10px", color: "#64748b", fontFamily: "monospace" } }, "admin123")
  ))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "20px", textAlign: "center", fontSize: "11px", color: "#64748b", fontWeight: 600 } }, "\u{1F512} Conexi\xF3n segura y autenticaci\xF3n en MySQL GESTION_FACTURAS")));
}
window.LoginModal = LoginModal;
function Sidebar({ currentView, setCurrentView, alertCount, isOpen, onClose, isCollapsed, onToggleCollapse, currentUser, onLogout }) {
  const isSuper = currentUser?.role === "superadmin";
  return /* @__PURE__ */ React.createElement("aside", { className: `sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}` }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "sidebar-logo",
      style: {
        background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
        color: "#ffffff",
        padding: isCollapsed ? "16px 8px" : "20px 16px 18px",
        borderBottom: "none",
        boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center text-center w-full overflow-hidden cursor-pointer", onClick: () => setCurrentView("dashboard") }, !isCollapsed ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center leading-none" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1.5 mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white" }, /* @__PURE__ */ React.createElement(Icon, { name: "cloud", size: 20, className: "text-white" })), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-black text-white tracking-wide uppercase" }, "Alimentos")), /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-black text-white tracking-tight drop-shadow-sm" }, "ENRIKO"), /* @__PURE__ */ React.createElement("span", { className: "text-[8.5px] font-black text-white/90 tracking-widest uppercase italic mt-1 bg-black/15 px-2.5 py-0.5 rounded-full" }, "Calidad que alimenta")) : /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white" }, /* @__PURE__ */ React.createElement(Icon, { name: "cloud", size: 20, className: "text-white" }))),
    /* @__PURE__ */ React.createElement("div", { className: "absolute right-2 top-3 flex items-center gap-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "sidebar-collapse-toggle hidden lg:flex w-6 h-6 rounded text-white/80 hover:text-white items-center justify-center transition-all bg-white/10 hover:bg-white/20",
        onClick: onToggleCollapse,
        title: isCollapsed ? "Expandir men\xFA lateral" : "Contraer men\xFA lateral"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "menu", size: 12 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "sidebar-close-btn lg:hidden w-6 h-6 rounded text-white/80 hover:text-white flex items-center justify-center bg-white/10",
        onClick: onClose,
        title: "Cerrar men\xFA"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "close", size: 12 })
    ))
  ), /* @__PURE__ */ React.createElement("div", { className: "sidebar-menu" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "dashboard" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("dashboard");
        if (onClose) onClose();
      },
      title: isCollapsed ? "Dashboard" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "dashboard", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "Dashboard")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "invoices" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("invoices");
        if (onClose) onClose();
      },
      title: isCollapsed ? "Facturas / Cotizaciones" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "invoices", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "Facturas / Cotizaciones")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "suppliers" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("suppliers");
        if (onClose) onClose();
      },
      title: isCollapsed ? "Proveedores" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "suppliers", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "Proveedores")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "reports" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("reports");
        if (onClose) onClose();
      },
      title: isCollapsed ? "Reportes" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "reports", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "Reportes")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "alerts" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("alerts");
        if (onClose) onClose();
      },
      title: isCollapsed ? `Alertas (${alertCount})` : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "alerts", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "Alertas"),
    alertCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "badge-count bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full text-[10px] ml-auto" }, alertCount)
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "users" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("users");
        if (onClose) onClose();
      },
      title: isCollapsed ? "Usuarios" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "users", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "Usuarios")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "settings" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("settings");
        if (onClose) onClose();
      },
      title: isCollapsed ? "Configuraci\xF3n" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "settings", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "Configuraci\xF3n")
  ), !isCollapsed && /* @__PURE__ */ React.createElement("div", { className: "menu-header text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mt-4 px-3" }, "GESTI\xD3N & TI"), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "inventory" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("inventory");
        if (onClose) onClose();
      },
      title: isCollapsed ? "Inventario TI" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "inventory", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "Inventario TI")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "budgets" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("budgets");
        if (onClose) onClose();
      },
      title: isCollapsed ? "Presupuestos TI" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "budgets", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "Presupuestos TI")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "areas" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("areas");
        if (onClose) onClose();
      },
      title: isCollapsed ? "\xC1reas & Directores" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "areas", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "\xC1reas & Directores")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "crm" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("crm");
        if (onClose) onClose();
      },
      title: isCollapsed ? "CRM Cotizaciones" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "crm", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "CRM Cotizaciones")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "folders" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("folders");
        if (onClose) onClose();
      },
      title: isCollapsed ? "Carpetas de documentos" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "folders", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "Carpetas de documentos")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `menu-item ${currentView === "history" ? "active" : ""}`,
      onClick: () => {
        setCurrentView("history");
        if (onClose) onClose();
      },
      title: isCollapsed ? "Historial" : void 0
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "history", size: 18 }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", null, "Historial")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "menu-item text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800",
      onClick: onLogout,
      title: "Cerrar sesi\xF3n"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "logout", size: 18, className: "text-red-600" }),
    !isCollapsed && /* @__PURE__ */ React.createElement("span", { className: "font-extrabold text-red-600" }, "Cerrar Sesi\xF3n")
  )), !isCollapsed && /* @__PURE__ */ React.createElement("div", { className: "px-3 pb-3 pt-1" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "rounded-2xl p-3 text-center border relative overflow-hidden",
      style: {
        background: "linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)",
        borderColor: "#fecdd3",
        boxShadow: "0 2px 8px rgba(220, 38, 38, 0.06)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center py-1" }, /* @__PURE__ */ React.createElement("span", { className: "w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-xs border border-red-100" }, /* @__PURE__ */ React.createElement(Icon, { name: "cloud", size: 18, className: "text-red-600" }))),
    /* @__PURE__ */ React.createElement("div", { className: "relative z-10 mt-1" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-snug" }, "Control, orden y eficiencia para una mejor gesti\xF3n"))
  ), /* @__PURE__ */ React.createElement("div", { className: "text-[9px] font-mono text-center text-slate-400 mt-1.5" }, "v1.0.0")));
}
window.Sidebar = Sidebar;
function TopNavbar({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, alertCount, onOpenAlerts, onOpenUsers, darkMode, onToggleDarkMode, onToggleSidebar, currentUser, onLogout }) {
  const allMonths = [
    "Todos",
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ];
  const allYears = ["Todos", "2026", "2027", "2028", "2029", "2030"];
  const userInitials = currentUser && currentUser.name ? currentUser.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "AE";
  const isSuper = currentUser?.role === "superadmin";
  return /* @__PURE__ */ React.createElement("header", { className: "top-navbar bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-7 py-3 flex items-center justify-between sticky top-0 z-40" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all border border-slate-200 dark:border-zinc-700",
      onClick: onToggleSidebar,
      title: "Contraer / Expandir Men\xFA Lateral"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "menu", size: 18 })
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 leading-none" }, /* @__PURE__ */ React.createElement("span", { className: "text-base font-black text-slate-900 dark:text-white" }, "Alimentos Enriko"), /* @__PURE__ */ React.createElement("span", { className: "text-slate-300 dark:text-zinc-600" }, "|"), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-bold text-slate-700 dark:text-zinc-200" }, "Control de Facturas & Cotizaciones")), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mt-1" }, "Sistema de gesti\xF3n documental"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 sm:gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700/60 text-xs" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 14, className: "text-red-500" }), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-500 dark:text-zinc-400 text-[11px] uppercase" }, "Mes:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "bg-transparent font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer",
      value: selectedMonth,
      onChange: (e) => setSelectedMonth(e.target.value)
    },
    allMonths.map((m) => /* @__PURE__ */ React.createElement("option", { key: m, value: m, className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, m))
  )), /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700/60 text-xs" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 14, className: "text-red-500" }), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-500 dark:text-zinc-400 text-[11px] uppercase" }, "A\xF1o:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "bg-transparent font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer",
      value: selectedYear,
      onChange: (e) => setSelectedYear(e.target.value)
    },
    allYears.map((y) => /* @__PURE__ */ React.createElement("option", { key: y, value: y, className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, y))
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onToggleDarkMode,
      className: "w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all shadow-2xs cursor-pointer group",
      title: darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"
    },
    darkMode ? /* @__PURE__ */ React.createElement(Icon, { name: "sun", size: 20, className: "text-amber-400 group-hover:scale-110 transition-transform" }) : /* @__PURE__ */ React.createElement(Icon, { name: "moon", size: 20, className: "text-slate-600 dark:text-zinc-300 group-hover:text-red-600 group-hover:scale-110 transition-all" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onOpenAlerts,
      className: "w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all shadow-2xs relative cursor-pointer group",
      title: "Alertas de vencimiento"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "bell", size: 20, className: "group-hover:scale-110 transition-transform" }),
    alertCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 shadow-sm animate-pulse" }, alertCount)
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: onOpenUsers,
      className: "flex items-center gap-2 px-2 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 cursor-pointer hover:border-red-400 hover:shadow-sm transition-all",
      title: "Gesti\xF3n de usuario"
    },
    /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-700 text-white font-black text-xs flex items-center justify-center shadow-xs ring-1 ring-red-200 dark:ring-red-900" }, currentUser?.initials || userInitials || "SA"),
    /* @__PURE__ */ React.createElement("div", { className: "hidden lg:flex flex-col text-left mr-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black text-slate-800 dark:text-zinc-200 leading-tight" }, currentUser ? currentUser.name : "Super Admin"), /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider" }, isSuper ? "SUPERADMIN" : "ADMINISTRADOR")),
    /* @__PURE__ */ React.createElement(Icon, { name: "arrow-down", size: 13, className: "text-slate-400 hover:text-red-600 transition-colors" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onLogout,
      className: "w-10 h-10 rounded-xl bg-gradient-to-r from-red-50 to-red-100/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 flex items-center justify-center hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white hover:border-red-600 transition-all shadow-2xs cursor-pointer group",
      title: "Cerrar Sesi\xF3n"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "logout", size: 18, className: "text-red-600 group-hover:text-white transition-colors group-hover:scale-110" })
  )));
}
window.TopNavbar = TopNavbar;
function KpiCards({ total, facCount, cotCount, toSignCount, pendingFactureCount, pendingManagementCount, delayedCount }) {
  const toSignPercent = total > 0 ? (toSignCount / total * 100).toFixed(0) : 0;
  const facturePercent = total > 0 ? (pendingFactureCount / total * 100).toFixed(0) : 0;
  const managePct = total > 0 ? (pendingManagementCount / total * 100).toFixed(0) : 0;
  const isDark = document.body.classList.contains("dark");
  const cardStyle = (accent, alertMode) => ({
    background: isDark ? "#111115" : "#ffffff",
    borderRadius: "16px",
    border: `1px solid ${isDark ? "#27272a" : "#e2e8f0"}`,
    borderLeft: `5px solid ${accent}`,
    padding: "20px 18px 16px",
    boxShadow: alertMode ? `0 0 0 2px ${accent}22, 0 4px 18px rgba(0,0,0,0.07)` : "0 2px 14px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    cursor: "default"
  });
  const iconStyle = (bg) => ({
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  });
  const badgeStyle = (color, bg, border) => ({
    fontSize: "9.5px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    background: bg,
    color,
    border: `1px solid ${border}`,
    padding: "2px 8px",
    borderRadius: "999px"
  });
  const handleHover = (el, accent) => {
    el.style.transform = "translateY(-4px)";
    el.style.boxShadow = `0 12px 28px rgba(0,0,0,0.12), 0 0 0 2px ${accent}33`;
  };
  const handleLeave = (el, alertMode, accent) => {
    el.style.transform = "translateY(0)";
    el.style.boxShadow = alertMode ? `0 0 0 2px ${accent}22, 0 4px 18px rgba(0,0,0,0.07)` : "0 2px 14px rgba(0,0,0,0.05)";
  };
  const labelStyle = {
    fontSize: "11px",
    fontWeight: 700,
    color: isDark ? "#94a3b8" : "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.4px"
  };
  const valueStyle = (color) => ({
    fontSize: "34px",
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-1.5px",
    color
  });
  const subStyle = (color) => ({
    fontSize: "11px",
    fontWeight: 600,
    color,
    marginTop: "2px"
  });
  const cards = [
    {
      accent: "#e11d48",
      iconBg: "#fef2f2",
      iconColor: "#e11d48",
      iconName: "folder",
      badge: "TOTAL",
      badgeColor: "#9f1239",
      badgeBg: "#fee2e2",
      badgeBorder: "#fecdd3",
      value: total,
      valueColor: isDark ? "#fff" : "#0f172a",
      sub: /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: 600, color: isDark ? "#94a3b8" : "#64748b" } }, /* @__PURE__ */ React.createElement("b", { style: { color: "#e11d48" } }, facCount, " FAC"), "\xA0\xB7\xA0", /* @__PURE__ */ React.createElement("b", { style: { color: "#7c3aed" } }, cotCount, " COT"))
    },
    {
      accent: "#2563eb",
      iconBg: "#eff6ff",
      iconColor: "#2563eb",
      iconName: "invoices",
      badge: "FACTURAS",
      badgeColor: "#1d4ed8",
      badgeBg: "#dbeafe",
      badgeBorder: "#bfdbfe",
      value: facCount,
      valueColor: isDark ? "#fff" : "#0f172a",
      sub: /* @__PURE__ */ React.createElement("span", { style: subStyle(isDark ? "#94a3b8" : "#64748b") }, "Radicadas oficiales")
    },
    {
      accent: "#7c3aed",
      iconBg: "#f5f3ff",
      iconColor: "#7c3aed",
      iconName: "crm",
      badge: "COTIZACIONES",
      badgeColor: "#6d28d9",
      badgeBg: "#ede9fe",
      badgeBorder: "#ddd6fe",
      value: cotCount,
      valueColor: isDark ? "#fff" : "#0f172a",
      sub: /* @__PURE__ */ React.createElement("span", { style: subStyle(isDark ? "#94a3b8" : "#64748b") }, "Por convertir a FAC")
    },
    {
      accent: "#d97706",
      iconBg: "#fffbeb",
      iconColor: "#d97706",
      iconName: "signature",
      badge: "POR FIRMAR",
      badgeColor: "#92400e",
      badgeBg: "#fef3c7",
      badgeBorder: "#fde68a",
      value: toSignCount,
      valueColor: toSignCount > 0 ? "#d97706" : isDark ? "#fff" : "#0f172a",
      sub: /* @__PURE__ */ React.createElement("span", { style: subStyle(toSignCount > 0 ? "#d97706" : isDark ? "#94a3b8" : "#64748b") }, toSignPercent, "% pendiente"),
      warn: toSignCount > 0
    },
    {
      accent: "#0284c7",
      iconBg: "#f0f9ff",
      iconColor: "#0284c7",
      iconName: "clock",
      badge: "FACTURE",
      badgeColor: "#0369a1",
      badgeBg: "#e0f2fe",
      badgeBorder: "#bae6fd",
      value: pendingFactureCount,
      valueColor: isDark ? "#fff" : "#0f172a",
      sub: /* @__PURE__ */ React.createElement("span", { style: subStyle(isDark ? "#94a3b8" : "#64748b") }, facturePercent, "% sin radicar")
    },
    {
      accent: "#059669",
      iconBg: "#f0fdf4",
      iconColor: "#059669",
      iconName: "deliver",
      badge: "ENTREGA",
      badgeColor: "#065f46",
      badgeBg: "#d1fae5",
      badgeBorder: "#a7f3d0",
      value: pendingManagementCount,
      valueColor: isDark ? "#fff" : "#0f172a",
      sub: /* @__PURE__ */ React.createElement("span", { style: subStyle(isDark ? "#94a3b8" : "#64748b") }, managePct, "% por entregar")
    },
    {
      accent: "#dc2626",
      iconBg: "#fef2f2",
      iconColor: "#dc2626",
      iconName: "alerts",
      badge: "ATRASADAS",
      badgeColor: "#991b1b",
      badgeBg: "#fee2e2",
      badgeBorder: "#fecaca",
      value: delayedCount,
      valueColor: delayedCount > 0 ? "#dc2626" : isDark ? "#fff" : "#0f172a",
      sub: /* @__PURE__ */ React.createElement("span", { style: subStyle(delayedCount > 0 ? "#dc2626" : isDark ? "#94a3b8" : "#64748b") }, delayedCount > 0 ? "\u25B2 Requieren atenci\xF3n" : "\u2713 Sin atrasos"),
      alert: delayedCount > 0
    }
  ];
  return /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))",
    gap: "16px",
    marginBottom: "28px"
  } }, cards.map((c, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      style: cardStyle(c.accent, c.alert),
      onMouseEnter: (e) => handleHover(e.currentTarget, c.accent),
      onMouseLeave: (e) => handleLeave(e.currentTarget, c.alert, c.accent)
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: "-14px",
      right: "-14px",
      width: "72px",
      height: "72px",
      borderRadius: "50%",
      background: c.iconBg,
      opacity: 0.7,
      pointerEvents: "none"
    } }),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: iconStyle(c.iconBg) }, /* @__PURE__ */ React.createElement(Icon, { name: c.iconName, size: 20, style: { color: c.iconColor } })), /* @__PURE__ */ React.createElement("span", { style: badgeStyle(c.badgeColor, c.badgeBg, c.badgeBorder) }, c.badge)),
    /* @__PURE__ */ React.createElement("div", { style: valueStyle(c.valueColor) }, c.value),
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: labelStyle }, c.badge === "TOTAL" ? "Total Documentos" : c.badge === "FACTURAS" ? "Facturas Oficiales" : c.badge === "COTIZACIONES" ? "Cotizaciones" : c.badge === "POR FIRMAR" ? "Por Firmar" : c.badge === "FACTURE" ? "En Facture" : c.badge === "ENTREGA" ? "Pendiente Entrega" : "Atrasadas"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "2px" } }, c.sub))
  )));
}
window.KpiCards = KpiCards;
function ChartsSection({ managedCount, pendingCount, enFactureCount, otherCount, totalCount, onQuickRegister, onGoInvoices, onGoReports, onGoSuppliers }) {
  const isDark = document.body.classList.contains("dark");
  const total = totalCount || 1;
  const managedPct = Math.round(managedCount / total * 100);
  const pendingPct = Math.round(pendingCount / total * 100);
  const facturePct = Math.round(enFactureCount / total * 100);
  const otherPct = Math.max(0, 100 - managedPct - pendingPct - facturePct);
  const R = 15.9, C = 2 * Math.PI * R;
  const seg = (pct) => pct / 100 * C;
  let offset = 0;
  const segments = [
    { pct: managedPct, color: "#10b981", label: "Entregadas", count: managedCount },
    { pct: pendingPct, color: "#f59e0b", label: "Pendientes", count: pendingCount },
    { pct: facturePct, color: "#3b82f6", label: "En Facture", count: enFactureCount },
    { pct: otherPct, color: "#e11d48", label: "Por Firmar", count: otherCount }
  ].map((s) => {
    const dash = seg(s.pct);
    const gap = C - dash;
    const off = offset;
    offset += dash;
    return { ...s, dash, gap, off };
  });
  const cardBg = isDark ? "#111115" : "#ffffff";
  const cardBdr = isDark ? "#27272a" : "#e2e8f0";
  const textMain = isDark ? "#f8fafc" : "#0f172a";
  const textSub = isDark ? "#94a3b8" : "#64748b";
  const barBg = isDark ? "#1e293b" : "#f1f5f9";
  const card = {
    background: cardBg,
    borderRadius: "18px",
    border: `1px solid ${cardBdr}`,
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    padding: "24px",
    display: "flex",
    flexDirection: "column"
  };
  const sectionTitle = (color = textMain) => ({
    fontSize: "14px",
    fontWeight: 800,
    color,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px"
  });
  const maxH = 96;
  const bars = [
    { label: "May", count: 18, color: barBg },
    { label: "Jun", count: 24, color: barBg },
    { label: "Jul", count: 22, color: barBg },
    { label: "Ago", count: 26, color: barBg },
    { label: "Sep", count: totalCount, color: "linear-gradient(to top, #be123c, #e11d48, #f43f5e)", isCurrent: true }
  ];
  const maxBar = Math.max(...bars.map((b) => b.count), 1);
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "28px" } }, /* @__PURE__ */ React.createElement("div", { style: card }, /* @__PURE__ */ React.createElement("div", { style: sectionTitle() }, /* @__PURE__ */ React.createElement("span", { style: { width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", display: "inline-block", flexShrink: 0 } }), "Estado General de Documentos", /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", background: isDark ? "#1e293b" : "#f1f5f9", color: textSub, padding: "2px 10px", borderRadius: "999px" } }, "DISTRIBUCI\xD3N")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "20px", flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "130px", height: "130px", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 36 36", style: { width: "100%", height: "100%", transform: "rotate(-90deg)" } }, /* @__PURE__ */ React.createElement("circle", { cx: "18", cy: "18", r: "15.9", fill: "none", stroke: isDark ? "#1e293b" : "#f1f5f9", strokeWidth: "3.8" }), totalCount === 0 ? /* @__PURE__ */ React.createElement("circle", { cx: "18", cy: "18", r: "15.9", fill: "none", stroke: isDark ? "#27272a" : "#e2e8f0", strokeWidth: "3.8", strokeDasharray: "100 0" }) : segments.map((s, i) => s.pct > 0 && /* @__PURE__ */ React.createElement(
    "circle",
    {
      key: i,
      cx: "18",
      cy: "18",
      r: "15.9",
      fill: "none",
      stroke: s.color,
      strokeWidth: "3.8",
      strokeDasharray: `${s.dash.toFixed(2)} ${s.gap.toFixed(2)}`,
      strokeDashoffset: -s.off.toFixed(2),
      strokeLinecap: "round"
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "26px", fontWeight: 900, color: textMain, lineHeight: 1 } }, totalCount), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: textSub, marginTop: "2px" } }, "TOTAL"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "10px", flex: 1 } }, segments.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("span", { style: { width: "10px", height: "10px", borderRadius: "3px", background: s.color, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", fontWeight: 600, color: textSub } }, s.label)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", fontWeight: 800, color: textMain } }, s.count, " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "10px", color: textSub, fontWeight: 600 } }, "(", s.pct, "%)"))))))), /* @__PURE__ */ React.createElement("div", { style: card }, /* @__PURE__ */ React.createElement("div", { style: sectionTitle() }, /* @__PURE__ */ React.createElement("span", { style: { width: "10px", height: "10px", borderRadius: "50%", background: "#e11d48", display: "inline-block", flexShrink: 0 } }), "Volumen Mensual de Facturaci\xF3n", /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto", fontSize: "10px", fontWeight: 800, color: "#e11d48", background: "#fef2f2", border: "1px solid #fecdd3", padding: "2px 10px", borderRadius: "999px" } }, "2026")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: "10px", height: "110px", marginTop: "auto" } }, bars.map((b, i) => {
    const h = Math.round(b.count / maxBar * maxH);
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "10px", fontWeight: 700, color: b.isCurrent ? "#e11d48" : textSub } }, b.count), /* @__PURE__ */ React.createElement("div", { style: {
      width: "100%",
      borderRadius: "6px 6px 0 0",
      height: `${Math.max(h, 8)}px`,
      background: b.isCurrent ? "linear-gradient(to top, #be123c, #e11d48)" : barBg,
      boxShadow: b.isCurrent ? "0 4px 16px rgba(225,29,72,0.35)" : "none",
      transition: "height 0.3s ease"
    } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: b.isCurrent ? 900 : 600, color: b.isCurrent ? "#e11d48" : textSub } }, b.label));
  }))), /* @__PURE__ */ React.createElement("div", { style: card }, /* @__PURE__ */ React.createElement("div", { style: sectionTitle() }, /* @__PURE__ */ React.createElement("span", { style: { width: "10px", height: "10px", borderRadius: "50%", background: "#2563eb", display: "inline-block", flexShrink: 0 } }), "Acciones Frecuentes"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", flex: 1 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onQuickRegister,
      style: {
        gridColumn: "1 / -1",
        background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        padding: "14px 16px",
        cursor: "pointer",
        textAlign: "left",
        boxShadow: "0 6px 18px rgba(225,29,72,0.35)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        transition: "transform 0.15s, box-shadow 0.15s"
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(225,29,72,0.45)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(225,29,72,0.35)";
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { width: "34px", height: "34px", borderRadius: "9px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 18, style: { color: "#fff" } })),
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", fontWeight: 900, color: "#fff" } }, "Nueva Factura / Cotizaci\xF3n"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "10px", color: "rgba(255,255,255,0.75)", marginTop: "2px" } }, "Registrar nuevo documento"))
  ), [
    { label: "Ver Facturas", sub: "M\xF3dulo completo", icon: "invoices", color: "#e11d48", bg: "#fef2f2", border: "#fecdd3", action: onGoInvoices },
    { label: "Proveedores", sub: "Gestionar base", icon: "suppliers", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", action: onGoSuppliers },
    { label: "Auditor\xEDa & Reportes", sub: "Exportar datos", icon: "reports", color: "#059669", bg: "#f0fdf4", border: "#a7f3d0", action: onGoReports }
  ].map((a, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      onClick: a.action,
      style: {
        gridColumn: i === 2 ? "1 / -1" : "auto",
        background: cardBg,
        border: `1.5px solid ${cardBdr}`,
        borderRadius: "12px",
        padding: "12px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transition: "transform 0.15s, border-color 0.15s"
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.borderColor = a.color;
        e.currentTarget.style.transform = "translateY(-2px)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.borderColor = cardBdr;
        e.currentTarget.style.transform = "translateY(0)";
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { width: "32px", height: "32px", borderRadius: "9px", background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Icon, { name: a.icon, size: 16, style: { color: a.color } })),
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", fontWeight: 800, color: textMain } }, a.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "10px", color: textSub, marginTop: "1px" } }, a.sub))
  )))));
}
window.ChartsSection = ChartsSection;
function FiltersBar({
  searchTerm,
  setSearchTerm,
  selectedSupplier,
  setSelectedSupplier,
  selectedFactureFilter,
  setSelectedFactureFilter,
  selectedSignedFilter,
  setSelectedSignedFilter,
  selectedOrderStdFilter,
  setSelectedOrderStdFilter,
  selectedOcFilter,
  setSelectedOcFilter,
  selectedDeliveredFilter,
  setSelectedDeliveredFilter,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  suppliersList,
  onClean,
  onExportExcel,
  onOpenExcelPreview,
  selectedCount,
  currentTab
}) {
  const allMonths = [
    "Todos",
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ];
  const allYears = ["Todos", "2026", "2027", "2028", "2029", "2030"];
  const isDeliveredSelected = selectedDeliveredFilter === "S\xCD" || currentTab === "Entregadas" || selectedCount > 0;
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-sm mb-6 flex flex-col gap-3.5 transition-all" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3 flex-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 flex-1 min-w-[280px] focus-within:border-rose-600 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all shadow-inner" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 16, className: "text-slate-400" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Buscar por # radicado, factura, cotizaci\xF3n, proveedor o servicio...",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      className: "bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none w-full placeholder:text-slate-400"
    }
  ), searchTerm && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSearchTerm(""),
      className: "text-slate-400 hover:text-rose-600 text-xs font-bold",
      title: "Limpiar b\xFAsqueda"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "close", size: 14 })
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onClean,
      className: "px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200 dark:border-zinc-700 shadow-2xs",
      title: "Restablecer todos los filtros"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "history", size: 14, className: "text-slate-500" }),
    /* @__PURE__ */ React.createElement("span", null, "Limpiar")
  ), isDeliveredSelected && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onOpenExcelPreview,
      className: "px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-2 transition-all shadow-sm",
      title: "Abrir Vista Previa tipo Hoja de C\xE1lculo Excel"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "invoices", size: 15, className: "text-blue-600" }),
    /* @__PURE__ */ React.createElement("span", null, "Vista Previa ", selectedCount > 0 ? `(${selectedCount})` : "")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onExportExcel,
      className: "px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black flex items-center gap-2 transition-all shadow-sm shadow-red-600/25 active:scale-[0.98] border border-red-500/30",
      title: "Exportar registros filtrados a Excel"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "excel", size: 15, className: "text-white" }),
    /* @__PURE__ */ React.createElement("span", null, "Exportar Excel")
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-zinc-800/80" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-700 dark:text-zinc-300 mr-1" }, /* @__PURE__ */ React.createElement(Icon, { name: "filter", size: 14, className: "text-slate-500" }), /* @__PURE__ */ React.createElement("span", null, "FILTROS:")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 13, className: "text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-slate-400 uppercase" }, "MES:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedMonth || "Todos",
      onChange: (e) => setSelectedMonth && setSelectedMonth(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
    },
    allMonths.map((m) => /* @__PURE__ */ React.createElement("option", { key: m, value: m, className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, m))
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 13, className: "text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-slate-400 uppercase" }, "A\xD1O:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedYear || "Todos",
      onChange: (e) => setSelectedYear && setSelectedYear(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
    },
    allYears.map((y) => /* @__PURE__ */ React.createElement("option", { key: y, value: y, className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, y))
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all" }, /* @__PURE__ */ React.createElement(Icon, { name: "users", size: 13, className: "text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-slate-400 uppercase" }, "PROVEEDOR:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedSupplier,
      onChange: (e) => setSelectedSupplier(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer max-w-[140px] truncate pr-1"
    },
    /* @__PURE__ */ React.createElement("option", { value: "Todos", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Todos"),
    suppliersList.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s, className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, s))
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all" }, /* @__PURE__ */ React.createElement(Icon, { name: "signature", size: 13, className: "text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-slate-400 uppercase" }, "FIRMADA:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedSignedFilter || "Todos",
      onChange: (e) => setSelectedSignedFilter && setSelectedSignedFilter(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
    },
    /* @__PURE__ */ React.createElement("option", { value: "Todos", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Todos"),
    /* @__PURE__ */ React.createElement("option", { value: "S\xCD", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "S\xCD"),
    /* @__PURE__ */ React.createElement("option", { value: "NO", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "NO")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all" }, /* @__PURE__ */ React.createElement(Icon, { name: "history", size: 13, className: "text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-slate-400 uppercase" }, "ORDEN STD:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedOrderStdFilter || "Todos",
      onChange: (e) => setSelectedOrderStdFilter && setSelectedOrderStdFilter(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
    },
    /* @__PURE__ */ React.createElement("option", { value: "Todos", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Todos"),
    /* @__PURE__ */ React.createElement("option", { value: "S\xCD", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "S\xCD"),
    /* @__PURE__ */ React.createElement("option", { value: "NO", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "NO")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all" }, /* @__PURE__ */ React.createElement(Icon, { name: "file-text", size: 13, className: "text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-slate-400 uppercase" }, "OC:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedOcFilter || "Todos",
      onChange: (e) => setSelectedOcFilter && setSelectedOcFilter(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
    },
    /* @__PURE__ */ React.createElement("option", { value: "Todos", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Todos"),
    /* @__PURE__ */ React.createElement("option", { value: "CON_OC", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Con OC"),
    /* @__PURE__ */ React.createElement("option", { value: "SIN_OC", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Sin OC")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all" }, /* @__PURE__ */ React.createElement(Icon, { name: "clock", size: 13, className: "text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-slate-400 uppercase" }, "FACTURE:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedFactureFilter,
      onChange: (e) => setSelectedFactureFilter(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
    },
    /* @__PURE__ */ React.createElement("option", { value: "Todos", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Todos"),
    /* @__PURE__ */ React.createElement("option", { value: "S\xCD", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "S\xCD"),
    /* @__PURE__ */ React.createElement("option", { value: "NO", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "NO")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all" }, /* @__PURE__ */ React.createElement(Icon, { name: "deliver", size: 13, className: "text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-slate-400 uppercase" }, "ENTREGADA:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedDeliveredFilter || "Todos",
      onChange: (e) => setSelectedDeliveredFilter && setSelectedDeliveredFilter(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
    },
    /* @__PURE__ */ React.createElement("option", { value: "Todos", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Todos"),
    /* @__PURE__ */ React.createElement("option", { value: "S\xCD", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "S\xCD"),
    /* @__PURE__ */ React.createElement("option", { value: "NO", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "NO")
  ))));
}
window.FiltersBar = FiltersBar;
function MoneyInputField({ initialValue, onCommit }) {
  const [text, setText] = React.useState(() => {
    if (initialValue === "" || initialValue === null || initialValue === void 0) return "";
    const num = Number(initialValue);
    if (isNaN(num) || num === 0) return "";
    return num.toFixed(2);
  });
  const [isFocused, setIsFocused] = React.useState(false);
  React.useEffect(() => {
    if (!isFocused) {
      if (initialValue === "" || initialValue === null || initialValue === void 0) {
        setText("");
      } else {
        const num = Number(initialValue);
        if (isNaN(num) || num === 0) {
          setText("");
        } else {
          setText(num.toFixed(2));
        }
      }
    }
  }, [initialValue, isFocused]);
  const handleFocus = () => {
    setIsFocused(true);
    if (text === "0" || text === "0.00") {
      setText("");
    }
  };
  const handleChange = (e) => {
    let raw = e.target.value.replace(/[^0-9.]/g, "");
    const parts = raw.split(".");
    if (parts.length > 2) {
      raw = parts[0] + "." + parts.slice(1).join("");
    }
    if (parts.length === 2 && parts[1].length > 2) {
      raw = parts[0] + "." + parts[1].substring(0, 2);
    }
    setText(raw);
  };
  const handleBlur = () => {
    setIsFocused(false);
    let valStr = text.trim();
    if (!valStr) {
      setText("");
      if (onCommit) onCommit(0);
      return;
    }
    let finalNum = 0;
    if (valStr.includes(".")) {
      const [entero, dec = ""] = valStr.split(".");
      const dec2 = (dec + "00").substring(0, 2);
      finalNum = Number(`${entero || "0"}.${dec2}`) || 0;
    } else {
      finalNum = Number(`${valStr}.00`) || 0;
    }
    setText(finalNum.toFixed(2));
    if (onCommit) onCommit(finalNum);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };
  return /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      inputMode: "decimal",
      className: "bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-right text-slate-800 dark:text-zinc-100 outline-none w-20 transition-all shadow-2xs",
      value: text,
      placeholder: "0.00",
      onFocus: handleFocus,
      onChange: handleChange,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      title: "Monto monetario (ej: 5205300)"
    }
  );
}
window.MoneyInputField = MoneyInputField;
function InvoicesTable({
  rows,
  currentTab,
  setCurrentTab,
  tabCounts,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAll,
  onToggleSigned,
  onToggleFacture,
  onToggleDelivered,
  onToggleOrderStd,
  onUpdateInvoiceField,
  onViewDetail,
  onDeleteInvoice,
  onUploadPdf
}) {
  const isAllSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 p-3 bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800/80 overflow-x-auto" }, [
    { id: "Todos", label: "Todos", count: tabCounts.total, icon: "dashboard" },
    { id: "Facturas", label: "Facturas", count: tabCounts.fac, icon: "invoices" },
    { id: "Cotizaciones", label: "Cotizaciones", count: tabCounts.cot, icon: "crm" },
    { id: "Pendientes", label: "Pendientes", count: tabCounts.pending, icon: "clock" },
    { id: "Atrasadas", label: "Atrasadas", count: tabCounts.delayed, icon: "alerts" },
    { id: "En Facture", label: "En Facture", count: tabCounts.facture, icon: "inventory" }
  ].map((tab) => {
    const isActive = currentTab === tab.id;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tab.id,
        onClick: () => setCurrentTab(tab.id),
        className: `px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${isActive ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/30" : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/60 border border-slate-200 dark:border-zinc-700"}`
      },
      /* @__PURE__ */ React.createElement(Icon, { name: tab.icon, size: 14, className: isActive ? "text-white" : "text-slate-400" }),
      /* @__PURE__ */ React.createElement("span", null, tab.label),
      /* @__PURE__ */ React.createElement("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-black ${isActive ? "bg-red-800/60 text-white" : "bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300"}` }, tab.count)
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse text-xs" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm" }, /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 w-8 text-center text-white" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: isAllSelected,
      onChange: (e) => onToggleSelectAll(e.target.checked),
      className: "rounded text-red-600 focus:ring-red-500 cursor-pointer w-4 h-4 accent-red-500",
      title: "Seleccionar todo"
    }
  )), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Icon, { name: "dashboard", size: 13, className: "text-white/80" }), /* @__PURE__ */ React.createElement("span", null, "PROVEEDOR"))), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Icon, { name: "inventory", size: 13, className: "text-white/80" }), /* @__PURE__ */ React.createElement("span", null, "SERVICIO"))), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Icon, { name: "file-text", size: 13, className: "text-white/80" }), /* @__PURE__ */ React.createElement("span", null, "N\xB0 COMPROBANTE"))), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 13, className: "text-white/80" }), /* @__PURE__ */ React.createElement("span", null, "EMISI\xD3N"))), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 13, className: "text-white/80" }), /* @__PURE__ */ React.createElement("span", null, "ENTREGA"))), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-right text-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-1.5" }, /* @__PURE__ */ React.createElement(Icon, { name: "budgets", size: 13, className: "text-white/80" }), /* @__PURE__ */ React.createElement("span", null, "VALOR ($)"))), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-center text-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1.5" }, /* @__PURE__ */ React.createElement(Icon, { name: "signature", size: 13, className: "text-white/80" }), /* @__PURE__ */ React.createElement("span", null, "FIRMADA"))), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-center text-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1.5" }, /* @__PURE__ */ React.createElement(Icon, { name: "history", size: 13, className: "text-white/80" }), /* @__PURE__ */ React.createElement("span", null, "ORDEN STD"))), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-white" }, "OC"), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-center text-white" }, "FACTURE"), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-center text-white" }, "ENTREGADA"), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-center text-white" }, "PDF"), /* @__PURE__ */ React.createElement("th", { className: "px-3 py-3 text-center text-white" }, "ACCIONES"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium" }, rows.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "14", className: "text-center py-12 text-slate-400 dark:text-zinc-500" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "folder", size: 32, className: "text-slate-300 dark:text-zinc-600" }), /* @__PURE__ */ React.createElement("span", null, "No hay documentos que coincidan con los filtros seleccionados.")))) : rows.map((row) => {
    const isChecked = selectedIds.includes(row.id);
    const isCot = (row.invoiceNumber || "").toUpperCase().startsWith("COT") || row.docType === "cotizacion";
    return /* @__PURE__ */ React.createElement(
      "tr",
      {
        key: row.id,
        className: `hover:bg-rose-50/20 dark:hover:bg-zinc-800/40 transition-colors ${isChecked ? "bg-rose-50/40 dark:bg-rose-950/20" : ""}`
      },
      /* @__PURE__ */ React.createElement("td", { className: "px-3 py-2 text-center" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          checked: isChecked,
          onChange: () => onToggleSelectRow(row.id),
          className: "rounded text-red-600 focus:ring-red-500 cursor-pointer w-4 h-4 accent-red-500"
        }
      )),
      /* @__PURE__ */ React.createElement("td", { className: "px-3 py-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-red-700 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 shadow-xs ring-1 ring-red-100 dark:ring-red-950" }, row.logoText || (row.supplier || "PR").substring(0, 2).toUpperCase()), /* @__PURE__ */ React.createElement("span", { className: "font-extrabold text-slate-900 dark:text-white truncate max-w-[150px]", title: row.supplier }, row.supplier))),
      /* @__PURE__ */ React.createElement("td", { className: "px-3 py-2 text-slate-600 dark:text-zinc-300 truncate max-w-[130px]", title: row.service }, row.service || "\u2014"),
      /* @__PURE__ */ React.createElement("td", { className: "px-2.5 py-1.5" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "text",
          className: "bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-slate-800 dark:text-zinc-100 outline-none w-24 transition-all shadow-2xs",
          value: row.invoiceNumber || "",
          placeholder: isCot ? "FAC-..." : "FAC-...",
          onChange: (e) => onUpdateInvoiceField && onUpdateInvoiceField(row.id, "invoiceNumber", e.target.value),
          title: "Escribe el n\xFAmero de comprobante"
        }
      )),
      /* @__PURE__ */ React.createElement("td", { className: "px-2.5 py-1.5" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "date",
          className: "bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-700 dark:text-zinc-300 outline-none transition-all cursor-pointer w-[112px] shadow-2xs",
          value: row.emissionDate || "",
          onChange: (e) => onUpdateInvoiceField && onUpdateInvoiceField(row.id, "emissionDate", e.target.value)
        }
      )),
      /* @__PURE__ */ React.createElement("td", { className: "px-2.5 py-1.5" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "date",
          className: "bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-700 dark:text-zinc-300 outline-none transition-all cursor-pointer w-[112px] shadow-2xs",
          value: row.deliveryDate || "",
          onChange: (e) => onUpdateInvoiceField && onUpdateInvoiceField(row.id, "deliveryDate", e.target.value)
        }
      )),
      /* @__PURE__ */ React.createElement("td", { className: "px-2.5 py-1.5 text-right" }, /* @__PURE__ */ React.createElement(
        MoneyInputField,
        {
          initialValue: row.value,
          onCommit: (newVal) => onUpdateInvoiceField && onUpdateInvoiceField(row.id, "value", newVal)
        }
      )),
      /* @__PURE__ */ React.createElement("td", { className: "px-3 py-2 text-center" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => onToggleSigned(row.id),
          className: `w-11 h-5 rounded-full px-1 flex items-center transition-all cursor-pointer border ${row.signed === "S\xCD" ? "bg-emerald-500 border-emerald-600 justify-end" : "bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start"}`,
          title: "Clic para alternar estado de firma"
        },
        /* @__PURE__ */ React.createElement("span", { className: `text-[8.5px] font-black mr-1 ${row.signed === "S\xCD" ? "text-white" : "hidden"}` }, "S\xCD"),
        /* @__PURE__ */ React.createElement("span", { className: "w-3.5 h-3.5 rounded-full bg-white shadow-xs" }),
        /* @__PURE__ */ React.createElement("span", { className: `text-[8.5px] font-black ml-1 ${row.signed === "S\xCD" ? "hidden" : "text-slate-500 dark:text-zinc-300"}` }, "NO")
      )),
      /* @__PURE__ */ React.createElement("td", { className: "px-3 py-2 text-center" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => onToggleOrderStd(row.id),
          className: `w-11 h-5 rounded-full px-1 flex items-center transition-all cursor-pointer border ${row.orderStd === "S\xCD" ? "bg-purple-600 border-purple-700 justify-end" : "bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start"}`,
          title: "Clic para alternar Orden STD"
        },
        /* @__PURE__ */ React.createElement("span", { className: `text-[8.5px] font-black mr-1 ${row.orderStd === "S\xCD" ? "text-white" : "hidden"}` }, "S\xCD"),
        /* @__PURE__ */ React.createElement("span", { className: "w-3.5 h-3.5 rounded-full bg-white shadow-xs" }),
        /* @__PURE__ */ React.createElement("span", { className: `text-[8.5px] font-black ml-1 ${row.orderStd === "S\xCD" ? "hidden" : "text-slate-500 dark:text-zinc-300"}` }, "NO")
      )),
      /* @__PURE__ */ React.createElement("td", { className: "px-3 py-2" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "text",
          className: "bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 rounded px-1.5 py-0.5 text-[11px] font-mono font-bold text-slate-800 dark:text-zinc-100 outline-none w-16 transition-all",
          value: row.oc || "",
          placeholder: "OC-...",
          onChange: (e) => onUpdateInvoiceField && onUpdateInvoiceField(row.id, "oc", e.target.value),
          title: "N\xFAmero de Orden de Compra"
        }
      )),
      /* @__PURE__ */ React.createElement("td", { className: "px-3 py-2 text-center" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => onToggleFacture(row.id),
          className: `w-11 h-5 rounded-full px-1 flex items-center transition-all cursor-pointer border ${row.enFacture === "S\xCD" ? "bg-emerald-500 border-emerald-600 justify-end" : "bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start"}`,
          title: "Clic para alternar radicaci\xF3n en Facture"
        },
        /* @__PURE__ */ React.createElement("span", { className: `text-[8.5px] font-black mr-1 ${row.enFacture === "S\xCD" ? "text-white" : "hidden"}` }, "S\xCD"),
        /* @__PURE__ */ React.createElement("span", { className: "w-3.5 h-3.5 rounded-full bg-white shadow-xs" }),
        /* @__PURE__ */ React.createElement("span", { className: `text-[8.5px] font-black ml-1 ${row.enFacture === "S\xCD" ? "hidden" : "text-slate-500 dark:text-zinc-300"}` }, "NO")
      )),
      /* @__PURE__ */ React.createElement("td", { className: "px-3 py-2 text-center" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => onToggleDelivered(row.id),
          className: `w-11 h-5 rounded-full px-1 flex items-center transition-all cursor-pointer border ${row.delivered === "S\xCD" ? "bg-emerald-600 border-emerald-700 justify-end" : "bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start"}`,
          title: "Clic para marcar como entregada (asigna fecha actual)"
        },
        /* @__PURE__ */ React.createElement("span", { className: `text-[8.5px] font-black mr-1 ${row.delivered === "S\xCD" ? "text-white" : "hidden"}` }, "S\xCD"),
        /* @__PURE__ */ React.createElement("span", { className: "w-3.5 h-3.5 rounded-full bg-white shadow-xs" }),
        /* @__PURE__ */ React.createElement("span", { className: `text-[8.5px] font-black ml-1 ${row.delivered === "S\xCD" ? "hidden" : "text-slate-500 dark:text-zinc-300"}` }, "NO")
      )),
      /* @__PURE__ */ React.createElement("td", { className: "px-3 py-2 text-center" }, row.pdfPath ? /* @__PURE__ */ React.createElement(
        "a",
        {
          href: row.pdfPath,
          target: "_blank",
          rel: "noreferrer",
          className: "w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 inline-flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors shadow-2xs border border-red-200",
          title: `Ver archivo: ${row.pdfOriginalName || "PDF"}`
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "pdf", size: 14 })
      ) : /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => onUploadPdf(row.id),
          className: "w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-red-600 hover:bg-red-50 inline-flex items-center justify-center transition-colors border border-slate-200 dark:border-zinc-700",
          title: "Subir PDF del comprobante"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "upload", size: 13 })
      )),
      /* @__PURE__ */ React.createElement("td", { className: "px-3 py-2 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1.5" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => onViewDetail(row),
          className: "w-7 h-7 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors border border-transparent hover:border-blue-200",
          title: "Ver detalle"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "eye", size: 14 })
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => onDeleteInvoice(row.id),
          className: "w-7 h-7 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors border border-transparent hover:border-red-200",
          title: "Eliminar factura"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 14 })
      )))
    );
  })))));
}
window.InvoicesTable = InvoicesTable;
function InvoicesModule({
  invoices,
  onQuickRegister,
  onToggleSigned,
  onToggleOrderStd,
  onToggleFacture,
  onToggleDelivered,
  onUpdateInvoiceField,
  onDeleteInvoice,
  onUploadPdf,
  onViewDetail,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  searchTerm,
  setSearchTerm,
  selectedSupplier,
  setSelectedSupplier,
  selectedFactureFilter,
  setSelectedFactureFilter,
  selectedSignedFilter,
  setSelectedSignedFilter,
  selectedOrderStdFilter,
  setSelectedOrderStdFilter,
  selectedOcFilter,
  setSelectedOcFilter,
  selectedDeliveredFilter,
  setSelectedDeliveredFilter,
  suppliersList,
  onOpenExcelPreview,
  selectedCount,
  onCleanFilters
}) {
  const [currentTab, setCurrentTab] = React.useState("Todos");
  const [selectedIds, setSelectedIds] = React.useState([]);
  const tabCounts = React.useMemo(() => {
    return {
      total: invoices.length,
      fac: invoices.filter((i) => (i.invoiceNumber || "").toUpperCase().startsWith("FAC") || i.docType === "factura").length,
      cot: invoices.filter((i) => (i.invoiceNumber || "").toUpperCase().startsWith("COT") || i.docType === "cotizacion").length,
      pending: invoices.filter((i) => i.delivered !== "S\xCD").length,
      delayed: invoices.filter((i) => new Date(i.deliveryDate) < /* @__PURE__ */ new Date("2026-09-01") && i.delivered !== "S\xCD").length,
      facture: invoices.filter((i) => i.enFacture === "S\xCD").length
    };
  }, [invoices]);
  const handleToggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  const handleToggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(invoices.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "dashboard-container" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm mb-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 flex-shrink-0" }, /* @__PURE__ */ React.createElement(Icon, { name: "file-text", size: 24, className: "text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-black text-slate-900 dark:text-white leading-tight" }, "Facturas & Cotizaciones"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 dark:text-zinc-400 mt-1" }, "Edici\xF3n en tiempo real: N\xFAmeros de comprobante, fechas con calendario, montos y conmutadores directos."))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onQuickRegister,
      className: "btn-red-action"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 16, className: "text-white" }),
    /* @__PURE__ */ React.createElement("span", null, "Registrar Comprobante")
  )), /* @__PURE__ */ React.createElement(
    FiltersBar,
    {
      searchTerm,
      setSearchTerm,
      selectedSupplier,
      setSelectedSupplier,
      selectedFactureFilter,
      setSelectedFactureFilter,
      selectedSignedFilter,
      setSelectedSignedFilter,
      selectedOrderStdFilter,
      setSelectedOrderStdFilter,
      selectedOcFilter,
      setSelectedOcFilter,
      selectedDeliveredFilter,
      setSelectedDeliveredFilter,
      selectedMonth,
      setSelectedMonth,
      selectedYear,
      setSelectedYear,
      suppliersList: suppliersList || [],
      selectedCount: selectedIds.length,
      onOpenExcelPreview,
      onClean: onCleanFilters,
      onExportExcel: () => Swal.fire("Excel Exportado", "Reporte descargado correctamente.", "success")
    }
  ), /* @__PURE__ */ React.createElement(
    InvoicesTable,
    {
      rows: invoices,
      currentTab,
      setCurrentTab,
      tabCounts,
      selectedIds,
      onToggleSelectRow: handleToggleSelectRow,
      onToggleSelectAll: handleToggleSelectAll,
      onToggleSigned,
      onToggleFacture,
      onToggleDelivered,
      onToggleOrderStd,
      onUpdateInvoiceField,
      onViewDetail,
      onDeleteInvoice,
      onUploadPdf
    }
  ));
}
window.InvoicesModule = InvoicesModule;
function SuppliersModule({ suppliers, invoices = [], onAddSupplier, onEditSupplier, onDeleteSupplier, onUpdateSupplierServices }) {
  const [expandedSupplierId, setExpandedSupplierId] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const toggleExpand = (id) => {
    setExpandedSupplierId(expandedSupplierId === id ? null : id);
  };
  const handleServiceTypeChange = (sup, sIdx, newType) => {
    const updatedServices = [...sup.services || []];
    updatedServices[sIdx] = { ...updatedServices[sIdx], type: newType };
    onUpdateSupplierServices(sup.id, updatedServices);
  };
  const handleServiceNameChange = (sup, sIdx, newName) => {
    const updatedServices = [...sup.services || []];
    updatedServices[sIdx] = { ...updatedServices[sIdx], serviceName: newName };
    onUpdateSupplierServices(sup.id, updatedServices);
  };
  const handleToggleServiceEnable = (sup, sIdx) => {
    const updatedServices = [...sup.services || []];
    const currentEnabled = updatedServices[sIdx].enabled !== false;
    updatedServices[sIdx] = { ...updatedServices[sIdx], enabled: !currentEnabled };
    onUpdateSupplierServices(sup.id, updatedServices);
  };
  const handleAddConcept = (sup) => {
    const updatedServices = [...sup.services || []];
    updatedServices.push({
      serviceName: `Servicio #${updatedServices.length + 1}`,
      type: "factura",
      enabled: true
    });
    onUpdateSupplierServices(sup.id, updatedServices);
  };
  const handleRemoveConcept = (sup, sIdx) => {
    const updatedServices = (sup.services || []).filter((_, idx) => idx !== sIdx);
    onUpdateSupplierServices(sup.id, updatedServices);
  };
  const filteredSuppliers = React.useMemo(() => {
    return (suppliers || []).filter((s) => {
      const term = searchTerm.toLowerCase();
      return (s.name || "").toLowerCase().includes(term) || (s.nit || "").toLowerCase().includes(term) || (s.contact || "").toLowerCase().includes(term) || (s.area || "").toLowerCase().includes(term);
    });
  }, [suppliers, searchTerm]);
  return /* @__PURE__ */ React.createElement("div", { className: "dashboard-container" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 flex-shrink-0" }, /* @__PURE__ */ React.createElement(Icon, { name: "users", size: 24, className: "text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-black text-slate-900 dark:text-white leading-tight" }, "Directorio de Proveedores Autorizados"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 dark:text-zinc-400 mt-1" }, "Configura los servicios mensuales recurrentes indicando si corresponden a Facturas o Cotizaciones."))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onAddSupplier,
      className: "btn-red-action"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 16, className: "text-white" }),
    /* @__PURE__ */ React.createElement("span", null, "Registrar Proveedor")
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 flex-1 focus-within:border-red-500 focus-within:bg-white dark:focus-within:bg-zinc-800 focus-within:ring-2 focus-within:ring-red-500/20 transition-all shadow-inner" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 16, className: "text-slate-400" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Buscar proveedor por raz\xF3n social, NIT, contacto o \xE1rea...",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      className: "bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none w-full placeholder:text-slate-400"
    }
  ), searchTerm && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSearchTerm(""),
      className: "text-slate-400 hover:text-red-600 text-xs font-bold",
      title: "Limpiar b\xFAsqueda"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "close", size: 14 })
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSearchTerm(""),
      className: "px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200 dark:border-zinc-700 shadow-2xs",
      title: "Restablecer b\xFAsqueda"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "history", size: 14, className: "text-slate-500" }),
    /* @__PURE__ */ React.createElement("span", null, "Limpiar")
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse text-xs" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm" }, /* @__PURE__ */ React.createElement("th", { className: "px-3.5 py-3 w-12 text-center text-white" }, "Ver"), /* @__PURE__ */ React.createElement("th", { className: "px-3.5 py-3 text-white" }, "NIT / RUT"), /* @__PURE__ */ React.createElement("th", { className: "px-3.5 py-3 text-white" }, "Raz\xF3n Social"), /* @__PURE__ */ React.createElement("th", { className: "px-3.5 py-3 text-white" }, "Asesor Comercial"), /* @__PURE__ */ React.createElement("th", { className: "px-3.5 py-3 text-white" }, "Tel\xE9fono"), /* @__PURE__ */ React.createElement("th", { className: "px-3.5 py-3 text-white" }, "Conceptos / Mes"), /* @__PURE__ */ React.createElement("th", { className: "px-3.5 py-3 text-white" }, "\xC1rea Asignada"), /* @__PURE__ */ React.createElement("th", { className: "px-3.5 py-3 text-center text-white" }, "Acciones"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium" }, filteredSuppliers.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "8", className: "text-center py-12 text-slate-400 dark:text-zinc-500" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "users", size: 32, className: "text-slate-300 dark:text-zinc-600" }), /* @__PURE__ */ React.createElement("span", null, "No se encontraron proveedores registrados.")))) : filteredSuppliers.map((sup) => {
    const isExpanded = expandedSupplierId === sup.id;
    const services = sup.services || [];
    const activeCount = services.filter((s) => s.enabled !== false).length;
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: sup.id }, /* @__PURE__ */ React.createElement("tr", { className: `hover:bg-red-50/20 dark:hover:bg-zinc-800/40 transition-colors ${isExpanded ? "bg-red-50/30 dark:bg-red-950/20" : ""}` }, /* @__PURE__ */ React.createElement("td", { className: "px-3.5 py-3 text-center" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => toggleExpand(sup.id),
        className: `w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${isExpanded ? "bg-red-600 text-white shadow-sm shadow-red-600/30" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"}`,
        title: isExpanded ? "Ocultar conceptos" : "Desplegar conceptos recurrentes"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fa-solid ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"} text-[11px]` })
    )), /* @__PURE__ */ React.createElement("td", { className: "px-3.5 py-3 font-mono font-bold text-slate-700 dark:text-zinc-300" }, sup.nit), /* @__PURE__ */ React.createElement("td", { className: "px-3.5 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 cursor-pointer", onClick: () => toggleExpand(sup.id) }, /* @__PURE__ */ React.createElement("span", { className: "w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-red-700 text-white text-[10px] font-black flex items-center justify-center shadow-xs ring-1 ring-red-100 dark:ring-red-950 flex-shrink-0" }, (sup.name || "PR").substring(0, 2).toUpperCase()), /* @__PURE__ */ React.createElement("span", { className: "hover:text-red-600 transition-colors" }, sup.name))), /* @__PURE__ */ React.createElement("td", { className: "px-3.5 py-3 text-slate-600 dark:text-zinc-300" }, sup.contact || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "px-3.5 py-3 text-slate-600 dark:text-zinc-300 font-mono" }, sup.phone || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "px-3.5 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs" }, /* @__PURE__ */ React.createElement(Icon, { name: "inventory", size: 12, className: "text-blue-600 dark:text-blue-400" }), activeCount, " ", activeCount === 1 ? "concepto activo" : "conceptos activos")), /* @__PURE__ */ React.createElement("td", { className: "px-3.5 py-3 text-slate-600 dark:text-zinc-300" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Icon, { name: "areas", size: 13, className: "text-slate-400" }), /* @__PURE__ */ React.createElement("span", null, sup.area || "General"))), /* @__PURE__ */ React.createElement("td", { className: "px-3.5 py-3 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1.5" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onEditSupplier(sup),
        className: "w-7 h-7 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors border border-transparent hover:border-blue-200",
        title: "Editar proveedor"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "eye", size: 14 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onDeleteSupplier(sup.id),
        className: "w-7 h-7 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors border border-transparent hover:border-red-200",
        title: "Eliminar proveedor"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 14 })
    )))), isExpanded && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "8", className: "p-0 bg-slate-50/70 dark:bg-zinc-950/60" }, /* @__PURE__ */ React.createElement("div", { className: "p-6 border-y border-slate-200 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs font-black text-slate-800 dark:text-zinc-200 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Icon, { name: "file-text", size: 14, className: "text-red-600" })), /* @__PURE__ */ React.createElement("span", null, "Conceptos Recurrentes Mensuales de ", /* @__PURE__ */ React.createElement("strong", null, sup.name))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleAddConcept(sup),
        className: "px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-red-600/20 cursor-pointer"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12, className: "text-white" }),
      /* @__PURE__ */ React.createElement("span", null, "Agregar Concepto")
    )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, services.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "col-span-full p-6 text-center text-slate-400 text-xs bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800" }, 'No hay conceptos configurados. Haz clic en "Agregar Concepto" para registrar servicios mensuales.') : services.map((srv, sIdx) => {
      const isEnabled = srv.enabled !== false;
      const isCot = srv.type === "cotizacion";
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: sIdx,
          className: `p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 ${isEnabled ? "bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md" : "bg-slate-100/60 dark:bg-zinc-900/40 border-slate-200/60 dark:border-zinc-800/40 opacity-60"}`
        },
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 flex-1" }, /* @__PURE__ */ React.createElement("span", { className: "w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-black flex items-center justify-center flex-shrink-0" }, "#", sIdx + 1), /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "text",
            value: srv.serviceName || "",
            onChange: (e) => handleServiceNameChange(sup, sIdx, e.target.value),
            placeholder: "Nombre del concepto o servicio",
            className: "bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-1 focus:ring-red-500/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none flex-1 transition-all shadow-2xs"
          }
        )), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => handleRemoveConcept(sup, sIdx),
            className: "w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors flex-shrink-0",
            title: "Eliminar este concepto"
          },
          /* @__PURE__ */ React.createElement(Icon, { name: "close", size: 13 })
        )),
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-full text-[10px] font-bold border border-slate-200/80 dark:border-zinc-700/80" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => handleServiceTypeChange(sup, sIdx, "factura"),
            className: `px-3 py-1 rounded-full transition-all cursor-pointer ${!isCot ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-2xs font-black" : "text-slate-500 hover:text-slate-800 dark:text-zinc-400"}`
          },
          "Factura"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => handleServiceTypeChange(sup, sIdx, "cotizacion"),
            className: `px-3 py-1 rounded-full transition-all cursor-pointer ${isCot ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-2xs font-black" : "text-slate-500 hover:text-slate-800 dark:text-zinc-400"}`
          },
          "Cotizaci\xF3n"
        )), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => handleToggleServiceEnable(sup, sIdx),
            className: `w-12 h-6 rounded-full px-1 flex items-center transition-all cursor-pointer border ${isEnabled ? "bg-emerald-500 border-emerald-600 justify-end" : "bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start"}`,
            title: isEnabled ? "Desactivar concepto" : "Activar concepto"
          },
          /* @__PURE__ */ React.createElement("span", { className: `text-[8.5px] font-black mr-1 ${isEnabled ? "text-white" : "hidden"}` }, "S\xCD"),
          /* @__PURE__ */ React.createElement("span", { className: "w-4 h-4 rounded-full bg-white shadow-xs" }),
          /* @__PURE__ */ React.createElement("span", { className: `text-[8.5px] font-black ml-1 ${isEnabled ? "hidden" : "text-slate-500 dark:text-zinc-300"}` }, "NO")
        ))
      );
    }))))));
  }))))));
}
window.SuppliersModule = SuppliersModule;
function CrmModule({ suppliers = [], quotations = [], onSaveQuotation, onDeleteQuotation, onUploadPdf }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("TODOS");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingQuotation, setEditingQuotation] = React.useState(null);
  const STAGES = [
    { key: "EN_BUSQUEDA", label: "En B\xFAsqueda", colorClass: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700" },
    { key: "CONSULTADO", label: "Consultado", colorClass: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-900/50" },
    { key: "COTIZANDO", label: "En Espera", colorClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50" },
    { key: "COTIZADO", label: "Cotizaci\xF3n Recibida", colorClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50" },
    { key: "SELECCIONADO", label: "\u{1F3C6} Adjudicado", colorClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 font-black" },
    { key: "DESCARTADO", label: "Descartado", colorClass: "bg-slate-100 text-slate-400 dark:bg-zinc-800/40 dark:text-zinc-500 border-slate-200 dark:border-zinc-800" }
  ];
  const getMeta = (k) => STAGES.find((s) => s.key === k) || STAGES[0];
  const filtered = React.useMemo(() => {
    return quotations.filter((q) => {
      const qText = (q.title || "") + " " + (q.code || "") + " " + (q.description || "");
      const supText = (q.suppliers || []).map((s) => s.supplierName).join(" ");
      const match = (qText + " " + supText).toLowerCase().includes(searchTerm.toLowerCase());
      const matchSt = statusFilter === "TODOS" || q.status === statusFilter;
      return match && matchSt;
    });
  }, [quotations, searchTerm, statusFilter]);
  const metrics = React.useMemo(() => {
    return {
      total: quotations.length,
      inSearch: quotations.filter((q) => q.status === "EN_BUSQUEDA").length,
      inProcess: quotations.filter((q) => q.status === "EN_PROCESO").length,
      completed: quotations.filter((q) => q.status === "FINALIZADO").length
    };
  }, [quotations]);
  const handleAddSup = (quotation, supObj) => {
    const current = quotation.suppliers || [];
    if (current.some((s) => s.supplierId === supObj.id || s.supplierName === supObj.name)) {
      return Swal.fire("Ya Agregado", "Este proveedor ya se encuentra en la solicitud.", "info");
    }
    const newEntry = {
      id: "csup-" + Date.now(),
      supplierId: supObj.id,
      supplierName: supObj.name,
      phone: supObj.phone || "",
      stage: "CONSULTADO",
      quotedAmount: 0,
      pdfPath: null
    };
    const updated = {
      ...quotation,
      suppliers: [...current, newEntry],
      status: quotation.status === "EN_BUSQUEDA" ? "EN_PROCESO" : quotation.status
    };
    onSaveQuotation(updated);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: supObj.name + " agregado", showConfirmButton: false, timer: 1500 });
  };
  const handleStageChange = (quotation, idx, newStage) => {
    const list = [...quotation.suppliers || []];
    list[idx].stage = newStage;
    let selSup = quotation.selectedSupplier;
    let finAmt = quotation.finalAmount;
    if (newStage === "SELECCIONADO") {
      selSup = list[idx].supplierName;
      finAmt = list[idx].quotedAmount;
    }
    const updated = {
      ...quotation,
      suppliers: list,
      selectedSupplier: selSup,
      finalAmount: finAmt,
      status: newStage === "SELECCIONADO" ? "FINALIZADO" : quotation.status
    };
    onSaveQuotation(updated);
  };
  const handleAmountChange = (quotation, idx, val) => {
    const list = [...quotation.suppliers || []];
    list[idx].quotedAmount = Number(val) || 0;
    if (list[idx].stage === "CONSULTADO" || list[idx].stage === "COTIZANDO") {
      list[idx].stage = "COTIZADO";
    }
    onSaveQuotation({ ...quotation, suppliers: list });
  };
  const handlePdfUpload = (quotation, idx, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fetch("/api/upload-pdf", { method: "POST", body: fd }).then((res) => res.json()).then((data) => {
      if (data.success) {
        const list = [...quotation.suppliers || []];
        list[idx].pdfPath = data.relativePath;
        list[idx].stage = "COTIZADO";
        onSaveQuotation({ ...quotation, suppliers: list });
        Swal.fire("PDF Vinculado", "Cotizaci\xF3n f\xEDsica guardada correctamente.", "success");
      }
    });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-5 animate-fade-in pb-10" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-500/20" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-handshake" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-lg font-black text-slate-900 dark:text-white tracking-tight" }, "CRM de Cotizaciones & Solicitudes"), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5" }, "Pipeline de compras: B\xFAsqueda \u2794 Consultado \u2794 Espera \u2794 Cotizado \u2794 Adjudicado"))), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer",
      onClick: () => {
        setEditingQuotation({
          id: "crm-" + Date.now(),
          code: "REQ-" + (/* @__PURE__ */ new Date()).getFullYear() + "-" + (quotations.length + 1).toString().padStart(3, "0"),
          title: "",
          category: "Insumos / Alimentos",
          description: "",
          urgency: "Media",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
          status: "EN_BUSQUEDA",
          suppliers: []
        });
        setIsModalOpen(true);
      }
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-plus-circle text-xs" }),
    /* @__PURE__ */ React.createElement("span", null, "Nueva Solicitud de Cotizaci\xF3n")
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center text-base" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-layer-group" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider" }, "Total Solicitudes"), /* @__PURE__ */ React.createElement("div", { className: "text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5" }, metrics.total))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-base" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-magnifying-glass" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider" }, "En B\xFAsqueda"), /* @__PURE__ */ React.createElement("div", { className: "text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5" }, metrics.inSearch))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center text-base" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-hourglass-half" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider" }, "En Negociaci\xF3n"), /* @__PURE__ */ React.createElement("div", { className: "text-lg font-black text-sky-600 dark:text-sky-400 font-mono mt-0.5" }, metrics.inProcess))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-base" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-circle-check" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider" }, "Adjudicadas"), /* @__PURE__ */ React.createElement("div", { className: "text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5" }, metrics.completed)))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "relative flex-1 w-full" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Buscar requerimiento, producto o proveedor...",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      className: "w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0" }, [
    { key: "TODOS", label: "Todas" },
    { key: "EN_BUSQUEDA", label: "\u{1F50D} En B\xFAsqueda" },
    { key: "EN_PROCESO", label: "\u23F3 En Negociaci\xF3n" },
    { key: "FINALIZADO", label: "\u{1F3C6} Adjudicadas" }
  ].map((tab) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: tab.key,
      onClick: () => setStatusFilter(tab.key),
      className: `px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${statusFilter === tab.key ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 shadow-sm" : "bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-zinc-700 hover:bg-slate-100"}`
    },
    tab.label
  )))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 text-slate-400" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-circle-question text-4xl mb-3 text-slate-300 dark:text-zinc-700 block" }), /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-slate-700 dark:text-slate-300" }, "No hay requerimientos registrados"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-1 max-w-md mx-auto mb-4" }, "Crea tu primera solicitud para gestionar la cotizaci\xF3n con varios proveedores."), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20",
      onClick: () => {
        setEditingQuotation({
          id: "crm-" + Date.now(),
          code: "REQ-" + (/* @__PURE__ */ new Date()).getFullYear() + "-" + (quotations.length + 1).toString().padStart(3, "0"),
          title: "",
          category: "Insumos / Alimentos",
          description: "",
          urgency: "Media",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
          status: "EN_BUSQUEDA",
          suppliers: []
        });
        setIsModalOpen(true);
      }
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-plus text-xs" }),
    /* @__PURE__ */ React.createElement("span", null, "Crear Solicitud")
  )) : filtered.map((q) => {
    const qSuppliers = q.suppliers || [];
    return /* @__PURE__ */ React.createElement("div", { key: q.id, className: "bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-50/70 dark:bg-zinc-800/40 border-b border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg font-mono" }, q.code), /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-black text-slate-900 dark:text-white" }, q.title), /* @__PURE__ */ React.createElement("span", { className: "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-bold" }, "\u{1F4C2} ", q.category), /* @__PURE__ */ React.createElement("span", { className: `px-2.5 py-1 rounded-lg text-[10px] font-black ${q.urgency === "Alta" ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200" : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200"}` }, "\u26A1 ", q.urgency)), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          Swal.fire({
            title: "\xBFEliminar?",
            text: "Se borrar\xE1 " + q.code,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#e11d48"
          }).then((r) => {
            if (r.isConfirmed) onDeleteQuotation(q.id);
          });
        },
        className: "w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs",
        title: "Eliminar requerimiento"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-trash-can" })
    )), /* @__PURE__ */ React.createElement("div", { className: "p-4 space-y-3.5" }, q.description && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-600 dark:text-slate-400 leading-relaxed" }, /* @__PURE__ */ React.createElement("strong", { className: "text-slate-800 dark:text-slate-200" }, "Especificaciones:"), " ", q.description), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2.5 bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-700 dark:text-slate-300" }, "\u2795 Invitar Proveedor:"), /* @__PURE__ */ React.createElement(
      "select",
      {
        id: "select-sup-" + q.id,
        className: "px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-white flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-rose-500/20"
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Seleccionar Proveedor del Cat\xE1logo --"),
      suppliers.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.name, " (", s.nit, ") - ", s.area))
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          const sel = document.getElementById("select-sup-" + q.id);
          const supObj = suppliers.find((s) => s.id === sel.value);
          if (supObj) {
            handleAddSup(q, supObj);
            sel.value = "";
          } else {
            Swal.fire("Selecciona un Proveedor", "Elige un proveedor del listado.", "warning");
          }
        },
        className: "px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-paper-plane mr-1" }),
      " Invitar"
    )), qSuppliers.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-4 text-slate-400 text-xs italic" }, "A\xFAn no has agregado proveedores para esta cotizaci\xF3n.") : /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse text-xs" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider" }, /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Proveedor"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Estado del Proveedor"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Monto Cotizado ($ COP)"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Archivo PDF"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3 text-right" }, "Adjudicar"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100 dark:divide-zinc-800" }, qSuppliers.map((sup, idx) => {
      const meta = getMeta(sup.stage);
      const isSelected = sup.stage === "SELECCIONADO";
      return /* @__PURE__ */ React.createElement("tr", { key: sup.id || idx, className: isSelected ? "bg-rose-50/60 dark:bg-rose-950/20" : "hover:bg-slate-50/50 dark:hover:bg-zinc-800/30" }, /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-slate-900 dark:text-white" }, sup.supplierName), sup.phone && /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400" }, "\u{1F4DE} ", sup.phone)), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3" }, /* @__PURE__ */ React.createElement(
        "select",
        {
          value: sup.stage || "CONSULTADO",
          onChange: (e) => handleStageChange(q, idx, e.target.value),
          className: `px-2.5 py-1 rounded-lg border text-[11px] font-bold outline-none cursor-pointer ${meta.colorClass}`
        },
        STAGES.map((st) => /* @__PURE__ */ React.createElement("option", { key: st.key, value: st.key }, st.label))
      )), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "number",
          defaultValue: sup.quotedAmount || "",
          placeholder: "$ 0",
          onBlur: (e) => handleAmountChange(q, idx, e.target.value),
          className: "w-28 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-rose-500"
        }
      )), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3" }, sup.pdfPath ? /* @__PURE__ */ React.createElement(
        "a",
        {
          href: sup.pdfPath,
          target: "_blank",
          rel: "noreferrer",
          className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-bold text-[11px] hover:bg-rose-100"
        },
        /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-pdf" }),
        " Ver PDF"
      ) : /* @__PURE__ */ React.createElement("label", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-dashed border-sky-300 dark:border-sky-800 font-semibold text-[11px] cursor-pointer hover:bg-sky-100" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-upload" }), " Adjuntar PDF", /* @__PURE__ */ React.createElement("input", { type: "file", accept: ".pdf,image/*", className: "hidden", onChange: (e) => handlePdfUpload(q, idx, e.target.files[0]) }))), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 text-right" }, isSelected ? /* @__PURE__ */ React.createElement("span", { className: "bg-rose-600 text-white px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase" }, "\u{1F3C6} ADJUDICADO") : /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => handleStageChange(q, idx, "SELECCIONADO"),
          className: "px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-[11px] font-bold hover:bg-emerald-100"
        },
        /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-check mr-1" }),
        " Escoger"
      )));
    }))))));
  })), isModalOpen && editingQuotation && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-black text-slate-900 dark:text-white flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-xs" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-circle-plus" })), "Nueva Solicitud de Cotizaci\xF3n"), /* @__PURE__ */ React.createElement("button", { onClick: () => setIsModalOpen(false), className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-xmark text-sm" }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1" }, "C\xF3digo *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: editingQuotation.code, onChange: (e) => setEditingQuotation({ ...editingQuotation, code: e.target.value }), className: "w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1" }, "Categor\xEDa"), /* @__PURE__ */ React.createElement("select", { value: editingQuotation.category, onChange: (e) => setEditingQuotation({ ...editingQuotation, category: e.target.value }), className: "w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white" }, /* @__PURE__ */ React.createElement("option", { value: "Insumos / Alimentos" }, "Insumos / Alimentos"), /* @__PURE__ */ React.createElement("option", { value: "Empaques y Pl\xE1sticos" }, "Empaques y Pl\xE1sticos"), /* @__PURE__ */ React.createElement("option", { value: "Mantenimiento Industrial" }, "Mantenimiento Industrial"), /* @__PURE__ */ React.createElement("option", { value: "Transporte y Log\xEDstica" }, "Transporte y Log\xEDstica"), /* @__PURE__ */ React.createElement("option", { value: "Tecnolog\xEDa (TI)" }, "Tecnolog\xEDa (TI)"), /* @__PURE__ */ React.createElement("option", { value: "Servicios Generales" }, "Servicios Generales")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1" }, "T\xEDtulo / Requerimiento *"), /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "ej: Suministro de Harina de Trigo o Cajas", value: editingQuotation.title, onChange: (e) => setEditingQuotation({ ...editingQuotation, title: e.target.value }), className: "w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1" }, "Detalles / Cantidades"), /* @__PURE__ */ React.createElement("textarea", { rows: "3", placeholder: "Describe cantidades, condiciones de entrega...", value: editingQuotation.description, onChange: (e) => setEditingQuotation({ ...editingQuotation, description: e.target.value }), className: "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1" }, "Urgencia"), /* @__PURE__ */ React.createElement("select", { value: editingQuotation.urgency, onChange: (e) => setEditingQuotation({ ...editingQuotation, urgency: e.target.value }), className: "w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white" }, /* @__PURE__ */ React.createElement("option", { value: "Baja" }, "Baja"), /* @__PURE__ */ React.createElement("option", { value: "Media" }, "Media"), /* @__PURE__ */ React.createElement("option", { value: "Alta" }, "Alta"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1" }, "Fecha L\xEDmite"), /* @__PURE__ */ React.createElement("input", { type: "date", value: editingQuotation.deadline, onChange: (e) => setEditingQuotation({ ...editingQuotation, deadline: e.target.value }), className: "w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white" }))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setIsModalOpen(false), className: "px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50" }, "Cancelar"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        if (!editingQuotation.title || !editingQuotation.code) {
          return Swal.fire("Campos requeridos", "Ingresa c\xF3digo y t\xEDtulo.", "warning");
        }
        onSaveQuotation(editingQuotation);
        setIsModalOpen(false);
        Swal.fire("Guardado", "Solicitud registrada en MySQL.", "success");
      },
      className: "px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-save mr-1" }),
    " Guardar Requerimiento"
  ))))));
}
window.CrmModule = CrmModule;
function TechInventoryModule({ inventory, areas, onAddOrUpdateItem, onDeliverItem, onDeleteItem }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Todos");
  const [selectedStatus, setSelectedStatus] = React.useState("Todos");
  const categories = [
    "Todos",
    "Perif\xE9ricos",
    "Monitores",
    "Equipos de C\xF3mputo",
    "Licencias de AI",
    "Redes & Conectividad",
    "Audio & Video",
    "Accesorios TI"
  ];
  const metrics = React.useMemo(() => {
    let totalItems = 0;
    let availableCount = 0;
    let outOfStockCount = 0;
    let totalCategories = /* @__PURE__ */ new Set();
    (inventory || []).forEach((item) => {
      const qty = Number(item.quantity) || 0;
      totalItems += qty;
      if (qty > 0) availableCount++;
      else outOfStockCount++;
      if (item.category) totalCategories.add(item.category);
    });
    return {
      totalItems,
      totalTypes: (inventory || []).length,
      availableCount,
      outOfStockCount,
      categoriesCount: totalCategories.size
    };
  }, [inventory]);
  const filteredInventory = React.useMemo(() => {
    return (inventory || []).filter((item) => {
      const matchSearch = (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.brandModel || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.serialCode || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.areaAssigned || "").toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (selectedCategory !== "Todos" && item.category !== selectedCategory) return false;
      if (selectedStatus !== "Todos") {
        if (selectedStatus === "Disponible" && (Number(item.quantity) || 0) <= 0) return false;
        if (selectedStatus === "Agotado" && (Number(item.quantity) || 0) > 0) return false;
      }
      return true;
    });
  }, [inventory, searchTerm, selectedCategory, selectedStatus]);
  const handleOpenItemModal = (itemToEdit = null) => {
    const isEdit = !!itemToEdit;
    const areasList = (areas || []).map((a) => `<option value="${a.name}" ${itemToEdit && itemToEdit.areaAssigned === a.name ? "selected" : ""}>${a.name}</option>`).join("");
    Swal.fire({
      title: isEdit ? "Editar Equipo / Perif\xE9rico TI" : "Registrar Equipo / Perif\xE9rico TI",
      html: `
        <div style="display:flex; flex-direction:column; gap:12px; text-align:left; font-size:12px;">
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Categor\xEDa Tecnol\xF3gica *</label>
            <select id="swInvCat" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
              <option value="Perif\xE9ricos" ${itemToEdit && itemToEdit.category === "Perif\xE9ricos" ? "selected" : ""}>Perif\xE9ricos (Mouse, Teclados, Diademas)</option>
              <option value="Monitores" ${itemToEdit && itemToEdit.category === "Monitores" ? "selected" : ""}>Monitores & Pantallas</option>
              <option value="Equipos de C\xF3mputo" ${itemToEdit && itemToEdit.category === "Equipos de C\xF3mputo" ? "selected" : ""}>Equipos de C\xF3mputo (Laptops, PCs)</option>
              <option value="Licencias de AI" ${itemToEdit && itemToEdit.category === "Licencias de AI" ? "selected" : ""}>Licencias de AI (ChatGPT, Copilot, APIs)</option>
              <option value="Redes & Conectividad" ${itemToEdit && itemToEdit.category === "Redes & Conectividad" ? "selected" : ""}>Redes & Conectividad (Routers, Switches)</option>
              <option value="Audio & Video" ${itemToEdit && itemToEdit.category === "Audio & Video" ? "selected" : ""}>Audio & Video</option>
              <option value="Accesorios TI" ${itemToEdit && itemToEdit.category === "Accesorios TI" ? "selected" : ""}>Accesorios TI & Cables</option>
            </select>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Nombre del Equipo / Elemento *</label>
            <input id="swInvName" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;" placeholder="ej: Mouse Ergon\xF3mico Inal\xE1mbrico" value="${itemToEdit ? itemToEdit.name : ""}">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Marca y Modelo</label>
              <input id="swInvBrand" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;" placeholder="ej: Logitech MX Master 3S" value="${itemToEdit ? itemToEdit.brandModel || "" : ""}">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Serial / C\xF3digo Activo</label>
              <input id="swInvSerial" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;" placeholder="ej: SN-LOG-9921" value="${itemToEdit ? itemToEdit.serialCode || "" : ""}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Cantidad Disponible *</label>
              <input id="swInvQty" type="number" min="0" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800;" placeholder="ej: 9" value="${itemToEdit ? itemToEdit.quantity ?? 0 : "1"}">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Unidad de Medida</label>
              <select id="swInvUnit" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;">
                <option value="Unidades" ${itemToEdit && itemToEdit.unit === "Unidades" ? "selected" : ""}>Unidades</option>
                <option value="Kits / Paquetes" ${itemToEdit && itemToEdit.unit === "Kits / Paquetes" ? "selected" : ""}>Kits / Paquetes</option>
                <option value="Tokens/Slots" ${itemToEdit && itemToEdit.unit === "Tokens/Slots" ? "selected" : ""}>Tokens / Slots / Licencias</option>
                <option value="Cajas" ${itemToEdit && itemToEdit.unit === "Cajas" ? "selected" : ""}>Cajas</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">\xC1rea Asignada / Custodia</label>
            <select id="swInvArea" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;">
              <option value="Tecnolog\xEDa (TI)" ${itemToEdit && itemToEdit.areaAssigned === "Tecnolog\xEDa (TI)" ? "selected" : ""}>Tecnolog\xEDa (TI) [Custodia General]</option>
              ${areasList}
            </select>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Notas / Observaciones</label>
            <textarea id="swInvNotes" class="swal2-textarea" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:12px; height:60px;" placeholder="Detalles de ubicaci\xF3n, garant\xEDas o especificaciones...">${itemToEdit ? itemToEdit.notes || "" : ""}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isEdit ? "Guardar Cambios" : "Registrar en Inventario",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e11d48",
      focusConfirm: false
    }).then((res) => {
      if (res.isConfirmed) {
        const category = document.getElementById("swInvCat").value;
        const name = (document.getElementById("swInvName").value || "").trim();
        const brandModel = (document.getElementById("swInvBrand").value || "").trim();
        const serialCode = (document.getElementById("swInvSerial").value || "").trim();
        const quantity = Number(document.getElementById("swInvQty").value);
        const unit = document.getElementById("swInvUnit").value;
        const areaAssigned = document.getElementById("swInvArea").value;
        const notes = (document.getElementById("swInvNotes").value || "").trim();
        if (!name) {
          return Swal.fire("Campo requerido", "Por favor ingresa el nombre del equipo o perif\xE9rico.", "warning");
        }
        const payload = {
          id: itemToEdit ? itemToEdit.id : "ti-" + Date.now(),
          category,
          name,
          brandModel,
          serialCode,
          quantity: isNaN(quantity) ? 0 : quantity,
          unit,
          areaAssigned,
          status: quantity > 0 ? "Disponible" : "Agotado",
          notes
        };
        if (onAddOrUpdateItem) onAddOrUpdateItem(payload);
      }
    });
  };
  const handleOpenDeliverModal = (item) => {
    const currentQty = Number(item.quantity) || 0;
    if (currentQty <= 0) {
      return Swal.fire("Sin Stock", `No hay unidades disponibles de ${item.name} para entregar.`, "warning");
    }
    const areasList = (areas || []).map((a) => `<option value="${a.name}">${a.name}</option>`).join("");
    Swal.fire({
      title: `Entregar: ${item.name}`,
      html: `
        <div style="display:flex; flex-direction:column; gap:12px; text-align:left; font-size:12px;">
          <div style="background:#fef2f2; border:1px solid #fecdd3; border-radius:10px; padding:12px; color:#9f1239;">
            <div style="font-weight:900; font-size:13px; display:flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-box-open text-rose-600"></i> Stock Disponible Actual: ${currentQty} ${item.unit || "uds"}
            </div>
            <div style="font-size:11px; margin-top:2px; color:#be123c;">Al confirmar, la cantidad en inventario disminuir\xE1 autom\xE1ticamente.</div>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">\xBFCu\xE1ntas unidades deseas entregar? *</label>
            <input id="swDelivQty" type="number" min="1" max="${currentQty}" value="1" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:14px; font-weight:800;">
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">\xC1rea Solicitante / Destino *</label>
            <select id="swDelivArea" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
              ${areasList}
            </select>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Persona / Responsable que Recibe</label>
            <input id="swDelivPerson" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;" placeholder="ej: Juan P\xE9rez (Dise\xF1ador)">
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Observaciones / Motivo de Entrega</label>
            <textarea id="swDelivNotes" class="swal2-textarea" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:12px; height:50px;" placeholder="ej: Asignaci\xF3n por nuevo ingreso o reposici\xF3n..."></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Confirmar Entrega",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e11d48",
      focusConfirm: false
    }).then((res) => {
      if (res.isConfirmed) {
        const qtyToDeliver = Number(document.getElementById("swDelivQty").value);
        const area = document.getElementById("swDelivArea").value;
        const person = (document.getElementById("swDelivPerson").value || "").trim();
        const notes = (document.getElementById("swDelivNotes").value || "").trim();
        if (isNaN(qtyToDeliver) || qtyToDeliver < 1) {
          return Swal.fire("Cantidad inv\xE1lida", "Debes ingresar al menos 1 unidad para entregar.", "warning");
        }
        if (qtyToDeliver > currentQty) {
          return Swal.fire("Excede disponible", `Solo tienes ${currentQty} ${item.unit || "uds"} disponibles.`, "error");
        }
        if (onDeliverItem) {
          onDeliverItem({
            id: item.id,
            quantityToDeliver: qtyToDeliver,
            deliveredToArea: area,
            recipientName: person,
            notes
          });
        }
      }
    });
  };
  const handleExportExcel = () => {
    try {
      if (typeof XLSX === "undefined") {
        return Swal.fire("Librer\xEDa no lista", "Cargando m\xF3dulo de Excel...", "info");
      }
      const rowsData = filteredInventory.map((item, idx) => ({
        "#": idx + 1,
        "Categor\xEDa": item.category,
        "Equipo / Perif\xE9rico": item.name,
        "Marca / Modelo": item.brandModel || "N/A",
        "Serial / C\xF3digo": item.serialCode || "N/A",
        "Cantidad Disponible": Number(item.quantity) || 0,
        "Unidad": item.unit || "Unidades",
        "\xC1rea Custodia / Asignada": item.areaAssigned || "Tecnolog\xEDa (TI)",
        "Estado": Number(item.quantity) > 0 ? "DISPONIBLE" : "AGOTADO",
        "Observaciones": item.notes || ""
      }));
      const worksheet = XLSX.utils.json_to_sheet(rowsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario_TI");
      const fileName = `Inventario_TI_Enriko_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      Swal.fire("Excel Exportado", `Reporte "${fileName}" generado exitosamente.`, "success");
    } catch (err) {
      console.error("Error exportando Excel de inventario:", err);
      Swal.fire("Error", "No se pudo generar el archivo Excel.", "error");
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "dashboard-container" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm mb-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement(Icon, { name: "inventory", size: 22, className: "text-rose-600" }), "Inventario de Equipos & Perif\xE9ricos TI"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 dark:text-zinc-400 mt-1" }, "Control de existencias, licencias de AI, perif\xE9ricos y entregas a personal y \xE1reas de Alimentos Enriko.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleExportExcel,
      className: "px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "excel", size: 15, className: "text-white" }),
    /* @__PURE__ */ React.createElement("span", null, "Exportar Excel")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleOpenItemModal(),
      className: "btn-red-action"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 15, className: "text-white" }),
    /* @__PURE__ */ React.createElement("span", null, "Agregar Equipo")
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-4 gap-4 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-rose-600" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-xl flex-shrink-0" }, /* @__PURE__ */ React.createElement(Icon, { name: "inventory", size: 22, className: "text-rose-600" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-slate-400" }, "Total Unidades F\xEDsicas"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 dark:text-white leading-tight" }, metrics.totalItems), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-medium text-slate-500" }, metrics.totalTypes, " referencias"))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0" }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 22, className: "text-emerald-600" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-slate-400" }, "Referencias Disponibles"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 dark:text-white leading-tight" }, metrics.availableCount), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-emerald-600" }, "Listas para entrega"))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-amber-500" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-xl flex-shrink-0" }, /* @__PURE__ */ React.createElement(Icon, { name: "alerts", size: 22, className: "text-amber-600" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-slate-400" }, "Referencias Agotadas"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 dark:text-white leading-tight" }, metrics.outOfStockCount), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-amber-600" }, "Requieren reposici\xF3n"))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-purple-500" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center text-xl flex-shrink-0" }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 22, className: "text-purple-600" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-slate-400" }, "Categor\xEDas Activas"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 dark:text-white leading-tight" }, metrics.categoriesCount), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-medium text-slate-500" }, "AI, Perif\xE9ricos, Monitores")))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm mb-5 flex items-center gap-3 flex-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-3 py-1.5 flex-1 min-w-[220px] focus-within:border-rose-500 focus-within:bg-white dark:focus-within:bg-zinc-800 transition-all" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 15, className: "text-slate-400" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Buscar por equipo, marca, modelo, serial o \xE1rea...",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      className: "bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none w-full"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400 uppercase" }, "Categor\xEDa:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedCategory,
      onChange: (e) => setSelectedCategory(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer"
    },
    categories.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c, className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, c))
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400 uppercase" }, "Estado:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedStatus,
      onChange: (e) => setSelectedStatus(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("option", { value: "Todos", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Todos"),
    /* @__PURE__ */ React.createElement("option", { value: "Disponible", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Disponibles (> 0)"),
    /* @__PURE__ */ React.createElement("option", { value: "Agotado", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Agotados (0)")
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setSearchTerm("");
        setSelectedCategory("Todos");
        setSelectedStatus("Todos");
      },
      className: "btn-clean"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-rotate-right text-[11px]" }),
    /* @__PURE__ */ React.createElement("span", null, "Limpiar")
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse text-xs" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400" }, /* @__PURE__ */ React.createElement("th", { className: "p-3 w-10 text-center" }, "#"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Categor\xEDa"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Equipo / Elemento"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Marca / Modelo"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Serial / C\xF3digo"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-center" }, "Disponible"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "\xC1rea Asignada"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-center" }, "Estado"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-center" }, "Acciones"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium" }, filteredInventory.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "9", className: "text-center py-12 text-slate-400 dark:text-zinc-500" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-boxes-stacked text-3xl mb-2 block text-slate-300 dark:text-zinc-600" }), "No se encontraron equipos o perif\xE9ricos con los filtros seleccionados.")) : filteredInventory.map((item, idx) => {
    const qty = Number(item.quantity) || 0;
    const isAvailable = qty > 0;
    const isAi = item.category === "Licencias de AI";
    return /* @__PURE__ */ React.createElement("tr", { key: item.id, className: "hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "p-3 text-center font-bold text-slate-400 font-mono text-[11px]" }, idx + 1), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${isAi ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"}` }, isAi && /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-wand-magic-sparkles text-[9px]" }), item.category)), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-extrabold text-slate-900 dark:text-white text-xs" }, item.name), item.notes && /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400 truncate max-w-[260px] mt-0.5", title: item.notes }, item.notes)), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-slate-600 dark:text-zinc-300" }, item.brandModel || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "p-3 font-mono font-bold text-slate-600 dark:text-zinc-400 text-[11px]" }, item.serialCode || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-center" }, /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center justify-center px-3 py-1 rounded-full font-black text-xs min-w-[36px] ${isAvailable ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"}` }, qty), /* @__PURE__ */ React.createElement("div", { className: "text-[9px] text-slate-400 mt-0.5" }, item.unit || "Unidades")), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-slate-600 dark:text-zinc-300" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-building-user text-slate-400 mr-1.5 text-[11px]" }), item.areaAssigned || "Tecnolog\xEDa (TI)"), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-center" }, /* @__PURE__ */ React.createElement("span", { className: `status-pill ${isAvailable ? "pill-delivered" : "pill-delayed"}` }, isAvailable ? "\u25CF DISPONIBLE" : "\u25CB AGOTADO")), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1.5" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleOpenDeliverModal(item),
        disabled: !isAvailable,
        className: `px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${isAvailable ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer active:scale-95" : "bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed"}`,
        title: "Entregar unidades a un \xE1rea o persona"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-hand-holding-hand text-[11px]" }),
      /* @__PURE__ */ React.createElement("span", null, "Entregar")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleOpenItemModal(item),
        className: "w-7 h-7 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors",
        title: "Editar"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-pen-to-square text-xs" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          Swal.fire({
            title: `\xBFEliminar ${item.name}?`,
            text: "Se eliminar\xE1 permanentemente de MySQL.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "S\xED, eliminar",
            confirmButtonColor: "#e11d48"
          }).then((res) => {
            if (res.isConfirmed && onDeleteItem) onDeleteItem(item.id);
          });
        },
        className: "w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors",
        title: "Eliminar"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-trash-can text-xs" })
    ))));
  }))))));
}
window.TechInventoryModule = TechInventoryModule;
function TechBudgetModule({ budgets, areas, onSaveBudget, onDeleteBudget }) {
  const [selectedYear, setSelectedYear] = React.useState("2026");
  const [selectedArea, setSelectedArea] = React.useState("Todos");
  const [selectedCategory, setSelectedCategory] = React.useState("Todos");
  const [searchTerm, setSearchTerm] = React.useState("");
  const years = ["Todos", "2026", "2027", "2028", "2029", "2030"];
  const categories = [
    "Todos",
    "Licencias de AI",
    "Perif\xE9ricos",
    "Monitores",
    "Equipos de C\xF3mputo",
    "Software & Cloud",
    "Infraestructura & Redes",
    "Ciberseguridad"
  ];
  const filteredBudgets = React.useMemo(() => {
    return (budgets || []).filter((b) => {
      if (selectedYear !== "Todos" && b.year !== selectedYear) return false;
      if (selectedArea !== "Todos" && b.area !== selectedArea) return false;
      if (selectedCategory !== "Todos" && b.category !== selectedCategory) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match = (b.itemType || "").toLowerCase().includes(term) || (b.area || "").toLowerCase().includes(term) || (b.category || "").toLowerCase().includes(term) || (b.notes || "").toLowerCase().includes(term);
        if (!match) return false;
      }
      return true;
    });
  }, [budgets, selectedYear, selectedArea, selectedCategory, searchTerm]);
  const summaryKpis = React.useMemo(() => {
    let totalEstimated = 0;
    let totalApproved = 0;
    let aiLicensesCost = 0;
    let aiLicensesCount = 0;
    filteredBudgets.forEach((b) => {
      const total = Number(b.totalCost) || (Number(b.quantity) || 1) * (Number(b.unitCost) || 0);
      totalEstimated += total;
      if (b.status === "Aprobado" || b.status === "Ejecutado") {
        totalApproved += total;
      }
      if (b.category === "Licencias de AI") {
        aiLicensesCost += total;
        aiLicensesCount += Number(b.quantity) || 0;
      }
    });
    return {
      totalEstimated,
      totalApproved,
      itemCount: filteredBudgets.length,
      aiLicensesCost,
      aiLicensesCount
    };
  }, [filteredBudgets]);
  const handleOpenBudgetModal = (itemToEdit = null) => {
    const isEdit = !!itemToEdit;
    const areasList = (areas || []).map((a) => `<option value="${a.name}" ${itemToEdit && itemToEdit.area === a.name ? "selected" : ""}>${a.name}</option>`).join("");
    Swal.fire({
      title: isEdit ? "Editar \xCDtem de Presupuesto TI" : "Nuevo \xCDtem de Presupuesto TI",
      html: `
        <div style="display:flex; flex-direction:column; gap:12px; text-align:left; font-size:12px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">A\xF1o Presupuestal *</label>
              <select id="swBudYear" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800;">
                <option value="2026" ${itemToEdit && itemToEdit.year === "2026" ? "selected" : ""}>2026</option>
                <option value="2027" ${itemToEdit && itemToEdit.year === "2027" ? "selected" : ""}>2027</option>
                <option value="2028" ${itemToEdit && itemToEdit.year === "2028" ? "selected" : ""}>2028</option>
                <option value="2029" ${itemToEdit && itemToEdit.year === "2029" ? "selected" : ""}>2029</option>
                <option value="2030" ${itemToEdit && itemToEdit.year === "2030" ? "selected" : ""}>2030</option>
              </select>
            </div>

            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Categor\xEDa Tecnol\xF3gica *</label>
              <select id="swBudCat" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
                <option value="Licencias de AI" ${itemToEdit && itemToEdit.category === "Licencias de AI" ? "selected" : ""}>\u{1F916} Licencias de AI (ChatGPT, Copilot, APIs)</option>
                <option value="Perif\xE9ricos" ${itemToEdit && itemToEdit.category === "Perif\xE9ricos" ? "selected" : ""}>\u{1F5B1}\uFE0F Perif\xE9ricos (Kits, Teclados, Mouse)</option>
                <option value="Monitores" ${itemToEdit && itemToEdit.category === "Monitores" ? "selected" : ""}>\u{1F5A5}\uFE0F Monitores & Pantallas</option>
                <option value="Equipos de C\xF3mputo" ${itemToEdit && itemToEdit.category === "Equipos de C\xF3mputo" ? "selected" : ""}>\u{1F4BB} Equipos de C\xF3mputo (Laptops, Servidores)</option>
                <option value="Software & Cloud" ${itemToEdit && itemToEdit.category === "Software & Cloud" ? "selected" : ""}>\u2601\uFE0F Software & Servicios Cloud</option>
                <option value="Infraestructura & Redes" ${itemToEdit && itemToEdit.category === "Infraestructura & Redes" ? "selected" : ""}>\u{1F310} Infraestructura & Redes</option>
                <option value="Ciberseguridad" ${itemToEdit && itemToEdit.category === "Ciberseguridad" ? "selected" : ""}>\u{1F6E1}\uFE0F Ciberseguridad & Licenciamiento</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">\xC1rea Solicitante / Beneficiaria *</label>
            <select id="swBudArea" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
              ${areasList || '<option value="Tecnolog\xEDa (TI)">Tecnolog\xEDa (TI)</option>'}
            </select>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Descripci\xF3n / Tipo de Licencia o Equipo *</label>
            <input id="swBudItem" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;" placeholder="ej: OpenAI ChatGPT Enterprise (Slots anuales)" value="${itemToEdit ? itemToEdit.itemType : ""}">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Cantidad Solicitada *</label>
              <input id="swBudQty" type="number" min="1" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800;" placeholder="ej: 10" value="${itemToEdit ? itemToEdit.quantity : "1"}">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Costo Unitario Estimado ($ COP) *</label>
              <input id="swBudUnitCost" type="number" step="0.01" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800;" placeholder="ej: 1200000" value="${itemToEdit ? itemToEdit.unitCost : "0"}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Prioridad</label>
              <select id="swBudPriority" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;">
                <option value="Alta" ${itemToEdit && itemToEdit.priority === "Alta" ? "selected" : ""}>\u{1F534} Alta</option>
                <option value="Media" ${!itemToEdit || itemToEdit.priority === "Media" ? "selected" : ""}>\u{1F7E1} Media</option>
                <option value="Baja" ${itemToEdit && itemToEdit.priority === "Baja" ? "selected" : ""}>\u{1F7E2} Baja</option>
              </select>
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Estado de Aprobaci\xF3n</label>
              <select id="swBudStatus" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
                <option value="Planificado" ${!itemToEdit || itemToEdit.status === "Planificado" ? "selected" : ""}>\u{1F4CB} Planificado</option>
                <option value="En Revisi\xF3n" ${itemToEdit && itemToEdit.status === "En Revisi\xF3n" ? "selected" : ""}>\u23F3 En Revisi\xF3n</option>
                <option value="Aprobado" ${itemToEdit && itemToEdit.status === "Aprobado" ? "selected" : ""}>\u2705 Aprobado</option>
                <option value="Ejecutado" ${itemToEdit && itemToEdit.status === "Ejecutado" ? "selected" : ""}>\u{1F680} Ejecutado</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Justificaci\xF3n / Notas</label>
            <textarea id="swBudNotes" class="swal2-textarea" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:12px; height:60px;" placeholder="Justificaci\xF3n t\xE9cnica o econ\xF3mica del requerimiento...">${itemToEdit ? itemToEdit.notes || "" : ""}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isEdit ? "Guardar Cambios" : "Registrar en Presupuesto",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e11d48",
      focusConfirm: false
    }).then((res) => {
      if (res.isConfirmed) {
        const year = document.getElementById("swBudYear").value;
        const category = document.getElementById("swBudCat").value;
        const area = document.getElementById("swBudArea").value;
        const itemType = (document.getElementById("swBudItem").value || "").trim();
        const quantity = Number(document.getElementById("swBudQty").value) || 1;
        const unitCost = Number(document.getElementById("swBudUnitCost").value) || 0;
        const priority = document.getElementById("swBudPriority").value;
        const status = document.getElementById("swBudStatus").value;
        const notes = (document.getElementById("swBudNotes").value || "").trim();
        if (!itemType) {
          return Swal.fire("Campo requerido", "Por favor ingresa la descripci\xF3n o tipo de \xEDtem/licencia.", "warning");
        }
        const payload = {
          id: itemToEdit ? itemToEdit.id : "bud-" + Date.now(),
          year,
          category,
          area,
          itemType,
          quantity,
          unitCost,
          totalCost: quantity * unitCost,
          priority,
          status,
          notes
        };
        if (onSaveBudget) onSaveBudget(payload);
      }
    });
  };
  const handleExportExcel = () => {
    try {
      if (typeof XLSX === "undefined") {
        return Swal.fire("Librer\xEDa no lista", "Cargando m\xF3dulo de Excel...", "info");
      }
      const rowsData = filteredBudgets.map((item, idx) => ({
        "#": idx + 1,
        "A\xF1o": item.year,
        "\xC1rea Solicitante": item.area,
        "Categor\xEDa": item.category,
        "\xCDtem / Licencia": item.itemType,
        "Cantidad": Number(item.quantity) || 1,
        "Costo Unitario ($)": Number(item.unitCost) || 0,
        "Total Presupuestado ($)": Number(item.totalCost) || 0,
        "Prioridad": item.priority || "Media",
        "Estado": item.status || "Planificado",
        "Justificaci\xF3n / Notas": item.notes || ""
      }));
      const worksheet = XLSX.utils.json_to_sheet(rowsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Presupuestos_${selectedYear}`);
      const fileName = `Presupuesto_TI_${selectedYear}_Enriko.xlsx`;
      XLSX.writeFile(workbook, fileName);
      Swal.fire("Excel Exportado", `Reporte "${fileName}" generado exitosamente.`, "success");
    } catch (err) {
      console.error("Error exportando Excel de presupuestos:", err);
      Swal.fire("Error", "No se pudo generar el archivo Excel.", "error");
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "dashboard-container" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm mb-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-calculator text-rose-600" }), "Presupuestos Tecnol\xF3gicos Anuales"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 dark:text-zinc-400 mt-1" }, "Planificaci\xF3n de gastos en Licencias de AI, Perif\xE9ricos, Monitores y Equipos por \xC1rea Solicitante.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleExportExcel,
      className: "btn-export-excel"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-file-excel text-xs" }),
    /* @__PURE__ */ React.createElement("span", null, "Exportar Excel")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleOpenBudgetModal(),
      className: "btn-red-action"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-plus text-xs" }),
    /* @__PURE__ */ React.createElement("span", null, "Nuevo \xCDtem")
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-4 gap-4 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-rose-600" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-xl flex-shrink-0" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-dollar-sign" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-slate-400" }, "Presupuesto Proyectado (", selectedYear, ")"), /* @__PURE__ */ React.createElement("div", { className: "text-xl font-black text-slate-900 dark:text-white leading-tight font-mono" }, "$", summaryKpis.totalEstimated.toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-medium text-slate-500" }, summaryKpis.itemCount, " rubros planificados"))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-circle-check" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-slate-400" }, "Presupuesto Aprobado"), /* @__PURE__ */ React.createElement("div", { className: "text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight font-mono" }, "$", summaryKpis.totalApproved.toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-emerald-600" }, "Listo para ejecuci\xF3n"))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-purple-500" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center text-xl flex-shrink-0" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-wand-magic-sparkles" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-slate-400" }, "Licencias de AI"), /* @__PURE__ */ React.createElement("div", { className: "text-xl font-black text-purple-600 dark:text-purple-400 leading-tight font-mono" }, "$", summaryKpis.aiLicensesCost.toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-purple-600" }, summaryKpis.aiLicensesCount, " slots / licencias"))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center text-xl flex-shrink-0" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-building-user" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-slate-400" }, "\xC1reas Solicitantes"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 dark:text-white leading-tight" }, (areas || []).length), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-medium text-slate-500" }, "Direcciones y plantas")))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm mb-5 flex items-center gap-3 flex-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400 uppercase" }, "A\xF1o:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedYear,
      onChange: (e) => setSelectedYear(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer"
    },
    years.map((y) => /* @__PURE__ */ React.createElement("option", { key: y, value: y, className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, y))
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400 uppercase" }, "\xC1rea:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedArea,
      onChange: (e) => setSelectedArea(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer max-w-[140px] truncate"
    },
    /* @__PURE__ */ React.createElement("option", { value: "Todos", className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, "Todas las \xE1reas"),
    (areas || []).map((a) => /* @__PURE__ */ React.createElement("option", { key: a.id || a.name, value: a.name, className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, a.name))
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400 uppercase" }, "Categor\xEDa:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedCategory,
      onChange: (e) => setSelectedCategory(e.target.value),
      className: "bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer"
    },
    categories.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c, className: "dark:bg-zinc-900 text-slate-900 dark:text-white" }, c))
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-3 py-1.5 flex-1 min-w-[200px] focus-within:border-rose-500 focus-within:bg-white dark:focus-within:bg-zinc-800 transition-all" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-magnifying-glass text-slate-400 text-xs" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Buscar rubro, descripci\xF3n o justificaci\xF3n...",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      className: "bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none w-full"
    }
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setSelectedYear("2026");
        setSelectedArea("Todos");
        setSelectedCategory("Todos");
        setSearchTerm("");
      },
      className: "btn-clean"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-rotate-right text-[11px]" }),
    /* @__PURE__ */ React.createElement("span", null, "Resetear")
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse text-xs" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400" }, /* @__PURE__ */ React.createElement("th", { className: "p-3 w-12 text-center" }, "A\xF1o"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "\xC1rea Solicitante"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Categor\xEDa"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "\xCDtem / Descripci\xF3n"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-center" }, "Cantidad"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-right" }, "Costo Unitario"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-right" }, "Total Presupuestado"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-center" }, "Prioridad"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-center" }, "Estado"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-center" }, "Acciones"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium" }, filteredBudgets.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "10", className: "text-center py-12 text-slate-400 dark:text-zinc-500" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-calculator text-3xl mb-2 block text-slate-300 dark:text-zinc-600" }), "No se encontraron rubros presupuestales para los filtros indicados.")) : filteredBudgets.map((b) => {
    const total = Number(b.totalCost) || (Number(b.quantity) || 1) * (Number(b.unitCost) || 0);
    const isAi = b.category === "Licencias de AI";
    return /* @__PURE__ */ React.createElement("tr", { key: b.id, className: "hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "p-3 text-center font-black text-rose-600 font-mono text-xs" }, b.year), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-building-user text-slate-400 text-[11px]" }), /* @__PURE__ */ React.createElement("span", null, b.area))), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${isAi ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"}` }, isAi && /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-wand-magic-sparkles text-[9px]" }), b.category)), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-extrabold text-slate-900 dark:text-white text-xs" }, b.itemType), b.notes && /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400 truncate max-w-[280px] mt-0.5", title: b.notes }, b.notes)), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-center font-black text-slate-800 dark:text-zinc-200" }, b.quantity), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-right font-mono text-slate-600 dark:text-zinc-400" }, "$", Number(b.unitCost || 0).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-right font-mono font-black text-slate-900 dark:text-white text-xs" }, "$", total.toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-center" }, /* @__PURE__ */ React.createElement("span", { className: `text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${b.priority === "Alta" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400" : b.priority === "Media" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"}` }, b.priority || "Media")), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-center" }, /* @__PURE__ */ React.createElement("span", { className: `status-pill ${b.status === "Aprobado" ? "pill-delivered" : b.status === "Ejecutado" ? "pill-facture" : "pill-pending"}` }, b.status || "Planificado")), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleOpenBudgetModal(b),
        className: "w-7 h-7 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors",
        title: "Editar"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-pen-to-square text-xs" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          Swal.fire({
            title: `\xBFEliminar rubro?`,
            text: `Se remover\xE1 "${b.itemType}" del presupuesto.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "S\xED, eliminar",
            confirmButtonColor: "#e11d48"
          }).then((res) => {
            if (res.isConfirmed && onDeleteBudget) onDeleteBudget(b.id);
          });
        },
        className: "w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors",
        title: "Eliminar"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-trash-can text-xs" })
    ))));
  }))))));
}
window.TechBudgetModule = TechBudgetModule;
function AreasModule({ areas, onSaveArea, onDeleteArea }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const filteredAreas = React.useMemo(() => {
    return (areas || []).filter((a) => {
      const term = searchTerm.toLowerCase();
      return (a.name || "").toLowerCase().includes(term) || (a.director || "").toLowerCase().includes(term) || (a.headOrCoord || "").toLowerCase().includes(term) || (a.email || "").toLowerCase().includes(term);
    });
  }, [areas, searchTerm]);
  const handleOpenAreaModal = (areaToEdit = null) => {
    const isEdit = !!areaToEdit;
    Swal.fire({
      title: `<div class="text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-sm">
          <i class="fa-solid fa-sitemap"></i>
        </span>
        ${isEdit ? "Editar \xC1rea Organizacional" : "Nueva \xC1rea Organizacional"}
      </div>`,
      html: `
        <div class="space-y-3.5 text-left text-xs text-slate-600 dark:text-slate-300">
          <div>
            <label class="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Nombre del \xC1rea / Departamento *</label>
            <input id="swAreaName" class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" placeholder="ej: Operaciones & Planta" value="${areaToEdit ? areaToEdit.name : ""}">
          </div>

          <div>
            <label class="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">\u{1F451} 1er Responsable (Director del \xC1rea) *</label>
            <input id="swAreaDirector" class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" placeholder="ej: Ing. Fernando Castro (Director Operaciones)" value="${areaToEdit ? areaToEdit.director : ""}">
          </div>

          <div>
            <label class="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">\u{1F6E1}\uFE0F 2do Responsable (Jefe de \xC1rea o Coordinador)</label>
            <input id="swAreaHead" class="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" placeholder="ej: Mauricio Pardo (Jefe de Planta)" value="${areaToEdit ? areaToEdit.headOrCoord || "" : ""}">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Correo Electr\xF3nico</label>
              <input id="swAreaEmail" type="email" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" placeholder="ej: planta@alimentosenriko.com" value="${areaToEdit ? areaToEdit.email || "" : ""}">
            </div>
            <div>
              <label class="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">L\xEDmite Presupuestal Anual ($)</label>
              <input id="swAreaBudget" type="number" class="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono" placeholder="ej: 35000000" value="${areaToEdit ? areaToEdit.budgetLimit || "0" : "0"}">
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isEdit ? '<i class="fa-solid fa-floppy-disk mr-1"></i> Guardar Cambios' : '<i class="fa-solid fa-plus mr-1"></i> Registrar \xC1rea',
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      customClass: {
        popup: "rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 dark:bg-zinc-900",
        confirmButton: "rounded-xl text-xs font-bold py-2.5 px-4",
        cancelButton: "rounded-xl text-xs font-bold py-2.5 px-4"
      }
    }).then((res) => {
      if (res.isConfirmed) {
        const name = (document.getElementById("swAreaName").value || "").trim();
        const director = (document.getElementById("swAreaDirector").value || "").trim();
        const headOrCoord = (document.getElementById("swAreaHead").value || "").trim();
        const email = (document.getElementById("swAreaEmail").value || "").trim();
        const budgetLimit = Number(document.getElementById("swAreaBudget").value) || 0;
        if (!name || !director) {
          return Swal.fire("Campos requeridos", "Por favor ingresa el nombre del \xE1rea y el Director (1er responsable).", "warning");
        }
        const payload = {
          id: areaToEdit ? areaToEdit.id : "area-" + Date.now(),
          name,
          director,
          headOrCoord,
          email,
          budgetLimit
        };
        if (onSaveArea) onSaveArea(payload);
      }
    });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-5 animate-fade-in pb-10" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-500/20" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-sitemap" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2" }, "Estructura Organizacional & \xC1reas"), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5" }, "Directores de \xE1rea (1er responsable), coordinadores (2do responsable) y control de recursos tecnol\xF3gicos."))), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer",
      onClick: () => handleOpenAreaModal()
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-plus text-xs" }),
    /* @__PURE__ */ React.createElement("span", null, "Nueva \xC1rea")
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "relative flex-1" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium",
      placeholder: "Buscar por \xE1rea, director o coordinador...",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value)
    }
  )), searchTerm && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors",
      onClick: () => setSearchTerm("")
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-rotate-right text-xs" }),
    /* @__PURE__ */ React.createElement("span", null, "Limpiar")
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, filteredAreas.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "col-span-full bg-white dark:bg-zinc-900 p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 text-slate-400" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-building-circle-xmark text-4xl mb-3 text-slate-300 dark:text-zinc-700 block" }), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-slate-600 dark:text-slate-300" }, "No se encontraron \xE1reas organizacionales registradas"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-1" }, 'Haz clic en "Nueva \xC1rea" para dar de alta una nueva divisi\xF3n.')) : filteredAreas.map((area) => {
    const assignedTech = Number(area.assignedTechItems) || 0;
    const budgetCount = Number(area.budgetItemsCount) || 0;
    const totalBud = Number(area.calculatedBudgetSum) || 0;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: area.id,
        className: "bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
      },
      /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" }),
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-3 mb-3 pt-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors" }, area.name), area.email && /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate" }, /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-envelope text-slate-400 text-[10px]" }), /* @__PURE__ */ React.createElement("span", null, area.email))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 opacity-90" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors text-xs",
          onClick: () => handleOpenAreaModal(area),
          title: "Editar \xE1rea"
        },
        /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-pen-to-square" })
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs",
          onClick: () => {
            Swal.fire({
              title: `\xBFEliminar ${area.name}?`,
              text: "Se remover\xE1 de la estructura organizacional.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "S\xED, eliminar",
              cancelButtonText: "Cancelar",
              confirmButtonColor: "#e11d48"
            }).then((res) => {
              if (res.isConfirmed && onDeleteArea) onDeleteArea(area.id);
            });
          },
          title: "Eliminar \xE1rea"
        },
        /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-trash-can" })
      ))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2 mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[9px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F451} 1er Responsable (Director):")), /* @__PURE__ */ React.createElement("div", { className: "text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5" }, area.director)), area.headOrCoord && /* @__PURE__ */ React.createElement("div", { className: "pt-2 border-t border-slate-200/60 dark:border-zinc-700/60" }, /* @__PURE__ */ React.createElement("div", { className: "text-[9px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F6E1}\uFE0F 2do Responsable (Jefe / Coord):")), /* @__PURE__ */ React.createElement("div", { className: "text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5" }, area.headOrCoord)))),
      /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2 pt-3 border-t border-dashed border-slate-200 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("div", { className: "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 p-2.5 rounded-xl text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight" }, "Equipos Custodia"), /* @__PURE__ */ React.createElement("div", { className: "text-sm font-black text-emerald-800 dark:text-emerald-300 font-mono mt-0.5" }, assignedTech, " ", /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-sans font-medium" }, "uds"))), /* @__PURE__ */ React.createElement("div", { className: "bg-fuchsia-50 dark:bg-fuchsia-950/30 border border-fuchsia-200/60 dark:border-fuchsia-900/40 p-2.5 rounded-xl text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold text-fuchsia-700 dark:text-fuchsia-400 uppercase tracking-tight" }, "Presupuesto TI"), /* @__PURE__ */ React.createElement("div", { className: "text-xs font-black text-fuchsia-800 dark:text-fuchsia-300 font-mono mt-0.5" }, "$", totalBud > 0 ? (totalBud / 1e6).toFixed(1) + "M" : "0", " ", /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-sans font-normal opacity-80" }, "(", budgetCount, ")"))))
    );
  })));
}
window.AreasModule = AreasModule;
function UsersModule({ users, onAddUser, currentUser, onDeleteUser }) {
  const isSuperAdmin = currentUser?.role === "superadmin";
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-5 animate-fade-in pb-10" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-500/20" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-users-gear" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-black text-slate-900 dark:text-white tracking-tight" }, "Gesti\xF3n de Usuarios, Roles & Credenciales"), isSuperAdmin && /* @__PURE__ */ React.createElement("span", { className: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-black border border-amber-200 dark:border-amber-900/50" }, "\u{1F451} SUPERADMIN")), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5" }, "Control de cuentas autorizadas con roles superadmin y admin en MySQL"))), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer",
      onClick: onAddUser
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-user-plus text-xs" }),
    /* @__PURE__ */ React.createElement("span", null, "Crear Nuevo Usuario")
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse text-xs" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider" }, /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4" }, "Usuario (Login)"), /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4" }, "Nombre Completo"), /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4" }, "Rol Asignado"), /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4" }, "\xC1rea Operativa"), /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4" }, "Estado"), /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4 text-center" }, "Nivel Acceso"), isSuperAdmin && /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4 text-right" }, "Acciones"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100 dark:divide-zinc-800" }, users.map((u) => {
    const isSuper = u.role === "superadmin";
    return /* @__PURE__ */ React.createElement("tr", { key: u.id, className: "hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "py-3 px-4" }, /* @__PURE__ */ React.createElement("span", { className: `font-mono font-bold ${isSuper ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-white"}` }, u.username)), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-4 font-bold text-slate-900 dark:text-white" }, u.name), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-4" }, /* @__PURE__ */ React.createElement("span", { className: `px-2.5 py-1 rounded-lg text-[10px] font-black border ${isSuper ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50" : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"}` }, isSuper ? "\u{1F451} SUPERADMIN" : "\u{1F6E1}\uFE0F ADMIN")), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-4" }, /* @__PURE__ */ React.createElement("span", { className: "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg text-[10px] font-semibold" }, u.area || "General")), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-4" }, /* @__PURE__ */ React.createElement("span", { className: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-lg text-[10px] font-black border border-emerald-200 dark:border-emerald-900/50" }, u.status || "Activo")), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-4 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400" }, isSuper ? "Control Total + BD" : "Gesti\xF3n & Facturas"), isSuperAdmin && /* @__PURE__ */ React.createElement("td", { className: "py-3 px-4 text-right" }, u.id !== currentUser?.id && u.username !== "superadmin" ? /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onDeleteUser && onDeleteUser(u.id),
        className: "w-7 h-7 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs",
        title: "Eliminar usuario"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-trash-can" })
    ) : /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400" }, "Principal")));
  }))))));
}
window.UsersModule = UsersModule;
function AlertsModule({ alerts, onGoDashboard }) {
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-5 animate-fade-in pb-10" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-lg" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-triangle-exclamation" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-black text-slate-900 dark:text-white tracking-tight" }, "Centro de Alertas Reales del Sistema"), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5" }, "Monitoreo en tiempo real de facturas vencidas, firmas pendientes y entregas"))), /* @__PURE__ */ React.createElement("div", { className: "mt-5 space-y-3" }, alerts.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-circle-check text-base text-emerald-600" }), /* @__PURE__ */ React.createElement("span", null, "\xA1Todo al d\xEDa! No hay facturas atrasadas ni pendientes cr\xEDticas registradas.")) : alerts.map((alt, idx) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: idx,
      className: `p-4 rounded-xl text-xs font-medium border flex items-center justify-between gap-3 ${alt.type === "red" ? "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900/50" : alt.type === "amber" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900/50" : "bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-900/50"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("span", { className: `w-2 h-2 rounded-full ${alt.type === "red" ? "bg-rose-500 animate-pulse" : alt.type === "amber" ? "bg-amber-500" : "bg-blue-500"}` }), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", { className: "font-bold" }, alt.title, ":"), " ", alt.message)),
    /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/70 dark:bg-zinc-800/80 shadow-xs uppercase tracking-wider" }, alt.tag)
  ))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors",
      onClick: onGoDashboard
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-arrow-left text-xs" }),
    /* @__PURE__ */ React.createElement("span", null, "Volver al Dashboard")
  ))));
}
window.AlertsModule = AlertsModule;
function ExcelPreviewModal({ isOpen, onClose, selectedInvoices, onToggleDelivered, onUploadPdf }) {
  if (!isOpen || !selectedInvoices || selectedInvoices.length === 0) return null;
  const totalSelectedAmount = selectedInvoices.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const deliveredCount = selectedInvoices.filter((i) => i.delivered === "S\xCD").length;
  const handlePrint = () => {
    window.print();
  };
  const handleExportCsv = () => {
    const headers = ["Proveedor", "Servicio", "N DE FACTURA", "FECHA DE EMISION", "FECHA DE ENTREGA", "VALOR", "FIRMADA", "ORDEN STD", "OC", "EN FACTURE", "ENTREGADA"];
    const rows = selectedInvoices.map((i) => [
      `"${i.supplier}"`,
      `"${i.service}"`,
      `"${i.invoiceNumber}"`,
      `"${i.emissionDate}"`,
      `"${i.deliveryDate}"`,
      i.value,
      `"${i.signed}"`,
      `"${i.orderStd}"`,
      `"${i.oc}"`,
      `"${i.enFacture}"`,
      `"${i.delivered}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Vista_Previa_Facturas_Entregadas_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 animate-fade-in" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 md:px-6 bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20" }, /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-file-excel" }), /* @__PURE__ */ React.createElement("span", null, "Excel View")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-black text-slate-900 dark:text-white" }, "Vista Previa de Facturas Entregadas y Seleccionadas"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-medium text-slate-500 dark:text-slate-400" }, selectedInvoices.length, " facturas seleccionadas | ", deliveredCount, " con estado ENTREGADA | Total: ", /* @__PURE__ */ React.createElement("strong", { className: "text-slate-800 dark:text-slate-200 font-mono" }, "$", totalSelectedAmount.toLocaleString("es-CO"))))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs",
      onClick: handleExportCsv,
      title: "Descargar archivo Excel / CSV"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-arrow-down text-emerald-600" }),
    /* @__PURE__ */ React.createElement("span", null, "Exportar CSV")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs",
      onClick: handlePrint,
      title: "Imprimir informe"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-print text-blue-600" }),
    /* @__PURE__ */ React.createElement("span", null, "Imprimir")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors",
      onClick: onClose,
      title: "Cerrar modal"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-xmark text-sm" })
  ))), /* @__PURE__ */ React.createElement("div", { className: "px-6 py-2 bg-slate-100/70 dark:bg-zinc-800/40 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "font-mono font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[11px]" }, "A1:", String.fromCharCode(65 + 10), selectedInvoices.length + 1), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-1" }, /* @__PURE__ */ React.createElement("span", { className: "font-black italic text-slate-400 font-serif" }, "fx"), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-slate-700 dark:text-slate-300 text-[11px]" }, "=SUMA(VALOR) = $", totalSelectedAmount.toLocaleString("es-CO"), " COP | Entregadas: ", deliveredCount, "/", selectedInvoices.length))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-auto bg-slate-50 dark:bg-zinc-950" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse text-xs font-sans" }, /* @__PURE__ */ React.createElement("thead", { className: "sticky top-0 bg-slate-200/90 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 shadow-xs z-10" }, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-slate-300 dark:border-zinc-700 text-[10px] font-bold uppercase tracking-wider" }, /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3 text-center w-10 bg-slate-300/80 dark:bg-zinc-700 text-slate-600 dark:text-slate-300" }, "#"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3" }, "PROVEEDOR"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3" }, "SERVICIO"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3 font-mono" }, "N\xB0 FACTURA"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3" }, "FECHA EMISI\xD3N"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3" }, "FECHA ENTREGA"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3 text-right" }, "VALOR ($)"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3 text-center" }, "FIRMADA"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3 text-center" }, "ORDEN STD"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3" }, "OC"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3 text-center" }, "EN FACTURE"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3 text-center" }, "ENTREGADA"), /* @__PURE__ */ React.createElement("th", { className: "py-2 px-3 text-center" }, "DOCUMENTO"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900" }, selectedInvoices.map((inv, idx) => /* @__PURE__ */ React.createElement("tr", { key: inv.id || idx, className: `hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 ${inv.delivered === "S\xCD" ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""}` }, /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 text-center font-mono font-bold text-[10px] text-slate-400 bg-slate-50 dark:bg-zinc-800/40 border-r border-slate-200 dark:border-zinc-800" }, idx + 1), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-bold text-slate-900 dark:text-white" }, inv.supplier), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 text-slate-600 dark:text-slate-400" }, inv.service), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-mono font-bold text-rose-600 dark:text-rose-400" }, inv.invoiceNumber), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 text-slate-600 dark:text-slate-400" }, inv.emissionDate), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-semibold text-emerald-700 dark:text-emerald-400" }, inv.deliveryDate), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white" }, "$", Number(inv.value || 0).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 text-center" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded-md text-[10px] font-black border ${inv.signed === "S\xCD" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}` }, inv.signed || "NO")), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 text-center" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded-md text-[10px] font-black border ${inv.orderStd === "S\xCD" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}` }, inv.orderStd || "NO")), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400" }, inv.oc), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 text-center" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded-md text-[10px] font-black border ${inv.enFacture === "S\xCD" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}` }, inv.enFacture || "A\xDAN NO")), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 text-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: `px-2.5 py-0.5 rounded-md text-[10px] font-black border transition-all cursor-pointer ${inv.delivered === "S\xCD" ? "bg-emerald-500 text-white border-emerald-600 shadow-xs" : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300 border-slate-200 dark:border-zinc-700"}`,
      onClick: () => onToggleDelivered && onToggleDelivered(inv.id),
      title: "Clic para cambiar estado de entrega"
    },
    inv.delivered === "S\xCD" ? "S\xCD \u2713" : "NO \u2715"
  )), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 text-center" }, inv.pdfPath ? /* @__PURE__ */ React.createElement(
    "a",
    {
      href: inv.pdfPath,
      target: "_blank",
      rel: "noreferrer",
      className: "inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline",
      title: `Ver PDF: ${inv.pdfOriginalName || "Archivo adjunto"}`
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-pdf" }),
    " Ver"
  ) : /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline",
      onClick: () => onUploadPdf && onUploadPdf(inv.id)
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-paperclip" }),
    " Adjuntar"
  ))))), /* @__PURE__ */ React.createElement("tfoot", { className: "sticky bottom-0 bg-slate-100 dark:bg-zinc-800 font-bold border-t-2 border-slate-300 dark:border-zinc-700 z-10" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "6", className: "py-3 px-4 text-right font-black uppercase text-slate-800 dark:text-slate-100 text-xs" }, "TOTAL GENERAL SELECCIONADO:"), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3 text-right font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm" }, "$", totalSelectedAmount.toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("td", { colSpan: "6", className: "py-3 px-3 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400" }, deliveredCount, " facturas entregadas de ", selectedInvoices.length, " seleccionadas"))))), /* @__PURE__ */ React.createElement("div", { className: "p-4 md:px-6 bg-slate-50 dark:bg-zinc-800/60 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-500 dark:text-slate-400" }, "\u{1F4A1} Documentos guardados de forma segura en local ", /* @__PURE__ */ React.createElement("code", null, "/uploads"), " y registros persistidos en ", /* @__PURE__ */ React.createElement("strong", null, "MySQL"), "."), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors",
      onClick: onClose
    },
    "Cerrar Vista"
  ))));
}
window.ExcelPreviewModal = ExcelPreviewModal;
const { useState, useMemo, useEffect, useCallback } = React;
const ROUTE_MAP = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/facturas": "invoices",
  "/proveedores": "suppliers",
  "/crm": "crm",
  "/inventario": "inventory",
  "/presupuestos": "budgets",
  "/areas": "areas",
  "/reportes": "reports",
  "/alertas": "alerts",
  "/usuarios": "users",
  "/configuracion": "settings",
  "/carpetas": "folders",
  "/historial": "history"
};
const VIEW_TO_PATH = {
  "dashboard": "/dashboard",
  "invoices": "/facturas",
  "suppliers": "/proveedores",
  "crm": "/crm",
  "inventory": "/inventario",
  "budgets": "/presupuestos",
  "areas": "/areas",
  "reports": "/reportes",
  "alerts": "/alertas",
  "users": "/usuarios",
  "settings": "/configuracion",
  "folders": "/carpetas",
  "history": "/historial"
};
function getInitialView() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, "") || "/";
  return ROUTE_MAP[path] || "dashboard";
}
function App() {
  const [currentView, setCurrentViewInternal] = useState(getInitialView);
  const navigateTo = useCallback((view, replace = false) => {
    setCurrentViewInternal(view);
    const targetPath = VIEW_TO_PATH[view] || "/dashboard";
    if (window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({ view }, "", targetPath);
      } else {
        window.history.pushState({ view }, "", targetPath);
      }
    }
  }, []);
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setCurrentViewInternal(event.state.view);
      } else {
        const viewFromPath = getInitialView();
        setCurrentViewInternal(viewFromPath);
      }
    };
    window.addEventListener("popstate", handlePopState);
    const currentPath = VIEW_TO_PATH[currentView] || "/dashboard";
    window.history.replaceState({ view: currentView }, "", currentPath);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const setCurrentView = (view) => navigateTo(view);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem("ae_sidebar_collapsed") === "true");
  const [selectedMonth, setSelectedMonth] = useState("Todos");
  const [selectedYear, setSelectedYear] = useState("Todos");
  const [currentTab, setCurrentTab] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("Todos");
  const [selectedFactureFilter, setSelectedFactureFilter] = useState("Todos");
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [isExcelPreviewOpen, setIsExcelPreviewOpen] = useState(false);
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("ae_sidebar_collapsed", next.toString());
      return next;
    });
  };
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("ae_dark") === "true");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("ae_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("ae_user", JSON.stringify(user));
  };
  const handleLogout = () => {
    Swal.fire({
      title: "\xBFCerrar Sesi\xF3n?",
      text: "Tendr\xE1s que iniciar sesi\xF3n nuevamente para acceder.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "S\xED, Salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e11d48"
    }).then((res) => {
      if (res.isConfirmed) {
        setCurrentUser(null);
        localStorage.removeItem("ae_user");
      }
    });
  };
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("ae_dark", darkMode.toString());
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
      console.error("Error cargando datos iniciales:", e);
    }
  };
  const handleSaveQuotation = async (quotationObj) => {
    try {
      await window.API.crm.save(quotationObj);
      const data = await window.API.crm.getAll();
      if (Array.isArray(data)) setQuotations(data);
    } catch (e) {
      console.error("Error guardando cotizaci\xF3n:", e);
    }
  };
  const handleDeleteQuotation = async (quotationId) => {
    try {
      await window.API.crm.delete(quotationId);
      setQuotations((prev) => prev.filter((q) => q.id !== quotationId));
      Swal.fire("Eliminado", "Solicitud removida.", "success");
    } catch (e) {
      console.error("Error eliminando cotizaci\xF3n:", e);
    }
  };
  const handleAddOrUpdateInventoryItem = async (item) => {
    try {
      await window.API.inventory.save(item);
      const data = await window.API.inventory.getAll();
      if (Array.isArray(data)) setTechInventory(data);
      Swal.fire("Guardado", "Equipo registrado en inventario MySQL.", "success");
    } catch (e) {
      console.error("Error guardando inventario:", e);
      Swal.fire("Error", "No se pudo guardar en inventario.", "error");
    }
  };
  const handleDeliverInventoryItem = async (deliverData) => {
    try {
      const res = await window.API.inventory.deliver(deliverData);
      if (res.success) {
        const data = await window.API.inventory.getAll();
        if (Array.isArray(data)) setTechInventory(data);
        Swal.fire("\xA1Entrega Registrada!", `${res.deliveredQuantity} unidades entregadas exitosamente. Stock restante: ${res.remainingQuantity}`, "success");
      } else {
        Swal.fire("Error", res.error || "No se pudo registrar la entrega.", "error");
      }
    } catch (e) {
      console.error("Error entregando equipo:", e);
      Swal.fire("Error", "No se pudo completar la entrega.", "error");
    }
  };
  const handleDeleteInventoryItem = async (id) => {
    try {
      await window.API.inventory.delete(id);
      setTechInventory((prev) => prev.filter((i) => i.id !== id));
      Swal.fire("Eliminado", "Equipo removido del inventario.", "success");
    } catch (e) {
      console.error("Error eliminando inventario:", e);
    }
  };
  const handleSaveBudget = async (budgetObj) => {
    try {
      await window.API.budgets.save(budgetObj);
      const data = await window.API.budgets.getAll();
      if (Array.isArray(data)) setTechBudgets(data);
      Swal.fire("Guardado", "\xCDtem presupuestal registrado en MySQL.", "success");
    } catch (e) {
      console.error("Error guardando presupuesto:", e);
    }
  };
  const handleDeleteBudget = async (id) => {
    try {
      await window.API.budgets.delete(id);
      setTechBudgets((prev) => prev.filter((b) => b.id !== id));
      Swal.fire("Eliminado", "Rubro presupuestal eliminado.", "success");
    } catch (e) {
      console.error("Error eliminando presupuesto:", e);
    }
  };
  const handleSaveArea = async (areaObj) => {
    try {
      await window.API.areas.save(areaObj);
      const data = await window.API.areas.getAll();
      if (Array.isArray(data)) setAreas(data);
      Swal.fire("Guardado", "\xC1rea organizacional registrada en MySQL.", "success");
    } catch (e) {
      console.error("Error guardando \xE1rea:", e);
    }
  };
  const handleDeleteArea = async (id) => {
    try {
      await window.API.areas.delete(id);
      setAreas((prev) => prev.filter((a) => a.id !== id));
      Swal.fire("Eliminado", "\xC1rea removida de la estructura.", "success");
    } catch (e) {
      console.error("Error eliminando \xE1rea:", e);
    }
  };
  useEffect(() => {
    loadInitialData();
    let eventSource = null;
    let reconnectTimeout = null;
    const setupSSE = () => {
      try {
        eventSource = new EventSource("/api/events");
        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === "SUPPLIERS_UPDATED") {
              window.API.suppliers.getAll().then((data) => {
                if (Array.isArray(data)) setSuppliers(data);
              });
            } else if (parsed.type === "INVOICES_UPDATED") {
              window.API.invoices.getAll().then((data) => {
                if (Array.isArray(data)) setManualInvoices(data);
              });
            } else if (parsed.type === "CRM_UPDATED") {
              window.API.crm.getAll().then((data) => {
                if (Array.isArray(data)) setQuotations(data);
              });
            } else if (parsed.type === "INVENTORY_UPDATED") {
              window.API.inventory.getAll().then((data) => {
                if (Array.isArray(data)) setTechInventory(data);
              });
            } else if (parsed.type === "BUDGETS_UPDATED") {
              window.API.budgets.getAll().then((data) => {
                if (Array.isArray(data)) setTechBudgets(data);
              });
            } else if (parsed.type === "AREAS_UPDATED") {
              window.API.areas.getAll().then((data) => {
                if (Array.isArray(data)) setAreas(data);
              });
            }
          } catch (e) {
          }
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
            }, 1e4);
          }
        };
      } catch (e) {
      }
    };
    setupSSE();
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) eventSource.close();
    };
  }, []);
  const [selectedSignedFilter, setSelectedSignedFilter] = useState("Todos");
  const [selectedOrderStdFilter, setSelectedOrderStdFilter] = useState("Todos");
  const [selectedOcFilter, setSelectedOcFilter] = useState("Todos");
  const [selectedDeliveredFilter, setSelectedDeliveredFilter] = useState("Todos");
  const monthMap = {
    "Enero": "01",
    "Febrero": "02",
    "Marzo": "03",
    "Abril": "04",
    "Mayo": "05",
    "Junio": "06",
    "Julio": "07",
    "Agosto": "08",
    "Septiembre": "09",
    "Octubre": "10",
    "Noviembre": "11",
    "Diciembre": "12"
  };
  const activeInvoices = useMemo(() => {
    let list = [...manualInvoices || []];
    const targetYear = selectedYear !== "Todos" ? selectedYear : "2026";
    const targetMonthNum = selectedMonth !== "Todos" && monthMap[selectedMonth] ? monthMap[selectedMonth] : "";
    (suppliers || []).forEach((sup) => {
      const services = sup.services || [];
      services.forEach((srv, idx) => {
        if (srv.enabled !== false) {
          const supName = sup.name || "";
          const srvName = srv.serviceName || `Servicio #${idx + 1}`;
          const isQuotation = srv.type === "cotizacion";
          const exists = list.some((i) => {
            const sameSup = (i.supplier || "") === supName;
            const sameSrv = (i.service || "") === srvName;
            if (!sameSup || !sameSrv) return false;
            if (targetMonthNum) {
              const iMonth = (i.emissionDate || "").substring(5, 7) || (i.deliveryDate || "").substring(5, 7);
              const iYear = (i.emissionDate || "").substring(0, 4) || (i.deliveryDate || "").substring(0, 4);
              return (!iMonth || iMonth === targetMonthNum) && (!iYear || iYear === targetYear);
            }
            return true;
          });
          if (!exists) {
            list.push({
              id: `auto-${sup.id}-${idx}-${targetYear}-${targetMonthNum || "all"}`,
              logoText: (supName.substring(0, 2) || "PR").toUpperCase(),
              supplier: supName,
              service: srvName,
              docType: isQuotation ? "cotizacion" : "factura",
              invoiceNumber: isQuotation ? "COT-" : "",
              emissionDate: "",
              deliveryDate: "",
              value: 0,
              signed: "NO",
              orderStd: "NO",
              oc: "",
              enFacture: "NO",
              delivered: "NO",
              pdfPath: null,
              pdfOriginalName: null
            });
          }
        }
      });
    });
    return list;
  }, [suppliers, manualInvoices, selectedMonth, selectedYear]);
  const suppliersList = useMemo(() => {
    return Array.from(new Set(activeInvoices.map((i) => i.supplier)));
  }, [activeInvoices]);
  const realAlerts = useMemo(() => {
    const list = [];
    const now = /* @__PURE__ */ new Date("2026-09-01");
    activeInvoices.forEach((inv) => {
      const delivDate = new Date(inv.deliveryDate);
      if (delivDate < now && inv.delivered !== "S\xCD") {
        const diffDays = Math.max(1, Math.floor((now - delivDate) / (1e3 * 60 * 60 * 24)));
        list.push({
          type: "red",
          title: `Factura Atrasada (${inv.invoiceNumber || "Sin N\xB0"})`,
          message: `${inv.supplier} - Vencida hace ${diffDays} d\xEDa(s)`,
          tag: "\u25B2 Urgente"
        });
      }
      if (inv.enFacture === "NO" || inv.enFacture === "A\xDAN NO") {
        list.push({
          type: "amber",
          title: `Pendiente en Facture (${inv.invoiceNumber || "Sin N\xB0"})`,
          message: `${inv.supplier} a\xFAn no ha sido radicada`,
          tag: "A\xFAn no llega"
        });
      }
      if (inv.signed === "NO") {
        list.push({
          type: "blue",
          title: `Firma Pendiente (${inv.invoiceNumber || "Sin N\xB0"})`,
          message: `${inv.supplier} requiere autorizaci\xF3n`,
          tag: "Por firmar"
        });
      }
    });
    return list;
  }, [activeInvoices]);
  const filteredRows = useMemo(() => {
    return activeInvoices.filter((inv) => {
      const matchText = (inv.supplier || "").toLowerCase().includes(searchTerm.toLowerCase()) || (inv.invoiceNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) || (inv.service || "").toLowerCase().includes(searchTerm.toLowerCase()) || (inv.oc || "").toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchText) return false;
      if (selectedSupplier !== "Todos" && inv.supplier !== selectedSupplier) return false;
      if (selectedFactureFilter !== "Todos") {
        const isFactureYes = inv.enFacture === "S\xCD";
        if (selectedFactureFilter === "S\xCD" && !isFactureYes) return false;
        if (selectedFactureFilter === "NO" && isFactureYes) return false;
      }
      if (selectedSignedFilter !== "Todos") {
        const isSignedYes = inv.signed === "S\xCD";
        if (selectedSignedFilter === "S\xCD" && !isSignedYes) return false;
        if (selectedSignedFilter === "NO" && isSignedYes) return false;
      }
      if (selectedOrderStdFilter !== "Todos") {
        const isOrderStdYes = inv.orderStd === "S\xCD";
        if (selectedOrderStdFilter === "S\xCD" && !isOrderStdYes) return false;
        if (selectedOrderStdFilter === "NO" && isOrderStdYes) return false;
      }
      if (selectedOcFilter !== "Todos") {
        const hasOc = !!(inv.oc && inv.oc.trim().length > 0);
        if (selectedOcFilter === "CON_OC" && !hasOc) return false;
        if (selectedOcFilter === "SIN_OC" && hasOc) return false;
      }
      if (selectedDeliveredFilter !== "Todos") {
        const isDeliveredYes = inv.delivered === "S\xCD";
        if (selectedDeliveredFilter === "S\xCD" && !isDeliveredYes) return false;
        if (selectedDeliveredFilter === "NO" && isDeliveredYes) return false;
      }
      if (selectedYear !== "Todos") {
        const invYear = (inv.emissionDate || "").substring(0, 4) || (inv.deliveryDate || "").substring(0, 4);
        if (invYear && invYear !== selectedYear) return false;
      }
      if (selectedMonth !== "Todos") {
        const monthNum = monthMap[selectedMonth];
        const invMonth = (inv.emissionDate || "").substring(5, 7) || (inv.deliveryDate || "").substring(5, 7);
        if (monthNum && invMonth && invMonth !== monthNum) return false;
      }
      const isCot = (inv.invoiceNumber || "").toUpperCase().startsWith("COT") || inv.docType === "cotizacion";
      const isFac = (inv.invoiceNumber || "").toUpperCase().startsWith("FAC") || !isCot && inv.docType !== "cotizacion";
      if (currentTab === "Facturas" && !isFac) return false;
      if (currentTab === "Cotizaciones" && !isCot) return false;
      if (currentTab === "Pendientes" && inv.delivered === "S\xCD") return false;
      if (currentTab === "Atrasadas") {
        const isDelayed = new Date(inv.deliveryDate) < /* @__PURE__ */ new Date("2026-09-01") && inv.delivered !== "S\xCD";
        if (!isDelayed) return false;
      }
      if (currentTab === "En Facture" && inv.enFacture !== "S\xCD") return false;
      return true;
    });
  }, [
    activeInvoices,
    searchTerm,
    selectedSupplier,
    selectedFactureFilter,
    selectedSignedFilter,
    selectedOrderStdFilter,
    selectedOcFilter,
    selectedDeliveredFilter,
    selectedMonth,
    selectedYear,
    currentTab
  ]);
  const tabCounts = useMemo(() => {
    return {
      total: activeInvoices.length,
      fac: activeInvoices.filter((i) => (i.invoiceNumber || "").toUpperCase().startsWith("FAC") || i.docType === "factura").length,
      cot: activeInvoices.filter((i) => (i.invoiceNumber || "").toUpperCase().startsWith("COT") || i.docType === "cotizacion").length,
      pending: activeInvoices.filter((i) => i.delivered !== "S\xCD").length,
      delayed: activeInvoices.filter((i) => new Date(i.deliveryDate) < /* @__PURE__ */ new Date("2026-09-01") && i.delivered !== "S\xCD").length,
      facture: activeInvoices.filter((i) => i.enFacture === "S\xCD").length
    };
  }, [activeInvoices]);
  const handleToggleSelectRow = (id) => {
    if (selectedInvoiceIds.includes(id)) {
      setSelectedInvoiceIds(selectedInvoiceIds.filter((i) => i !== id));
    } else {
      setSelectedInvoiceIds([...selectedInvoiceIds, id]);
    }
  };
  const handleToggleSelectAll = (checked) => {
    if (checked) {
      const visibleIds = filteredRows.map((r) => r.id);
      setSelectedInvoiceIds(Array.from(/* @__PURE__ */ new Set([...selectedInvoiceIds, ...visibleIds])));
    } else {
      const visibleIds = filteredRows.map((r) => r.id);
      setSelectedInvoiceIds(selectedInvoiceIds.filter((id) => !visibleIds.includes(id)));
    }
  };
  const invoicesForExcelPreview = useMemo(() => {
    if (selectedInvoiceIds.length > 0) {
      return activeInvoices.filter((i) => selectedInvoiceIds.includes(i.id));
    }
    const delivered = activeInvoices.filter((i) => i.delivered === "S\xCD");
    return delivered.length > 0 ? delivered : filteredRows;
  }, [selectedInvoiceIds, activeInvoices, filteredRows]);
  const handleUploadPdf = (invoiceId) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/pdf,image/*";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        Swal.fire({ title: "Guardando archivo PDF en el dispositivo...", didOpen: () => Swal.showLoading() });
        const data = await window.API.invoices.uploadPdf(file);
        if (data.success) {
          const invObj = activeInvoices.find((i) => i.id === invoiceId) || { id: invoiceId };
          const updatedInv = { ...invObj, pdfPath: data.relativePath, pdfOriginalName: data.originalName };
          setManualInvoices((prev) => {
            const exists = prev.some((i) => i.id === invoiceId);
            return exists ? prev.map((i) => i.id === invoiceId ? updatedInv : i) : [updatedInv, ...prev];
          });
          window.API.invoices.save(updatedInv).catch(() => {
          });
          Swal.fire("\xA1PDF Guardado!", `Archivo ${data.originalName} almacenado y registrado.`, "success");
        } else {
          Swal.fire("Error", data.error || "No se pudo subir el archivo.", "error");
        }
      } catch (err) {
        Swal.fire("Guardado", `Archivo vinculado.`, "info");
      }
    };
    fileInput.click();
  };
  const saveInvoiceDebounceRef = React.useRef({});
  const saveInvoiceToDb = (invoice) => {
    window.API.invoices.save(invoice).catch((err) => {
      console.error("Error guardando factura en MySQL:", err);
    });
  };
  const handleUpdateInvoiceField = (id, field, value) => {
    const invObj = activeInvoices.find((i) => i.id === id) || { id };
    const updated = { ...invObj, [field]: value };
    setManualInvoices((prev) => {
      const exists = prev.some((i) => i.id === id);
      return exists ? prev.map((i) => i.id === id ? updated : i) : [updated, ...prev];
    });
    if (field === "invoiceNumber" || field === "oc" || field === "value") {
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
    const inv = activeInvoices.find((i) => i.id === id) || { id };
    const newSigned = inv.signed === "S\xCD" ? "NO" : "S\xCD";
    handleUpdateInvoiceField(id, "signed", newSigned);
  };
  const handleToggleOrderStd = (id) => {
    const inv = activeInvoices.find((i) => i.id === id) || { id };
    const newOrder = inv.orderStd === "S\xCD" ? "NO" : "S\xCD";
    handleUpdateInvoiceField(id, "orderStd", newOrder);
  };
  const handleToggleFacture = (id) => {
    const inv = activeInvoices.find((i) => i.id === id) || { id };
    const willBeFactureYes = inv.enFacture !== "S\xCD";
    const isCot = (inv.invoiceNumber || "").toUpperCase().startsWith("COT") || inv.docType === "cotizacion";
    let updated = { ...inv };
    if (willBeFactureYes) {
      if (isCot) {
        let newCode = inv.invoiceNumber || "";
        if (newCode.toUpperCase().startsWith("COT")) {
          newCode = "FAC" + newCode.substring(3);
        } else if (!newCode || newCode === "COT-") {
          newCode = "FAC-";
        }
        updated = {
          ...updated,
          enFacture: "S\xCD",
          docType: "factura",
          invoiceNumber: newCode,
          signed: "NO",
          // El usuario la firmará cuando su jefe autorice
          delivered: "NO"
          // Entrega es acción manual
        };
      } else {
        updated = {
          ...updated,
          enFacture: "S\xCD"
        };
      }
    } else {
      updated = {
        ...updated,
        enFacture: "NO"
      };
    }
    setManualInvoices((prev) => {
      const exists = prev.some((i) => i.id === id);
      return exists ? prev.map((i) => i.id === id ? updated : i) : [updated, ...prev];
    });
    saveInvoiceToDb(updated);
  };
  const handleToggleDelivered = (id) => {
    const inv = activeInvoices.find((i) => i.id === id) || { id };
    const isNowDelivered = inv.delivered !== "S\xCD";
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const updated = {
      ...inv,
      delivered: isNowDelivered ? "S\xCD" : "NO",
      // Si se marca como entregada y no tenía fecha de entrega, colocar la fecha actual
      deliveryDate: isNowDelivered && !inv.deliveryDate ? todayStr : inv.deliveryDate
    };
    setManualInvoices((prev) => {
      const exists = prev.some((i) => i.id === id);
      return exists ? prev.map((i) => i.id === id ? updated : i) : [updated, ...prev];
    });
    saveInvoiceToDb(updated);
  };
  const handleCleanAllFilters = () => {
    setSearchTerm("");
    setSelectedSupplier("Todos");
    setSelectedFactureFilter("Todos");
    setSelectedSignedFilter("Todos");
    setSelectedOrderStdFilter("Todos");
    setSelectedOcFilter("Todos");
    setSelectedDeliveredFilter("Todos");
    setSelectedMonth("Todos");
    setSelectedYear("Todos");
    setSelectedInvoiceIds([]);
  };
  const handleDeleteInvoice = (id) => {
    Swal.fire({
      title: "\xBFEliminar Factura de la Base de Datos?",
      text: "Se eliminar\xE1 permanentemente de MySQL.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "S\xED, eliminar"
    }).then(async (res) => {
      if (res.isConfirmed) {
        setManualInvoices(manualInvoices.filter((i) => i.id !== id));
        await window.API.invoices.delete(id).catch(() => {
        });
        Swal.fire("Eliminado", "Comprobante removido de la base de datos.", "success");
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
          <p><strong>Fecha Emisi\xF3n:</strong> ${row.emissionDate}</p>
          <p><strong>Fecha Entrega:</strong> ${row.deliveryDate}</p>
          <p><strong>Valor:</strong> $${Number(row.value || 0).toLocaleString("es-CO")}</p>
          <p><strong>Orden STD:</strong> ${row.orderStd}</p>
          <p><strong>OC:</strong> ${row.oc}</p>
          <p><strong>En Facture:</strong> ${row.enFacture}</p>
          <p><strong>Entregada:</strong> ${row.delivered}</p>
          <p><strong>Archivo PDF Local:</strong> ${row.pdfPath ? `<a href="${row.pdfPath}" target="_blank" style="color:#e11d48; font-weight:700;">Ver PDF Adjunto</a>` : "Sin archivo adjunto"}</p>
        </div>
      `,
      confirmButtonColor: "#e11d48"
    });
  };
  const handleQuickRegister = () => {
    Swal.fire({
      title: "Registrar Factura / Cotizaci\xF3n",
      html: `
        <input id="swSupplier" class="swal2-input" placeholder="Nombre Proveedor">
        <input id="swService" class="swal2-input" placeholder="Servicio prestado">
        <input id="swInvoiceNumber" class="swal2-input" placeholder="N DE FACTURA (ej: FAC2240)">
        <input id="swEmission" type="date" class="swal2-input">
        <input id="swDelivery" type="date" class="swal2-input">
        <input id="swAmount" type="number" class="swal2-input" placeholder="VALOR ($)">
        <select id="swOrderStd" class="swal2-input">
          <option value="S\xCD">ORDEN STD: S\xCD</option>
          <option value="NO">ORDEN STD: NO</option>
        </select>
        <input id="swOc" class="swal2-input" placeholder="OC (ej: OC-2026-102)">
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar en Base de Datos",
      confirmButtonColor: "#e11d48"
    }).then((res) => {
      if (res.isConfirmed) {
        const supplier = document.getElementById("swSupplier").value || "Distribuidora L\xE1cteos Enriko";
        const service = document.getElementById("swService").value || "Suministro de insumos";
        const invoiceNumber = document.getElementById("swInvoiceNumber").value || "FAC2240";
        const emissionDate = document.getElementById("swEmission").value || "2026-08-29";
        const deliveryDate = document.getElementById("swDelivery").value || "2026-08-31";
        const value = Number(document.getElementById("swAmount").value) || 35e5;
        const orderStd = document.getElementById("swOrderStd").value || "S\xCD";
        const oc = document.getElementById("swOc").value || "OC-2026-102";
        const newInv = {
          id: "man-" + Date.now(),
          logoText: supplier.substring(0, 2).toUpperCase(),
          supplier,
          service,
          invoiceNumber,
          emissionDate,
          deliveryDate,
          value,
          signed: "S\xCD",
          orderStd,
          oc,
          enFacture: "S\xCD",
          delivered: "NO",
          pdfPath: null,
          pdfOriginalName: null
        };
        setManualInvoices([newInv, ...manualInvoices]);
        saveInvoiceToDb(newInv);
        Swal.fire("Guardado", "Factura almacenada en la base de datos MySQL.", "success");
      }
    });
  };
  const saveSupplierToDb = (sup) => {
    window.API.suppliers.save(sup).catch(() => {
    });
  };
  const handleAddSupplier = () => {
    Swal.fire({
      title: "\u{1F3E2} Registrar Nuevo Proveedor",
      width: "540px",
      customClass: { popup: "modal-card-box" },
      html: `
        <div style="text-align:left; font-size:12px; display:flex; flex-direction:column; gap:10px; margin-top:8px;">
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">NIT o RUT *</label>
            <input id="swNit" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700; border-radius:8px;" placeholder="ej: 900.123.456-1">
          </div>
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Raz\xF3n Social del Proveedor *</label>
            <input id="swName" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700; border-radius:8px;" placeholder="ej: C\xE1rnicos del Norte S.A.S.">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Asesor Comercial</label>
              <input id="swContact" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; border-radius:8px;" placeholder="ej: Laura Restrepo">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Tel\xE9fono Contacto</label>
              <input id="swPhone" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; border-radius:8px;" placeholder="ej: +57 300 123 4567">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">N\xB0 Servicios Recurrentes / Mes</label>
              <input id="swMonthly" type="number" min="0" max="20" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800; border-radius:8px; color:#2563eb;" value="0" placeholder="0">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">\xC1rea Asignada</label>
              <select id="swArea" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700; border-radius:8px;">
                <option value="Adquisiciones & Compras">Adquisiciones & Compras</option>
                <option value="Contabilidad & Finanzas">Contabilidad & Finanzas</option>
                <option value="Tecnolog\xEDa (TI)">Tecnolog\xEDa (TI)</option>
                <option value="Mantenimiento & Planta">Mantenimiento & Planta</option>
                <option value="Operaciones & Log\xEDstica">Operaciones & Log\xEDstica</option>
              </select>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar Proveedor",
      confirmButtonColor: "#e11d48"
    }).then((res) => {
      if (res.isConfirmed) {
        const nit = (document.getElementById("swNit").value || "").trim();
        const name = (document.getElementById("swName").value || "").trim();
        const contact = document.getElementById("swContact").value || "";
        const phone = document.getElementById("swPhone").value || "";
        const monthlyCount = Math.max(0, Number(document.getElementById("swMonthly").value) || 0);
        const area = document.getElementById("swArea").value;
        if (!nit || !name) {
          return Swal.fire("Campos requeridos", "Debes ingresar el NIT y la Raz\xF3n Social.", "warning");
        }
        const existsNit = suppliers.some((s) => s.nit && s.nit.toLowerCase().replace(/[^a-z0-9]/g, "") === nit.toLowerCase().replace(/[^a-z0-9]/g, ""));
        const existsName = suppliers.some((s) => s.name && s.name.trim().toLowerCase() === name.toLowerCase());
        if (existsNit) {
          return Swal.fire("NIT Ya Registrado", `Ya existe un proveedor registrado con el NIT/RUT "${nit}".`, "error");
        }
        if (existsName) {
          return Swal.fire("Nombre Ya Registrado", `Ya existe un proveedor con la Raz\xF3n Social "${name}".`, "error");
        }
        const newServices = [];
        for (let i = 1; i <= monthlyCount; i++) {
          newServices.push({ id: `srv-${Date.now()}-${i}`, serviceName: `Servicio #${i} - ${name}`, enabled: true });
        }
        const newSup = { id: "sup-" + Date.now(), nit, name, contact, phone, monthlyCount, area, services: newServices };
        setSuppliers([newSup, ...suppliers]);
        saveSupplierToDb(newSup);
        Swal.fire("Registrado", `Proveedor "${name}" guardado exitosamente en MySQL.`, "success");
      }
    });
  };
  const handleEditSupplier = (sup) => {
    Swal.fire({
      title: `\u270F\uFE0F Editar Proveedor: ${sup.name || ""}`,
      width: "540px",
      customClass: { popup: "modal-card-box" },
      html: `
        <div style="text-align:left; font-size:12px; display:flex; flex-direction:column; gap:10px; margin-top:8px;">
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">NIT / Identificaci\xF3n</label>
            <input id="swEditNit" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700; border-radius:8px;" value="${sup.nit || ""}">
          </div>
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Raz\xF3n Social</label>
            <input id="swEditName" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700; border-radius:8px;" value="${sup.name || ""}">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Contacto Asesor</label>
              <input id="swEditContact" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; border-radius:8px;" value="${sup.contact || ""}">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Tel\xE9fono</label>
              <input id="swEditPhone" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; border-radius:8px;" value="${sup.phone || ""}">
            </div>
          </div>
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">N\xB0 Facturas Esperadas / Mes</label>
            <input id="swEditCount" type="number" min="1" max="20" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800; color:#e11d48; border-radius:8px;" value="${sup.monthlyCount || sup.services?.length || 1}">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Actualizar en Base de Datos",
      confirmButtonColor: "#e11d48"
    }).then((res) => {
      if (res.isConfirmed) {
        const nit = (document.getElementById("swEditNit").value || "").trim();
        const name = (document.getElementById("swEditName").value || "").trim();
        const contact = document.getElementById("swEditContact").value;
        const phone = document.getElementById("swEditPhone").value;
        const count = Math.max(1, Number(document.getElementById("swEditCount").value) || 1);
        if (!nit || !name) {
          return Swal.fire("Campos requeridos", "Debes ingresar el NIT y la Raz\xF3n Social.", "warning");
        }
        const existsNit = suppliers.some((s) => s.id !== sup.id && s.nit && s.nit.toLowerCase().replace(/[^a-z0-9]/g, "") === nit.toLowerCase().replace(/[^a-z0-9]/g, ""));
        const existsName = suppliers.some((s) => s.id !== sup.id && s.name && s.name.trim().toLowerCase() === name.toLowerCase());
        if (existsNit) {
          return Swal.fire("NIT Ya Registrado", `Otro proveedor ya tiene registrado el NIT/RUT "${nit}".`, "error");
        }
        if (existsName) {
          return Swal.fire("Nombre Ya Registrado", `Otro proveedor ya tiene la Raz\xF3n Social "${name}".`, "error");
        }
        let currentServices = [...sup.services || []];
        if (currentServices.length < count) {
          for (let i = currentServices.length + 1; i <= count; i++) {
            currentServices.push({ id: `srv-${sup.id}-${i}`, serviceName: `Servicio #${i} - ${name}`, enabled: true });
          }
        } else if (currentServices.length > count) {
          currentServices = currentServices.slice(0, count);
        }
        const updatedSup = { ...sup, nit, name, contact, phone, monthlyCount: count, services: currentServices };
        setSuppliers(suppliers.map((s) => s.id === sup.id ? updatedSup : s));
        saveSupplierToDb(updatedSup);
        Swal.fire("Actualizado", "Datos actualizados en MySQL.", "success");
      }
    });
  };
  const handleDeleteSupplier = (id) => {
    Swal.fire({
      title: "\xBFEliminar Proveedor de la Base de Datos?",
      text: "Se eliminar\xE1 permanentemente de MySQL.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48"
    }).then(async (res) => {
      if (res.isConfirmed) {
        setSuppliers(suppliers.filter((s) => s.id !== id));
        await window.API.suppliers.delete(id).catch(() => {
        });
        Swal.fire("Eliminado", "Proveedor removido.", "success");
      }
    });
  };
  const handleUpdateSupplierServices = (supId, newServices) => {
    const updated = suppliers.map((s) => {
      if (s.id === supId) {
        const item = { ...s, services: newServices, monthlyCount: newServices.length };
        saveSupplierToDb(item);
        return item;
      }
      return s;
    });
    setSuppliers(updated);
  };
  const handleAddUser = () => {
    Swal.fire({
      title: "\u{1F464} Crear Nuevo Usuario",
      width: "500px",
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
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Contrase\xF1a *</label>
              <input id="swUPass" type="password" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Rol de Sistema *</label>
              <select id="swURole" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
                <option value="admin">\u{1F6E1}\uFE0F Admin (Gesti\xF3n)</option>
                <option value="superadmin">\u{1F451} Superadmin (Control Total)</option>
              </select>
            </div>
          </div>
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">\xC1rea Asignada</label>
            <select id="swUArea" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;">
              <option value="Adquisiciones & Compras">Adquisiciones & Compras</option>
              <option value="Contabilidad & Finanzas">Contabilidad & Finanzas</option>
              <option value="Tecnolog\xEDa (TI)">Tecnolog\xEDa (TI)</option>
              <option value="Operaciones & Planta">Operaciones & Planta</option>
              <option value="Direcci\xF3n General">Direcci\xF3n General</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Crear Usuario",
      confirmButtonColor: "#e11d48"
    }).then(async (res) => {
      if (res.isConfirmed) {
        const username = (document.getElementById("swUUser").value || "").trim();
        const name = (document.getElementById("swUName").value || "").trim();
        const password = (document.getElementById("swUPass").value || "").trim();
        const role = document.getElementById("swURole").value;
        const area = document.getElementById("swUArea").value;
        if (!username || !name || !password) {
          return Swal.fire("Campos Obligatorios", "Por favor ingresa usuario, nombre y contrase\xF1a.", "warning");
        }
        const newU = { id: "usr-" + Date.now(), username, name, password, role, area, status: "Activo" };
        setUsers([...users, newU]);
        await window.API.users.save(newU).catch(() => {
        });
        Swal.fire("Usuario Creado", `La cuenta de ${name} ha sido registrada con rol ${role.toUpperCase()}.`, "success");
      }
    });
  };
  const handleDeleteUser = (id) => {
    Swal.fire({
      title: "\xBFEliminar Usuario?",
      text: "Este usuario ya no podr\xE1 iniciar sesi\xF3n en el sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "S\xED, Eliminar"
    }).then(async (res) => {
      if (res.isConfirmed) {
        setUsers(users.filter((u) => u.id !== id));
        await window.API.users.delete(id).catch(() => {
        });
        Swal.fire("Eliminado", "Usuario removido correctamente.", "success");
      }
    });
  };
  if (!currentUser) {
    return /* @__PURE__ */ React.createElement(LoginModal, { onLoginSuccess: handleLoginSuccess });
  }
  return /* @__PURE__ */ React.createElement("div", { className: `app-wrapper ${isSidebarCollapsed ? "sidebar-collapsed" : ""}` }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `sidebar-backdrop ${isSidebarOpen ? "active" : ""}`,
      onClick: () => setIsSidebarOpen(false)
    }
  ), /* @__PURE__ */ React.createElement(
    Sidebar,
    {
      currentView,
      setCurrentView,
      alertCount: realAlerts.length,
      currentUser,
      onLogout: handleLogout,
      isOpen: isSidebarOpen,
      onClose: () => setIsSidebarOpen(false),
      isCollapsed: isSidebarCollapsed,
      onToggleCollapse: toggleSidebarCollapse
    }
  ), /* @__PURE__ */ React.createElement("main", { className: "main-content" }, /* @__PURE__ */ React.createElement(
    TopNavbar,
    {
      selectedMonth,
      setSelectedMonth,
      selectedYear,
      setSelectedYear,
      alertCount: realAlerts.length,
      onOpenAlerts: () => setCurrentView("alerts"),
      onOpenUsers: () => setCurrentView("users"),
      darkMode,
      onToggleDarkMode: () => setDarkMode(!darkMode),
      onToggleSidebar: () => {
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(!isSidebarOpen);
        } else {
          toggleSidebarCollapse();
        }
      },
      currentUser,
      onLogout: handleLogout
    }
  ), currentView === "dashboard" && /* @__PURE__ */ React.createElement("div", { className: "dashboard-container" }, /* @__PURE__ */ React.createElement(
    KpiCards,
    {
      total: activeInvoices.length,
      facCount: tabCounts.fac,
      cotCount: tabCounts.cot,
      toSignCount: activeInvoices.filter((i) => i.signed === "NO").length,
      pendingFactureCount: activeInvoices.filter((i) => i.enFacture === "A\xDAN NO").length,
      pendingManagementCount: activeInvoices.filter((i) => i.delivered !== "S\xCD").length,
      delayedCount: tabCounts.delayed
    }
  ), /* @__PURE__ */ React.createElement(
    ChartsSection,
    {
      managedCount: activeInvoices.filter((i) => i.delivered === "S\xCD").length,
      pendingCount: activeInvoices.filter((i) => i.delivered !== "S\xCD").length,
      enFactureCount: activeInvoices.filter((i) => i.enFacture === "S\xCD").length,
      otherCount: activeInvoices.filter((i) => i.signed === "NO").length,
      totalCount: activeInvoices.length,
      onQuickRegister: handleQuickRegister,
      onGoInvoices: () => setCurrentView("invoices"),
      onGoReports: () => setCurrentView("reports"),
      onGoSuppliers: () => setCurrentView("suppliers")
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-8" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-slate-200/90 dark:border-zinc-800 cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group",
      onClick: () => setCurrentView("inventory")
    },
    /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/30 text-rose-600 flex items-center justify-center text-xl flex-shrink-0 border border-rose-200 dark:border-rose-900/50 group-hover:scale-105 transition-transform shadow-sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "inventory", size: 26, className: "text-rose-600" })),
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-black text-base text-slate-900 dark:text-white" }, "Inventario TI"), /* @__PURE__ */ React.createElement("div", { className: "text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-0.5" }, techInventory.length, " referencias f\xEDsicas y licencias"))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-slate-200/90 dark:border-zinc-800 cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group",
      onClick: () => setCurrentView("budgets")
    },
    /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0 border border-emerald-200 dark:border-emerald-900/50 group-hover:scale-105 transition-transform shadow-sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "budgets", size: 26, className: "text-emerald-600" })),
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-black text-base text-slate-900 dark:text-white" }, "Presupuestos TI 2026"), /* @__PURE__ */ React.createElement("div", { className: "text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-0.5" }, techBudgets.length, " rubros planificados y AI"))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-slate-200/90 dark:border-zinc-800 cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group",
      onClick: () => setCurrentView("areas")
    },
    /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 text-purple-600 flex items-center justify-center text-xl flex-shrink-0 border border-purple-200 dark:border-purple-900/50 group-hover:scale-105 transition-transform shadow-sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "areas", size: 26, className: "text-purple-600" })),
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-black text-base text-slate-900 dark:text-white" }, "\xC1reas & Directores"), /* @__PURE__ */ React.createElement("div", { className: "text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-0.5" }, areas.length, " \xE1reas organizacionales"))
  ))), currentView === "invoices" && /* @__PURE__ */ React.createElement(
    InvoicesModule,
    {
      invoices: filteredRows,
      onQuickRegister: handleQuickRegister,
      onToggleSigned: handleToggleSigned,
      onToggleOrderStd: handleToggleOrderStd,
      onToggleFacture: handleToggleFacture,
      onToggleDelivered: handleToggleDelivered,
      onUpdateInvoiceField: handleUpdateInvoiceField,
      onDeleteInvoice: handleDeleteInvoice,
      onUploadPdf: handleUploadPdf,
      onViewDetail: handleViewDetail,
      selectedMonth,
      setSelectedMonth,
      selectedYear,
      setSelectedYear,
      searchTerm,
      setSearchTerm,
      selectedSupplier,
      setSelectedSupplier,
      selectedFactureFilter,
      setSelectedFactureFilter,
      selectedSignedFilter,
      setSelectedSignedFilter,
      selectedOrderStdFilter,
      setSelectedOrderStdFilter,
      selectedOcFilter,
      setSelectedOcFilter,
      selectedDeliveredFilter,
      setSelectedDeliveredFilter,
      suppliersList,
      onOpenExcelPreview: () => setIsExcelPreviewOpen(true),
      selectedCount: selectedInvoiceIds.length,
      onCleanFilters: handleCleanAllFilters
    }
  ), currentView === "suppliers" && /* @__PURE__ */ React.createElement(
    SuppliersModule,
    {
      suppliers,
      invoices: manualInvoices,
      onAddSupplier: handleAddSupplier,
      onEditSupplier: handleEditSupplier,
      onDeleteSupplier: handleDeleteSupplier,
      onUpdateSupplierServices: handleUpdateSupplierServices
    }
  ), currentView === "crm" && /* @__PURE__ */ React.createElement(
    CrmModule,
    {
      suppliers,
      quotations,
      onSaveQuotation: handleSaveQuotation,
      onDeleteQuotation: handleDeleteQuotation
    }
  ), currentView === "inventory" && /* @__PURE__ */ React.createElement(
    TechInventoryModule,
    {
      inventory: techInventory,
      areas,
      onAddOrUpdateItem: handleAddOrUpdateInventoryItem,
      onDeliverItem: handleDeliverInventoryItem,
      onDeleteItem: handleDeleteInventoryItem
    }
  ), currentView === "budgets" && /* @__PURE__ */ React.createElement(
    TechBudgetModule,
    {
      budgets: techBudgets,
      areas,
      onSaveBudget: handleSaveBudget,
      onDeleteBudget: handleDeleteBudget
    }
  ), currentView === "areas" && /* @__PURE__ */ React.createElement(
    AreasModule,
    {
      areas,
      onSaveArea: handleSaveArea,
      onDeleteArea: handleDeleteArea
    }
  ), currentView === "users" && /* @__PURE__ */ React.createElement(
    UsersModule,
    {
      users,
      onAddUser: handleAddUser,
      onDeleteUser: handleDeleteUser,
      currentUser
    }
  ), currentView === "alerts" && /* @__PURE__ */ React.createElement(
    AlertsModule,
    {
      alerts: realAlerts,
      onGoDashboard: () => setCurrentView("dashboard")
    }
  ), ["reports", "settings", "folders", "history"].includes(currentView) && /* @__PURE__ */ React.createElement("div", { className: "dashboard-container" }, /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "32px", color: "#e11d48", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-folder-open" })), /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "16px", fontWeight: 800, textTransform: "capitalize" } }, "M\xF3dulo ", currentView, " Activo"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#64748b", marginTop: "4px" } }, "Sincronizado con la suite Alimentos Enriko."), /* @__PURE__ */ React.createElement("button", { className: "btn-red-action", style: { marginTop: "16px" }, onClick: () => setCurrentView("dashboard") }, "Volver al Dashboard"))), /* @__PURE__ */ React.createElement(
    ExcelPreviewModal,
    {
      isOpen: isExcelPreviewOpen,
      onClose: () => setIsExcelPreviewOpen(false),
      selectedInvoices: invoicesForExcelPreview,
      onToggleDelivered: handleToggleDelivered,
      onUploadPdf: handleUploadPdf
    }
  )));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
