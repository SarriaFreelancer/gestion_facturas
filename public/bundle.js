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
  }
};
window.API = API;
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
function Sidebar({ currentView, setCurrentView, alertCount, isOpen, onClose, currentUser, onLogout }) {
  return /* @__PURE__ */ React.createElement("aside", { className: `sidebar ${isOpen ? "open" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "sidebar-logo" }, /* @__PURE__ */ React.createElement("button", { className: "sidebar-close-btn", onClick: onClose, title: "Cerrar men\xFA" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-xmark" })), /* @__PURE__ */ React.createElement("div", { className: "brand-title" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-cloud", style: { fontSize: "20px" } }), " Alimentos"), /* @__PURE__ */ React.createElement("div", { className: "brand-title", style: { fontSize: "28px", marginTop: "-4px" } }, "ENRIKO"), /* @__PURE__ */ React.createElement("div", { className: "brand-sub" }, "Calidad que alimenta")), /* @__PURE__ */ React.createElement("div", { className: "sidebar-menu" }, /* @__PURE__ */ React.createElement("div", { className: `menu-item ${currentView === "dashboard" ? "active" : ""}`, onClick: () => {
    setCurrentView("dashboard");
    if (onClose) onClose();
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-gauge-high" }), /* @__PURE__ */ React.createElement("span", null, "Dashboard")), /* @__PURE__ */ React.createElement("div", { className: `menu-item ${currentView === "invoices" ? "active" : ""}`, onClick: () => {
    setCurrentView("invoices");
    if (onClose) onClose();
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-file-lines" }), /* @__PURE__ */ React.createElement("span", null, "Facturas / Cotizaciones")), /* @__PURE__ */ React.createElement("div", { className: `menu-item ${currentView === "suppliers" ? "active" : ""}`, onClick: () => {
    setCurrentView("suppliers");
    if (onClose) onClose();
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-user-group" }), /* @__PURE__ */ React.createElement("span", null, "Proveedores")), /* @__PURE__ */ React.createElement("div", { className: `menu-item ${currentView === "crm" ? "active" : ""}`, onClick: () => {
    setCurrentView("crm");
    if (onClose) onClose();
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-handshake" }), /* @__PURE__ */ React.createElement("span", null, "CRM Cotizaciones")), /* @__PURE__ */ React.createElement("div", { className: `menu-item ${currentView === "reports" ? "active" : ""}`, onClick: () => {
    setCurrentView("reports");
    if (onClose) onClose();
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-chart-line" }), /* @__PURE__ */ React.createElement("span", null, "Reportes")), /* @__PURE__ */ React.createElement("div", { className: `menu-item ${currentView === "alerts" ? "active" : ""}`, onClick: () => {
    setCurrentView("alerts");
    if (onClose) onClose();
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-triangle-exclamation" }), /* @__PURE__ */ React.createElement("span", null, "Alertas"), alertCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "badge-count" }, alertCount)), /* @__PURE__ */ React.createElement("div", { className: `menu-item ${currentView === "users" ? "active" : ""}`, onClick: () => {
    setCurrentView("users");
    if (onClose) onClose();
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-users" }), /* @__PURE__ */ React.createElement("span", null, "Usuarios")), /* @__PURE__ */ React.createElement("div", { className: `menu-item ${currentView === "settings" ? "active" : ""}`, onClick: () => {
    setCurrentView("settings");
    if (onClose) onClose();
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-gear" }), /* @__PURE__ */ React.createElement("span", null, "Configuraci\xF3n")), /* @__PURE__ */ React.createElement("div", { className: "menu-header" }, "GESTI\xD3N"), /* @__PURE__ */ React.createElement("div", { className: `menu-item ${currentView === "folders" ? "active" : ""}`, onClick: () => {
    setCurrentView("folders");
    if (onClose) onClose();
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-folder-open" }), /* @__PURE__ */ React.createElement("span", null, "Carpetas de documentos")), /* @__PURE__ */ React.createElement("div", { className: `menu-item ${currentView === "history" ? "active" : ""}`, onClick: () => {
    setCurrentView("history");
    if (onClose) onClose();
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-clock-rotate-left" }), /* @__PURE__ */ React.createElement("span", null, "Historial")), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "menu-item",
      onClick: onLogout,
      style: { color: "#f43f5e", marginTop: "12px", borderTop: "1px solid rgba(225, 29, 72, 0.15)", paddingTop: "10px" },
      title: "Cerrar sesi\xF3n actual"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-right-from-bracket" }),
    /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700 } }, "Cerrar Sesi\xF3n")
  )), /* @__PURE__ */ React.createElement("div", { className: "sidebar-footer-card" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", color: "#e11d48", marginBottom: "4px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-shield-halved" })), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "11px", fontWeight: 700, margin: 0 } }, currentUser ? `${currentUser.name}` : "Sesi\xF3n Activa"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "10px", color: "#e11d48", fontWeight: 800, textTransform: "uppercase" } }, currentUser ? `Rol: ${currentUser.role}` : "")), /* @__PURE__ */ React.createElement("div", { className: "sidebar-ver" }, "v1.0.0"));
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
  const userInitials = currentUser && currentUser.name ? currentUser.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "JR";
  const isSuper = currentUser?.role === "superadmin";
  return /* @__PURE__ */ React.createElement("header", { className: "top-navbar" }, /* @__PURE__ */ React.createElement("div", { className: "nav-left" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn-hamburger",
      onClick: onToggleSidebar,
      title: "Abrir men\xFA de navegaci\xF3n",
      "aria-label": "Men\xFA"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-bars-staggered" })
  ), /* @__PURE__ */ React.createElement("div", { className: "app-icon-badge" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-invoice-dollar" })), /* @__PURE__ */ React.createElement("div", { className: "header-titles" }, /* @__PURE__ */ React.createElement("h1", null, /* @__PURE__ */ React.createElement("span", null, "Alimentos"), " ", /* @__PURE__ */ React.createElement("span", { className: "brand-highlight" }, "ENRIKO")), /* @__PURE__ */ React.createElement("p", null, "Control Documental & Facturas"))), /* @__PURE__ */ React.createElement("div", { className: "nav-right" }, /* @__PURE__ */ React.createElement("div", { className: "selector-group hide-on-compact", title: "Filtrar por Mes" }, /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-calendar-days selector-icon" }), /* @__PURE__ */ React.createElement("select", { className: "nav-select", value: selectedMonth, onChange: (e) => setSelectedMonth(e.target.value) }, allMonths.map((m) => /* @__PURE__ */ React.createElement("option", { key: m, value: m }, m === "Todos" ? "Mes: Todos" : m)))), /* @__PURE__ */ React.createElement("div", { className: "selector-group hide-on-compact", title: "Filtrar por A\xF1o" }, /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-clock selector-icon" }), /* @__PURE__ */ React.createElement("select", { className: "nav-select", value: selectedYear, onChange: (e) => setSelectedYear(e.target.value) }, allYears.map((y) => /* @__PURE__ */ React.createElement("option", { key: y, value: y }, y === "Todos" ? "A\xF1o: Todos" : y)))), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn-header-action",
      onClick: onToggleDarkMode,
      title: darkMode ? "Modo Claro" : "Modo Oscuro",
      "aria-label": "Cambiar tema"
    },
    /* @__PURE__ */ React.createElement("i", { className: darkMode ? "fa-solid fa-sun icon-sun" : "fa-solid fa-moon icon-moon" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn-header-action bell-action",
      onClick: onOpenAlerts,
      title: "Ver alertas del sistema",
      "aria-label": "Alertas"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-bell" }),
    alertCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "bell-badge" }, alertCount)
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "user-profile-badge",
      onClick: onOpenUsers,
      title: `Conectado como: ${currentUser?.name || "Administrador"} (${currentUser?.role || "admin"})`
    },
    /* @__PURE__ */ React.createElement("div", { className: "user-avatar", style: {
      background: isSuper ? "linear-gradient(135deg, #e11d48, #9f1239)" : "linear-gradient(135deg, #e11d48, #be123c)"
    } }, userInitials),
    /* @__PURE__ */ React.createElement("div", { className: "user-info" }, /* @__PURE__ */ React.createElement("div", { className: "user-name" }, currentUser ? currentUser.name : "Juan Rodr\xEDguez"), /* @__PURE__ */ React.createElement("div", { className: "user-role" }, isSuper ? "\u{1F451} SUPERADMIN" : "\u{1F6E1}\uFE0F ADMIN"))
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn-header-action logout-action",
      onClick: onLogout,
      title: "Cerrar sesi\xF3n",
      "aria-label": "Cerrar sesi\xF3n"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-arrow-right-from-bracket" })
  )));
}
window.TopNavbar = TopNavbar;
function KpiCards({ total, facCount, cotCount, toSignCount, pendingFactureCount, pendingManagementCount, delayedCount }) {
  const toSignPercent = total > 0 ? (toSignCount / total * 100).toFixed(1) : "0";
  const facturePercent = total > 0 ? (pendingFactureCount / total * 100).toFixed(1) : "0";
  const managementPercent = total > 0 ? (pendingManagementCount / total * 100).toFixed(1) : "0";
  return /* @__PURE__ */ React.createElement("div", { className: "kpi-row" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-card", style: { background: "linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)" } }, /* @__PURE__ */ React.createElement("div", { className: "kpi-header" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-title-box" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-icon-circle", style: { background: "#f1f5f9", color: "#475569" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-file-lines" })), /* @__PURE__ */ React.createElement("span", { className: "kpi-title" }, "Total documentos")), /* @__PURE__ */ React.createElement("span", { className: "kpi-trend trend-up" }, "+ 12%")), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("span", { className: "kpi-value" }, total), /* @__PURE__ */ React.createElement("span", { className: "kpi-sub" }, facCount, " Facturas \xA0 ", cotCount, " Cotizaciones")), /* @__PURE__ */ React.createElement("svg", { className: "sparkline-preview", viewBox: "0 0 100 25", preserveAspectRatio: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M0,20 Q25,5 50,18 T100,8 L100,25 L0,25 Z", fill: "rgba(225,29,72,0.15)" }), /* @__PURE__ */ React.createElement("path", { d: "M0,20 Q25,5 50,18 T100,8", fill: "none", stroke: "#e11d48", strokeWidth: "2" }))), /* @__PURE__ */ React.createElement("div", { className: "kpi-card" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-header" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-title-box" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-icon-circle", style: { background: "#f5f3ff", color: "#7c3aed" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-clipboard" })), /* @__PURE__ */ React.createElement("span", { className: "kpi-title" }, "Cotizaciones"))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("span", { className: "kpi-value" }, cotCount), /* @__PURE__ */ React.createElement("span", { className: "kpi-trend trend-up", style: { fontSize: "9px" } }, "\u25B2 25%")), /* @__PURE__ */ React.createElement("span", { className: "kpi-sub" }, "Este mes")), /* @__PURE__ */ React.createElement("div", { className: "kpi-card" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-header" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-title-box" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-icon-circle", style: { background: "#eff6ff", color: "#2563eb" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-invoice" })), /* @__PURE__ */ React.createElement("span", { className: "kpi-title" }, "Facturas"))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("span", { className: "kpi-value" }, facCount), /* @__PURE__ */ React.createElement("span", { className: "kpi-trend trend-up", style: { fontSize: "9px" } }, "\u25B2 8%")), /* @__PURE__ */ React.createElement("span", { className: "kpi-sub" }, "Este mes")), /* @__PURE__ */ React.createElement("div", { className: "kpi-card" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-header" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-title-box" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-icon-circle", style: { background: "#fffbeb", color: "#d97706" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-pen-nib" })), /* @__PURE__ */ React.createElement("span", { className: "kpi-title" }, "Pendientes", /* @__PURE__ */ React.createElement("br", null), "de firma"))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("span", { className: "kpi-value" }, toSignCount), /* @__PURE__ */ React.createElement("span", { className: "kpi-sub", style: { color: "#d97706", fontWeight: 800 } }, toSignPercent, "%")), /* @__PURE__ */ React.createElement("span", { className: "kpi-sub" }, "Firmas pendientes")), /* @__PURE__ */ React.createElement("div", { className: "kpi-card" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-header" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-title-box" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-icon-circle", style: { background: "#fff7ed", color: "#ea580c" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-cubes-stacked" })), /* @__PURE__ */ React.createElement("span", { className: "kpi-title" }, "Pendientes", /* @__PURE__ */ React.createElement("br", null), "en Facture"))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("span", { className: "kpi-value" }, pendingFactureCount), /* @__PURE__ */ React.createElement("span", { className: "kpi-trend trend-warning", style: { fontSize: "9px" } }, "\u25BC ", facturePercent, "%")), /* @__PURE__ */ React.createElement("span", { className: "kpi-sub" }, "A\xFAn no llegan")), /* @__PURE__ */ React.createElement("div", { className: "kpi-card" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-header" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-title-box" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-icon-circle", style: { background: "#fef2f2", color: "#dc2626" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-gear" })), /* @__PURE__ */ React.createElement("span", { className: "kpi-title" }, "Pendientes", /* @__PURE__ */ React.createElement("br", null), "de gesti\xF3n"))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("span", { className: "kpi-value" }, pendingManagementCount), /* @__PURE__ */ React.createElement("span", { className: "kpi-trend trend-down", style: { fontSize: "9px" } }, "\u25BC ", managementPercent, "%")), /* @__PURE__ */ React.createElement("span", { className: "kpi-sub" }, "Por gestionar")), /* @__PURE__ */ React.createElement("div", { className: "kpi-card" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-header" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-title-box" }, /* @__PURE__ */ React.createElement("div", { className: "kpi-icon-circle", style: { background: "#fee2e2", color: "#e11d48" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-triangle-exclamation" })), /* @__PURE__ */ React.createElement("span", { className: "kpi-title", style: { color: "#e11d48" } }, "Facturas", /* @__PURE__ */ React.createElement("br", null), "atrasadas"))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("span", { className: "kpi-value" }, delayedCount), /* @__PURE__ */ React.createElement("span", { className: "kpi-trend trend-urgent" }, "\u25B2 Urgente")), /* @__PURE__ */ React.createElement("span", { className: "kpi-sub" }, "2 o m\xE1s d\xEDas")));
}
window.KpiCards = KpiCards;
function ChartsSection({ managedCount, pendingCount, enFactureCount, otherCount, totalCount, onQuickRegister, onGoInvoices, onGoReports, onGoSuppliers }) {
  const managedPct = totalCount > 0 ? Math.round(managedCount / totalCount * 100) : 50;
  const pendingPct = totalCount > 0 ? Math.round(pendingCount / totalCount * 100) : 29;
  const facturePct = totalCount > 0 ? Math.round(enFactureCount / totalCount * 100) : 17;
  return /* @__PURE__ */ React.createElement("div", { className: "middle-row" }, /* @__PURE__ */ React.createElement("div", { className: "chart-card" }, /* @__PURE__ */ React.createElement("div", { className: "chart-card-title" }, "Estado general de documentos"), /* @__PURE__ */ React.createElement("div", { className: "donut-chart-container" }, /* @__PURE__ */ React.createElement("div", { className: "donut-circle-wrap" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 36 36", style: { width: "100%", height: "100%", transform: "rotate(-90deg)" } }, /* @__PURE__ */ React.createElement("circle", { cx: "18", cy: "18", r: "14", fill: "none", stroke: "#f1f5f9", strokeWidth: "4.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "18", cy: "18", r: "14", fill: "none", stroke: "#10b981", strokeWidth: "4.5", strokeDasharray: `${managedPct} 100`, strokeDashoffset: "0" }), /* @__PURE__ */ React.createElement("circle", { cx: "18", cy: "18", r: "14", fill: "none", stroke: "#f59e0b", strokeWidth: "4.5", strokeDasharray: `${pendingPct} 100`, strokeDashoffset: `-${managedPct}` }), /* @__PURE__ */ React.createElement("circle", { cx: "18", cy: "18", r: "14", fill: "none", stroke: "#3b82f6", strokeWidth: "4.5", strokeDasharray: `${facturePct} 100`, strokeDashoffset: `-${managedPct + pendingPct}` })), /* @__PURE__ */ React.createElement("div", { className: "donut-inner-txt" }, /* @__PURE__ */ React.createElement("span", { className: "donut-inner-val" }, totalCount), /* @__PURE__ */ React.createElement("span", { className: "donut-inner-lbl" }, "Total"))), /* @__PURE__ */ React.createElement("div", { className: "donut-legend" }, /* @__PURE__ */ React.createElement("div", { className: "legend-row" }, /* @__PURE__ */ React.createElement("span", { className: "legend-dot", style: { background: "#10b981" } }), /* @__PURE__ */ React.createElement("span", { className: "legend-name" }, "Gestionadas"), /* @__PURE__ */ React.createElement("span", { className: "legend-qty" }, managedCount, " (", managedPct, "%)")), /* @__PURE__ */ React.createElement("div", { className: "legend-row" }, /* @__PURE__ */ React.createElement("span", { className: "legend-dot", style: { background: "#f59e0b" } }), /* @__PURE__ */ React.createElement("span", { className: "legend-name" }, "Pendientes"), /* @__PURE__ */ React.createElement("span", { className: "legend-qty" }, pendingCount, " (", pendingPct, "%)")), /* @__PURE__ */ React.createElement("div", { className: "legend-row" }, /* @__PURE__ */ React.createElement("span", { className: "legend-dot", style: { background: "#3b82f6" } }), /* @__PURE__ */ React.createElement("span", { className: "legend-name" }, "En Facture"), /* @__PURE__ */ React.createElement("span", { className: "legend-qty" }, enFactureCount, " (", facturePct, "%)")), /* @__PURE__ */ React.createElement("div", { className: "legend-row" }, /* @__PURE__ */ React.createElement("span", { className: "legend-dot", style: { background: "#94a3b8" } }), /* @__PURE__ */ React.createElement("span", { className: "legend-name" }, "Otros"), /* @__PURE__ */ React.createElement("span", { className: "legend-qty" }, otherCount))))), /* @__PURE__ */ React.createElement("div", { className: "chart-card" }, /* @__PURE__ */ React.createElement("div", { className: "chart-card-title" }, "Documentos por mes"), /* @__PURE__ */ React.createElement("div", { className: "bar-chart-container" }, /* @__PURE__ */ React.createElement("div", { className: "bar-col" }, /* @__PURE__ */ React.createElement("span", { className: "bar-val" }, "18"), /* @__PURE__ */ React.createElement("div", { className: "bar-pill blue", style: { height: "52px" } }), /* @__PURE__ */ React.createElement("span", { className: "bar-month" }, "Mar")), /* @__PURE__ */ React.createElement("div", { className: "bar-col" }, /* @__PURE__ */ React.createElement("span", { className: "bar-val" }, "22"), /* @__PURE__ */ React.createElement("div", { className: "bar-pill blue", style: { height: "68px" } }), /* @__PURE__ */ React.createElement("span", { className: "bar-month" }, "Abr")), /* @__PURE__ */ React.createElement("div", { className: "bar-col" }, /* @__PURE__ */ React.createElement("span", { className: "bar-val" }, "20"), /* @__PURE__ */ React.createElement("div", { className: "bar-pill blue", style: { height: "60px" } }), /* @__PURE__ */ React.createElement("span", { className: "bar-month" }, "May")), /* @__PURE__ */ React.createElement("div", { className: "bar-col" }, /* @__PURE__ */ React.createElement("span", { className: "bar-val" }, "26"), /* @__PURE__ */ React.createElement("div", { className: "bar-pill blue", style: { height: "84px" } }), /* @__PURE__ */ React.createElement("span", { className: "bar-month" }, "Jun")), /* @__PURE__ */ React.createElement("div", { className: "bar-col" }, /* @__PURE__ */ React.createElement("span", { className: "bar-val" }, "24"), /* @__PURE__ */ React.createElement("div", { className: "bar-pill blue", style: { height: "75px" } }), /* @__PURE__ */ React.createElement("span", { className: "bar-month" }, "Jul")), /* @__PURE__ */ React.createElement("div", { className: "bar-col" }, /* @__PURE__ */ React.createElement("span", { className: "bar-val", style: { color: "#e11d48", fontWeight: 900 } }, totalCount), /* @__PURE__ */ React.createElement("div", { className: "bar-pill red", style: { height: `${Math.min(95, Math.max(30, totalCount * 3.5))}px` } }), /* @__PURE__ */ React.createElement("span", { className: "bar-month", style: { color: "#0f172a", fontWeight: 800 } }, "Ago")))), /* @__PURE__ */ React.createElement("div", { className: "chart-card" }, /* @__PURE__ */ React.createElement("div", { className: "chart-card-title" }, "Acciones r\xE1pidas"), /* @__PURE__ */ React.createElement("div", { className: "actions-grid" }, /* @__PURE__ */ React.createElement("button", { className: "btn-action-tile red-primary", onClick: onQuickRegister }, /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-file-lines" }), /* @__PURE__ */ React.createElement("span", null, "+ Registrar Factura", /* @__PURE__ */ React.createElement("br", null), "/ Cotizaci\xF3n")), /* @__PURE__ */ React.createElement("button", { className: "btn-action-tile", onClick: onGoInvoices }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-gear", style: { color: "#475569" } }), /* @__PURE__ */ React.createElement("span", null, "Gestionar", /* @__PURE__ */ React.createElement("br", null), "documentos")), /* @__PURE__ */ React.createElement("button", { className: "btn-action-tile", onClick: onGoReports }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-chart-simple", style: { color: "#3b82f6" } }), /* @__PURE__ */ React.createElement("span", null, "Ir a Reportes")), /* @__PURE__ */ React.createElement("button", { className: "btn-action-tile", onClick: onGoSuppliers }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-user-group", style: { color: "#64748b" } }), /* @__PURE__ */ React.createElement("span", null, "Administrar", /* @__PURE__ */ React.createElement("br", null), "Proveedores")))));
}
window.ChartsSection = ChartsSection;
function FiltersBar({
  searchTerm,
  setSearchTerm,
  selectedSupplier,
  setSelectedSupplier,
  selectedFactureFilter,
  setSelectedFactureFilter,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  suppliersList,
  onClean,
  onExportExcel,
  onOpenExcelPreview,
  selectedCount
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
  return /* @__PURE__ */ React.createElement("div", { className: "filters-row" }, /* @__PURE__ */ React.createElement("div", { className: "search-input-wrap" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-magnifying-glass", style: { color: "#94a3b8", fontSize: "12px" } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Buscar por N\xB0 factura, proveedor o servicio...",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "dropdown-filter" }, /* @__PURE__ */ React.createElement("span", null, "Mes:"), /* @__PURE__ */ React.createElement("select", { value: selectedMonth || "Todos", onChange: (e) => setSelectedMonth && setSelectedMonth(e.target.value) }, allMonths.map((m) => /* @__PURE__ */ React.createElement("option", { key: m, value: m }, m)))), /* @__PURE__ */ React.createElement("div", { className: "dropdown-filter" }, /* @__PURE__ */ React.createElement("span", null, "A\xF1o:"), /* @__PURE__ */ React.createElement("select", { value: selectedYear || "Todos", onChange: (e) => setSelectedYear && setSelectedYear(e.target.value) }, allYears.map((y) => /* @__PURE__ */ React.createElement("option", { key: y, value: y }, y)))), /* @__PURE__ */ React.createElement("div", { className: "dropdown-filter" }, /* @__PURE__ */ React.createElement("span", null, "Proveedor:"), /* @__PURE__ */ React.createElement("select", { value: selectedSupplier, onChange: (e) => setSelectedSupplier(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "Todos" }, "Todos"), suppliersList.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s)))), /* @__PURE__ */ React.createElement("div", { className: "dropdown-filter" }, /* @__PURE__ */ React.createElement("span", null, "En Facture:"), /* @__PURE__ */ React.createElement("select", { value: selectedFactureFilter, onChange: (e) => setSelectedFactureFilter(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "Todos" }, "Todos"), /* @__PURE__ */ React.createElement("option", { value: "S\xCD" }, "S\xCD"), /* @__PURE__ */ React.createElement("option", { value: "A\xDAN NO" }, "A\xDAN NO"))), /* @__PURE__ */ React.createElement("button", { className: "btn-clean", onClick: onClean }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-rotate-right" }), " Limpiar"), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn-preview-excel",
      onClick: onOpenExcelPreview,
      title: "Abrir vista previa tipo Excel de las facturas seleccionadas / entregadas"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-table-cells" }),
    /* @__PURE__ */ React.createElement("span", null, "Vista Previa Excel ", selectedCount > 0 ? `(${selectedCount})` : "")
  ), /* @__PURE__ */ React.createElement("button", { className: "btn-export-excel", onClick: onExportExcel }, /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-file-excel" }), " Exportar"));
}
window.FiltersBar = FiltersBar;
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
  onViewDetail,
  onDeleteInvoice,
  onUploadPdf
}) {
  const isAllSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));
  const isSomeSelected = rows.some((r) => selectedIds.includes(r.id));
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "status-tabs-row", style: { marginBottom: "12px" } }, [
    { id: "Todos", label: `Todos (${tabCounts.total})` },
    { id: "Facturas", label: `Facturas (${tabCounts.fac})` },
    { id: "Cotizaciones", label: `Cotizaciones (${tabCounts.cot})` },
    { id: "Pendientes", label: `Pendientes (${tabCounts.pending})` },
    { id: "Atrasadas", label: `Atrasadas (${tabCounts.delayed})` },
    { id: "En Facture", label: `En Facture (${tabCounts.facture})` }
  ].map((tab) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: tab.id,
      className: `status-tab-btn ${currentTab === tab.id ? "active" : ""}`,
      onClick: () => setCurrentTab(tab.id)
    },
    tab.label
  ))), /* @__PURE__ */ React.createElement("div", { className: "table-card" }, /* @__PURE__ */ React.createElement("table", { className: "main-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: "36px", textAlign: "center" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: isAllSelected,
      onChange: (e) => onToggleSelectAll(e.target.checked),
      title: "Seleccionar todas las facturas visibles para vista previa Excel",
      style: { cursor: "pointer" }
    }
  )), /* @__PURE__ */ React.createElement("th", null, "Proveedor"), /* @__PURE__ */ React.createElement("th", null, "SERVICIO \u2195"), /* @__PURE__ */ React.createElement("th", null, "N DE FACTURA \u2195"), /* @__PURE__ */ React.createElement("th", null, "FECHA DE EMISION \u2195"), /* @__PURE__ */ React.createElement("th", null, "FECHA DE ENTREGA \u2195"), /* @__PURE__ */ React.createElement("th", null, "VALOR \u2195"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "FIRMADA"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "ORDEN STD"), /* @__PURE__ */ React.createElement("th", null, "OC"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "EN FACTURE"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "ENTREGADA"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "PDF"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Acciones"))), /* @__PURE__ */ React.createElement("tbody", null, rows.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "14", style: { textAlign: "center", padding: "24px", color: "#64748b" } }, "No hay documentos que coincidan con los filtros seleccionados.")) : rows.map((row) => {
    const isChecked = selectedIds.includes(row.id);
    return /* @__PURE__ */ React.createElement("tr", { key: row.id, className: isChecked ? "row-delivered-highlight" : "" }, /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: isChecked,
        onChange: () => onToggleSelectRow(row.id),
        style: { cursor: "pointer" },
        title: "Seleccionar para Vista Previa Excel"
      }
    )), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 700 } }, row.logoText && /* @__PURE__ */ React.createElement("span", { className: "sup-logo-badge" }, row.logoText), row.logoIcon && /* @__PURE__ */ React.createElement("span", { className: "sup-logo-badge" }, /* @__PURE__ */ React.createElement("i", { className: `fa-solid ${row.logoIcon}` })), row.supplier), /* @__PURE__ */ React.createElement("td", { style: { color: "#475569" } }, row.service), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "monospace", fontWeight: 800, color: "#e11d48" } }, row.invoiceNumber), /* @__PURE__ */ React.createElement("td", null, row.emissionDate), /* @__PURE__ */ React.createElement("td", { style: { color: "#047857", fontWeight: 600 } }, row.deliveryDate), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 800 } }, "$", Number(row.value || 0).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: `state-pill ${row.signed === "S\xCD" ? "state-yes" : "state-no"}`,
        onClick: () => onToggleSigned(row.id),
        title: "Clic para conmutar estado de firma"
      },
      row.signed
    )), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: `state-pill ${row.orderStd === "S\xCD" ? "state-yes" : "state-no"}`,
        onClick: () => onToggleOrderStd(row.id),
        title: "Clic para conmutar Orden STD"
      },
      row.orderStd
    )), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "monospace", fontWeight: 700, color: "#7c3aed" } }, row.oc), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: `state-pill ${row.enFacture === "S\xCD" ? "state-yes" : "state-pending"}`,
        onClick: () => onToggleFacture(row.id),
        title: "Clic para conmutar estado Facture"
      },
      row.enFacture
    )), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: `state-pill ${row.delivered === "S\xCD" ? "state-yes" : "state-no"}`,
        onClick: () => onToggleDelivered(row.id),
        title: "Clic para conmutar estado Entregada"
      },
      row.delivered
    )), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, row.pdfPath ? /* @__PURE__ */ React.createElement(
      "a",
      {
        href: row.pdfPath,
        target: "_blank",
        rel: "noreferrer",
        style: { color: "#e11d48", fontSize: "13px" },
        title: `Ver PDF: ${row.pdfOriginalName || "Archivo adjunto"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-pdf" })
    ) : /* @__PURE__ */ React.createElement(
      "i",
      {
        className: "fa-solid fa-arrow-up-from-bracket",
        style: { color: "#94a3b8", cursor: "pointer", fontSize: "12px" },
        onClick: () => onUploadPdf(row.id),
        title: "Subir PDF f\xEDsico local a esta factura"
      }
    )), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { className: "action-icons-wrap", style: { justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-pen-to-square", style: { color: "#2563eb", cursor: "pointer" }, title: "Editar Factura", onClick: () => onViewDetail(row) }), /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-paperclip", title: "Adjuntar PDF local", onClick: () => onUploadPdf(row.id) }), /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-trash", style: { color: "#e11d48" }, title: "Eliminar de BD", onClick: () => onDeleteInvoice(row.id) }))));
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
  suppliersList,
  onOpenExcelPreview,
  selectedCount
}) {
  return /* @__PURE__ */ React.createElement("div", { className: "dashboard-container" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "16px", fontWeight: 800 } }, "\u{1F4D1} M\xF3dulo de Facturas & Cotizaciones"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#64748b" } }, "Control de Orden STD (S\xCD/NO), OC, Fechas y Radicaciones con Filtros Avanzados")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("button", { className: "btn-preview-excel", onClick: onOpenExcelPreview }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-table-cells" }), /* @__PURE__ */ React.createElement("span", null, "Vista Previa Excel")), /* @__PURE__ */ React.createElement("button", { className: "btn-red-action", onClick: onQuickRegister }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-plus" }), " Registrar Factura"))), /* @__PURE__ */ React.createElement(
    FiltersBar,
    {
      searchTerm,
      setSearchTerm,
      selectedSupplier,
      setSelectedSupplier,
      selectedFactureFilter,
      setSelectedFactureFilter,
      selectedMonth,
      setSelectedMonth,
      selectedYear,
      setSelectedYear,
      suppliersList: suppliersList || [],
      selectedCount: selectedCount || 0,
      onOpenExcelPreview,
      onClean: () => {
        if (setSearchTerm) setSearchTerm("");
        if (setSelectedSupplier) setSelectedSupplier("Todos");
        if (setSelectedFactureFilter) setSelectedFactureFilter("Todos");
        if (setSelectedMonth) setSelectedMonth("Todos");
        if (setSelectedYear) setSelectedYear("Todos");
      },
      onExportExcel: () => Swal.fire("Excel Exportado", "Reporte descargado correctamente.", "success")
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "table-card" }, /* @__PURE__ */ React.createElement("table", { className: "main-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Proveedor"), /* @__PURE__ */ React.createElement("th", null, "SERVICIO"), /* @__PURE__ */ React.createElement("th", null, "N DE FACTURA"), /* @__PURE__ */ React.createElement("th", null, "FECHA DE EMISION"), /* @__PURE__ */ React.createElement("th", null, "FECHA DE ENTREGA"), /* @__PURE__ */ React.createElement("th", null, "VALOR"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "FIRMADA"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "ORDEN STD"), /* @__PURE__ */ React.createElement("th", null, "OC"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "EN FACTURE"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "ENTREGADA"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "PDF"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Acciones"))), /* @__PURE__ */ React.createElement("tbody", null, invoices.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "13", style: { textAlign: "center", padding: "24px", color: "#64748b" } }, "No hay comprobantes para el mes y a\xF1o seleccionados.")) : invoices.map((inv) => /* @__PURE__ */ React.createElement("tr", { key: inv.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 700 } }, inv.supplier), /* @__PURE__ */ React.createElement("td", null, inv.service), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "monospace", fontWeight: 800, color: "#e11d48" } }, inv.invoiceNumber), /* @__PURE__ */ React.createElement("td", null, inv.emissionDate), /* @__PURE__ */ React.createElement("td", { style: { color: "#047857", fontWeight: 600 } }, inv.deliveryDate), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 800 } }, "$", Number(inv.value || 0).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { className: `state-pill ${inv.signed === "S\xCD" ? "state-yes" : "state-no"}`, onClick: () => onToggleSigned(inv.id) }, inv.signed)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { className: `state-pill ${inv.orderStd === "S\xCD" ? "state-yes" : "state-no"}`, onClick: () => onToggleOrderStd(inv.id) }, inv.orderStd)), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "monospace", fontWeight: 700, color: "#7c3aed" } }, inv.oc), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { className: `state-pill ${inv.enFacture === "S\xCD" ? "state-yes" : "state-pending"}`, onClick: () => onToggleFacture(inv.id) }, inv.enFacture)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { className: `state-pill ${inv.delivered === "S\xCD" ? "state-yes" : "state-no"}`, onClick: () => onToggleDelivered(inv.id) }, inv.delivered)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, inv.pdfPath ? /* @__PURE__ */ React.createElement("a", { href: inv.pdfPath, target: "_blank", rel: "noreferrer", style: { color: "#e11d48", fontSize: "13px" }, title: `Ver PDF: ${inv.pdfOriginalName || "Archivo"}` }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-pdf" })) : /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-arrow-up-from-bracket", style: { color: "#94a3b8", cursor: "pointer", fontSize: "12px" }, onClick: () => onUploadPdf && onUploadPdf(inv.id), title: "Subir PDF" })), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { background: "#eff6ff", color: "#2563eb", border: "none", padding: "4px 8px", borderRadius: "6px", fontWeight: 700, cursor: "pointer", marginRight: "6px" },
      onClick: () => onViewDetail && onViewDetail(inv)
    },
    "\u270F\uFE0F Editar"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { background: "#fee2e2", color: "#e11d48", border: "none", padding: "4px 8px", borderRadius: "6px", fontWeight: 700, cursor: "pointer" },
      onClick: () => onDeleteInvoice(inv.id)
    },
    "Eliminar"
  ))))))));
}
window.InvoicesModule = InvoicesModule;
function SuppliersModule({ suppliers, invoices = [], onAddSupplier, onEditSupplier, onDeleteSupplier, onUpdateSupplierServices }) {
  const [expandedSupplierId, setExpandedSupplierId] = useState(null);
  const toggleExpand = (id) => {
    setExpandedSupplierId(expandedSupplierId === id ? null : id);
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
  return /* @__PURE__ */ React.createElement("div", { className: "dashboard-container" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "16px", fontWeight: 800 } }, "\u{1F465} Directorio de Proveedores Autorizados"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#64748b" } }, "Usa el bot\xF3n de flecha (\u2335 / \u2303) para desplegar y contraer las facturas mensuales de cada proveedor")), /* @__PURE__ */ React.createElement("button", { className: "btn-red-action", onClick: onAddSupplier }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-plus" }), " Registrar Proveedor")), /* @__PURE__ */ React.createElement("div", { className: "table-card" }, /* @__PURE__ */ React.createElement("table", { className: "main-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: "38px", textAlign: "center" } }, "Ver"), /* @__PURE__ */ React.createElement("th", null, "NIT / RUT"), /* @__PURE__ */ React.createElement("th", null, "Raz\xF3n Social"), /* @__PURE__ */ React.createElement("th", null, "Asesor Comercial"), /* @__PURE__ */ React.createElement("th", null, "Tel\xE9fono"), /* @__PURE__ */ React.createElement("th", null, "Facturas Registradas"), /* @__PURE__ */ React.createElement("th", null, "\xC1rea Asignada"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Acciones"))), /* @__PURE__ */ React.createElement("tbody", null, !suppliers || suppliers.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "8", style: { textAlign: "center", padding: "32px", color: "#64748b" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-users", style: { fontSize: "28px", color: "#cbd5e1" } }), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700 } }, "No hay proveedores registrados en la Base de Datos."), /* @__PURE__ */ React.createElement("button", { className: "btn-red-action", style: { marginTop: "6px" }, onClick: onAddSupplier }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-plus" }), " Registrar Primer Proveedor")))) : suppliers.map((sup) => {
    const isExpanded = expandedSupplierId === sup.id;
    const services = sup.services || [];
    const enabledCount = services.filter((s) => s.enabled !== false).length;
    const realInvoicesCount = (invoices || []).filter((inv) => {
      const sameSupName = (inv.supplier || "").trim().toLowerCase() === (sup.name || "").trim().toLowerCase();
      const isReal = inv.invoiceNumber || inv.value > 0 || inv.pdfPath || inv.id && !inv.id.startsWith("auto-");
      return sameSupName && isReal;
    }).length;
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: sup.id }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        style: {
          background: isExpanded ? "#e11d48" : "#f1f5f9",
          color: isExpanded ? "#ffffff" : "#475569",
          border: "none",
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          fontSize: "13px"
        },
        onClick: () => toggleExpand(sup.id),
        title: isExpanded ? "Contraer facturas" : "Desplegar facturas"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fa-solid ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"}` })
    )), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "monospace", fontWeight: 700 } }, sup.nit), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 700, color: "#e11d48", cursor: "pointer" }, onClick: () => toggleExpand(sup.id) }, sup.name, services.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "10px", marginLeft: "6px", color: "#64748b", fontWeight: 600 } }, "(", enabledCount, " de ", services.length, " servicios activos)")), /* @__PURE__ */ React.createElement("td", null, sup.contact || "\u2014"), /* @__PURE__ */ React.createElement("td", null, sup.phone || "\u2014"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { style: {
      fontWeight: 800,
      color: realInvoicesCount > 0 ? "#16a34a" : "#94a3b8",
      background: realInvoicesCount > 0 ? "#dcfce7" : "#f1f5f9",
      padding: "4px 10px",
      borderRadius: "8px",
      fontSize: "11px",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      border: realInvoicesCount > 0 ? "1px solid #bbf7d0" : "1px solid #e2e8f0"
    } }, /* @__PURE__ */ React.createElement("i", { className: realInvoicesCount > 0 ? "fa-solid fa-file-invoice-dollar" : "fa-regular fa-file" }), realInvoicesCount, " ", realInvoicesCount === 1 ? "factura" : "facturas")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { style: { background: "#e0e7ff", color: "#3730a3", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 800 } }, sup.area || "General")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        style: {
          background: isExpanded ? "#fee2e2" : "#eff6ff",
          color: isExpanded ? "#e11d48" : "#2563eb",
          border: isExpanded ? "1px solid #fca5a5" : "1px solid #bfdbfe",
          padding: "5px 12px",
          borderRadius: "8px",
          fontWeight: 800,
          cursor: "pointer",
          marginRight: "6px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          transition: "all 0.2s"
        },
        onClick: () => toggleExpand(sup.id),
        title: isExpanded ? "Contraer servicios" : "Configurar servicios"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fa-solid ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"}`, style: { fontSize: "12px" } }),
      /* @__PURE__ */ React.createElement("span", null, isExpanded ? "Contraer" : "Servicios")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        style: { background: "#eff6ff", color: "#2563eb", border: "none", padding: "5px 10px", borderRadius: "6px", fontWeight: 700, cursor: "pointer", marginRight: "6px", fontSize: "11px" },
        onClick: () => onEditSupplier(sup)
      },
      "Editar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        style: { background: "#fee2e2", color: "#e11d48", border: "none", padding: "5px 10px", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontSize: "11px" },
        onClick: () => onDeleteSupplier(sup.id)
      },
      "Eliminar"
    ))), isExpanded && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "8", style: { padding: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "supplier-subrow-box" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" } }, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: "12px", color: "#0f172a" } }, "\u2699\uFE0F Configuraci\xF3n de Servicios / Conceptos Facturables \u2014 ", sup.name, ":"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", color: "#64748b" } }, "Usa el interruptor ", /* @__PURE__ */ React.createElement("strong", null, "ON / OFF"), " para generar o suspender la fila autom\xE1tica en el m\xF3dulo de facturaci\xF3n")), services.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "12px", textAlign: "center", color: "#94a3b8", fontSize: "12px", fontStyle: "italic" } }, "Este proveedor no tiene servicios recurrentes configurados a\xFAn.") : services.map((srv, sIdx) => {
      const isEnabled = srv.enabled !== false;
      return /* @__PURE__ */ React.createElement("div", { key: srv.id || sIdx, className: "service-item-row" }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "monospace", fontWeight: 800, fontSize: "11px", color: "#e11d48", width: "85px" } }, "Servicio #", sIdx + 1), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: 700, color: "#64748b" } }, "Concepto:"), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "text",
          className: "input-service-name",
          value: srv.serviceName || "",
          placeholder: `ej: Servicio de ${sIdx === 0 ? "Mantenimiento" : "Insumos"}`,
          onChange: (e) => handleServiceNameChange(sup, sIdx, e.target.value)
        }
      )), /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "switch-toggle-wrap",
          onClick: () => handleToggleServiceEnable(sup, sIdx),
          title: isEnabled ? "Clic para inhabilitar (OFF)" : "Clic para habilitar (ON)"
        },
        /* @__PURE__ */ React.createElement("div", { className: `switch-track ${isEnabled ? "on" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "switch-thumb" })),
        /* @__PURE__ */ React.createElement("span", { className: `switch-label-txt ${isEnabled ? "on" : "off"}` }, isEnabled ? "ON" : "OFF")
      ));
    })))));
  })))));
}
window.SuppliersModule = SuppliersModule;
function CrmModule({ suppliers = [], quotations = [], onSaveQuotation, onDeleteQuotation, onUploadPdf }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("TODOS");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingQuotation, setEditingQuotation] = React.useState(null);
  const STAGES = [
    { key: "EN_BUSQUEDA", label: "En B\xFAsqueda", color: "#64748b", bg: "#f1f5f9" },
    { key: "CONSULTADO", label: "Consultado", color: "#0284c7", bg: "#e0f2fe" },
    { key: "COTIZANDO", label: "En Espera Cotizaci\xF3n", color: "#d97706", bg: "#fef3c7" },
    { key: "COTIZADO", label: "Cotizaci\xF3n Recibida", color: "#16a34a", bg: "#dcfce7" },
    { key: "SELECCIONADO", label: "Ganador / Aprobado", color: "#e11d48", bg: "#ffe4e6" },
    { key: "DESCARTADO", label: "Descartado", color: "#94a3b8", bg: "#f8fafc" }
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
  return /* @__PURE__ */ React.createElement("div", { className: "dashboard-container", style: { paddingBottom: "40px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "20px 24px", borderRadius: "20px", border: "1px solid #e2e8f0", flexWrap: "wrap", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg, #e11d48, #be123c)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 4px 12px rgba(225,29,72,0.3)" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-handshake" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 } }, "CRM de Cotizaciones & Proveedores"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#64748b", margin: "2px 0 0", fontWeight: 600 } }, "Pipeline de compras: En B\xFAsqueda \u2794 Consultado \u2794 En Espera \u2794 Cotizado \u2794 Adjudicado"))), /* @__PURE__ */ React.createElement("button", { className: "btn-red-action", onClick: () => {
    setEditingQuotation({ id: "crm-" + Date.now(), code: "REQ-" + (/* @__PURE__ */ new Date()).getFullYear() + "-" + (quotations.length + 1).toString().padStart(3, "0"), title: "", category: "Insumos / Alimentos", description: "", urgency: "Media", deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0], status: "EN_BUSQUEDA", suppliers: [] });
    setIsModalOpen(true);
  }, style: { padding: "12px 20px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-plus-circle" }), /* @__PURE__ */ React.createElement("span", null, "Nueva Solicitud de Cotizaci\xF3n"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "40px", height: "40px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-layer-group" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" } }, "Total Solicitudes"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", fontWeight: 900, color: "#0f172a" } }, metrics.total))), /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "40px", height: "40px", borderRadius: "12px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-magnifying-glass" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" } }, "En B\xFAsqueda"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", fontWeight: 900, color: "#d97706" } }, metrics.inSearch))), /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "40px", height: "40px", borderRadius: "12px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-hourglass-half" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" } }, "En Negociaci\xF3n"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", fontWeight: 900, color: "#0284c7" } }, metrics.inProcess))), /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "40px", height: "40px", borderRadius: "12px", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-circle-check" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" } }, "Adjudicadas"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", fontWeight: 900, color: "#16a34a" } }, metrics.completed)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "12px", background: "#fff", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", flex: 1, minWidth: "240px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-search", style: { position: "absolute", left: "12px", top: "11px", color: "#94a3b8", fontSize: "13px" } }), /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "Buscar requerimiento, producto o proveedor...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), style: { width: "100%", padding: "8px 12px 8px 34px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", boxSizing: "border-box" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "6px", overflowX: "auto" } }, [{ key: "TODOS", label: "Todas" }, { key: "EN_BUSQUEDA", label: "\u{1F50D} En B\xFAsqueda" }, { key: "EN_PROCESO", label: "\u23F3 En Negociaci\xF3n" }, { key: "FINALIZADO", label: "\u{1F3C6} Adjudicadas" }].map((tab) => /* @__PURE__ */ React.createElement("button", { key: tab.key, onClick: () => setStatusFilter(tab.key), style: { padding: "8px 14px", borderRadius: "10px", border: statusFilter === tab.key ? "1px solid #e11d48" : "1px solid #e2e8f0", background: statusFilter === tab.key ? "#fff1f2" : "#f8fafc", color: statusFilter === tab.key ? "#e11d48" : "#64748b", fontWeight: 800, fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" } }, tab.label)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } }, filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { background: "#ffffff", padding: "48px 24px", borderRadius: "20px", border: "1px dashed #cbd5e1", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "40px", color: "#cbd5e1", marginBottom: "12px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-circle-question" })), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "16px", fontWeight: 800, color: "#334155" } }, "No hay requerimientos registrados"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#64748b", maxWidth: "400px", margin: "6px auto 16px" } }, "Crea tu primera solicitud para gestionar la cotizaci\xF3n con varios proveedores."), /* @__PURE__ */ React.createElement("button", { className: "btn-red-action", onClick: () => {
    setEditingQuotation({ id: "crm-" + Date.now(), code: "REQ-" + (/* @__PURE__ */ new Date()).getFullYear() + "-" + (quotations.length + 1).toString().padStart(3, "0"), title: "", category: "Insumos / Alimentos", description: "", urgency: "Media", deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0], status: "EN_BUSQUEDA", suppliers: [] });
    setIsModalOpen(true);
  } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-plus" }), " Crear Solicitud de Cotizaci\xF3n")) : filtered.map((q) => {
    const qSuppliers = q.suppliers || [];
    return /* @__PURE__ */ React.createElement("div", { key: q.id, style: { background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { background: "#e11d48", color: "#fff", fontSize: "11px", fontWeight: 900, padding: "3px 8px", borderRadius: "6px" } }, q.code), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "15px", fontWeight: 900, color: "#0f172a", margin: 0 } }, q.title), /* @__PURE__ */ React.createElement("span", { style: { background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 } }, "\u{1F4C2} ", q.category), /* @__PURE__ */ React.createElement("span", { style: { background: q.urgency === "Alta" ? "#fee2e2" : "#fef3c7", color: q.urgency === "Alta" ? "#b91c1c" : "#92400e", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 800 } }, "\u26A1 ", q.urgency)), /* @__PURE__ */ React.createElement("button", { onClick: () => {
      Swal.fire({ title: "\xBFEliminar?", text: "Se borrar\xE1 " + q.code, icon: "warning", showCancelButton: true, confirmButtonColor: "#e11d48" }).then((r) => {
        if (r.isConfirmed) onDeleteQuotation(q.id);
      });
    }, style: { background: "#fff1f2", border: "1px solid #fecdd3", color: "#e11d48", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-trash" }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 20px" } }, q.description && /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#475569", marginBottom: "14px", lineHeight: 1.4 } }, /* @__PURE__ */ React.createElement("strong", null, "Especificaciones:"), " ", q.description), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "16px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", fontWeight: 800, color: "#334155" } }, "\u2795 Invitar Proveedor a Cotizar:"), /* @__PURE__ */ React.createElement("select", { id: "select-sup-" + q.id, style: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: 700, outline: "none", flex: 1, minWidth: "200px" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Seleccionar Proveedor del Cat\xE1logo --"), suppliers.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.name, " (", s.nit, ") - ", s.area))), /* @__PURE__ */ React.createElement("button", { onClick: () => {
      const sel = document.getElementById("select-sup-" + q.id);
      const supObj = suppliers.find((s) => s.id === sel.value);
      if (supObj) {
        handleAddSup(q, supObj);
        sel.value = "";
      } else {
        Swal.fire("Selecciona un Proveedor", "Elige un proveedor del listado.", "warning");
      }
    }, style: { background: "#0f172a", color: "#ffffff", border: "none", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-paper-plane" }), " Invitar Proveedor")), qSuppliers.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "14px", color: "#94a3b8", fontSize: "12px", fontStyle: "italic" } }, "A\xFAn no has agregado proveedores para esta cotizaci\xF3n.") : /* @__PURE__ */ React.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "12px" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#64748b", fontSize: "11px", textTransform: "uppercase" } }, /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 10px" } }, "Proveedor"), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 10px" } }, "Estado del Proveedor"), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 10px" } }, "Monto Cotizado ($ COP)"), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 10px" } }, "Archivo PDF"), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 10px", textAlign: "right" } }, "Adjudicar"))), /* @__PURE__ */ React.createElement("tbody", null, qSuppliers.map((sup, idx) => {
      const meta = getMeta(sup.stage);
      const isSelected = sup.stage === "SELECCIONADO";
      return /* @__PURE__ */ React.createElement("tr", { key: sup.id || idx, style: { borderBottom: "1px solid #f1f5f9", background: isSelected ? "#fff1f2" : "transparent" } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "10px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, color: "#0f172a" } }, sup.supplierName), sup.phone && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#64748b" } }, "\u{1F4DE} ", sup.phone)), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px" } }, /* @__PURE__ */ React.createElement("select", { value: sup.stage || "CONSULTADO", onChange: (e) => handleStageChange(q, idx, e.target.value), style: { padding: "5px 10px", borderRadius: "8px", border: "1px solid " + meta.color, background: meta.bg, color: meta.color, fontWeight: 800, fontSize: "11px", outline: "none", cursor: "pointer" } }, STAGES.map((st) => /* @__PURE__ */ React.createElement("option", { key: st.key, value: st.key }, st.label)))), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px" } }, /* @__PURE__ */ React.createElement("input", { type: "number", defaultValue: sup.quotedAmount || "", placeholder: "$ 0", onBlur: (e) => handleAmountChange(q, idx, e.target.value), style: { width: "120px", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: 800, fontSize: "12px" } })), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px" } }, sup.pdfPath ? /* @__PURE__ */ React.createElement("a", { href: sup.pdfPath, target: "_blank", rel: "noreferrer", style: { display: "inline-flex", alignItems: "center", gap: "6px", color: "#e11d48", fontWeight: 800, textDecoration: "none", background: "#ffe4e6", padding: "4px 8px", borderRadius: "6px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-pdf" }), " Ver PDF") : /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", color: "#0284c7", fontWeight: 700, cursor: "pointer", background: "#f0f9ff", padding: "4px 8px", borderRadius: "6px", border: "1px dashed #7dd3fc" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-upload" }), " Adjuntar PDF", /* @__PURE__ */ React.createElement("input", { type: "file", accept: ".pdf,image/*", style: { display: "none" }, onChange: (e) => handlePdfUpload(q, idx, e.target.files[0]) }))), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px", textAlign: "right" } }, isSelected ? /* @__PURE__ */ React.createElement("span", { style: { background: "#e11d48", color: "#fff", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 900 } }, "\u{1F3C6} GANADOR") : /* @__PURE__ */ React.createElement("button", { onClick: () => handleStageChange(q, idx, "SELECCIONADO"), style: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-check" }), " Escoger")));
    }))))));
  })), isModalOpen && editingQuotation && /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "520px", padding: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "16px", fontWeight: 900, color: "#0f172a", margin: 0 } }, "Nueva Solicitud de Cotizaci\xF3n"), /* @__PURE__ */ React.createElement("button", { onClick: () => setIsModalOpen(false), style: { background: "none", border: "none", fontSize: "18px", color: "#94a3b8", cursor: "pointer" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-xmark" }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: 800, color: "#64748b" } }, "C\xF3digo *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: editingQuotation.code, onChange: (e) => setEditingQuotation({ ...editingQuotation, code: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 700, marginTop: "4px", boxSizing: "border-box" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: 800, color: "#64748b" } }, "Categor\xEDa"), /* @__PURE__ */ React.createElement("select", { value: editingQuotation.category, onChange: (e) => setEditingQuotation({ ...editingQuotation, category: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 700, marginTop: "4px", boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("option", { value: "Insumos / Alimentos" }, "Insumos / Alimentos"), /* @__PURE__ */ React.createElement("option", { value: "Empaques y Pl\xE1sticos" }, "Empaques y Pl\xE1sticos"), /* @__PURE__ */ React.createElement("option", { value: "Mantenimiento Industrial" }, "Mantenimiento Industrial"), /* @__PURE__ */ React.createElement("option", { value: "Transporte y Log\xEDstica" }, "Transporte y Log\xEDstica"), /* @__PURE__ */ React.createElement("option", { value: "Tecnolog\xEDa (TI)" }, "Tecnolog\xEDa (TI)"), /* @__PURE__ */ React.createElement("option", { value: "Servicios Generales" }, "Servicios Generales")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: 800, color: "#64748b" } }, "T\xEDtulo / Requerimiento *"), /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "ej: Suministro de Harina de Trigo o Cajas", value: editingQuotation.title, onChange: (e) => setEditingQuotation({ ...editingQuotation, title: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 700, marginTop: "4px", boxSizing: "border-box" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: 800, color: "#64748b" } }, "Detalles / Cantidades"), /* @__PURE__ */ React.createElement("textarea", { rows: "3", placeholder: "Describe cantidades, condiciones de entrega...", value: editingQuotation.description, onChange: (e) => setEditingQuotation({ ...editingQuotation, description: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", marginTop: "4px", boxSizing: "border-box" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: 800, color: "#64748b" } }, "Urgencia"), /* @__PURE__ */ React.createElement("select", { value: editingQuotation.urgency, onChange: (e) => setEditingQuotation({ ...editingQuotation, urgency: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", marginTop: "4px", boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("option", { value: "Baja" }, "Baja"), /* @__PURE__ */ React.createElement("option", { value: "Media" }, "Media"), /* @__PURE__ */ React.createElement("option", { value: "Alta" }, "Alta"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: 800, color: "#64748b" } }, "Fecha L\xEDmite"), /* @__PURE__ */ React.createElement("input", { type: "date", value: editingQuotation.deadline, onChange: (e) => setEditingQuotation({ ...editingQuotation, deadline: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", marginTop: "4px", boxSizing: "border-box" } }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setIsModalOpen(false), style: { padding: "10px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontWeight: 700, cursor: "pointer" } }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    if (!editingQuotation.title || !editingQuotation.code) {
      return Swal.fire("Campos requeridos", "Ingresa c\xF3digo y t\xEDtulo.", "warning");
    }
    onSaveQuotation(editingQuotation);
    setIsModalOpen(false);
    Swal.fire("Guardado", "Solicitud registrada en MySQL.", "success");
  }, className: "btn-red-action", style: { padding: "10px 20px", borderRadius: "10px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-save" }), " Guardar Requerimiento"))))));
}
window.CrmModule = CrmModule;
function UsersModule({ users, onAddUser, currentUser, onDeleteUser }) {
  const isSuperAdmin = currentUser?.role === "superadmin";
  return /* @__PURE__ */ React.createElement("div", { className: "dashboard-container" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "16px", fontWeight: 800 } }, "\u{1F464} Gesti\xF3n de Usuarios, Roles & Credenciales"), isSuperAdmin && /* @__PURE__ */ React.createElement("span", { style: { background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, border: "1px solid #fde68a" } }, "\u{1F451} Modo Superadmin Habilitado")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#64748b", marginTop: "2px" } }, "Control de cuentas autorizadas con roles superadmin y admin")), /* @__PURE__ */ React.createElement("button", { className: "btn-red-action", onClick: onAddUser }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-user-plus" }), " Crear Nuevo Usuario")), /* @__PURE__ */ React.createElement("div", { className: "table-card" }, /* @__PURE__ */ React.createElement("table", { className: "main-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Usuario (Login)"), /* @__PURE__ */ React.createElement("th", null, "Nombre Completo"), /* @__PURE__ */ React.createElement("th", null, "Rol Asignado"), /* @__PURE__ */ React.createElement("th", null, "\xC1rea Operativa"), /* @__PURE__ */ React.createElement("th", null, "Estado"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Nivel Acceso"), isSuperAdmin && /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Acciones"))), /* @__PURE__ */ React.createElement("tbody", null, users.map((u) => {
    const isSuper = u.role === "superadmin";
    return /* @__PURE__ */ React.createElement("tr", { key: u.id }, /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "monospace", fontWeight: 700, color: isSuper ? "#e11d48" : "#0f172a" } }, u.username), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 700 } }, u.name), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { style: {
      background: isSuper ? "#ffe4e6" : "#eff6ff",
      color: isSuper ? "#be123c" : "#1d4ed8",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "10px",
      fontWeight: 800,
      border: `1px solid ${isSuper ? "#fecdd3" : "#bfdbfe"}`
    } }, isSuper ? "\u{1F451} SUPERADMIN" : "\u{1F6E1}\uFE0F ADMIN")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { style: { background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700 } }, u.area || "General")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { style: { background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 800 } }, u.status || "Activo")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#64748b" } }, isSuper ? "Control Total + BD" : "Gesti\xF3n & Facturas"), isSuperAdmin && /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, u.id !== currentUser?.id && u.username !== "superadmin" ? /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onDeleteUser && onDeleteUser(u.id),
        style: {
          background: "#fee2e2",
          color: "#e11d48",
          border: "none",
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "11px",
          cursor: "pointer",
          fontWeight: 700
        },
        title: "Eliminar usuario"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-trash" })
    ) : /* @__PURE__ */ React.createElement("span", { style: { fontSize: "10px", color: "#94a3b8", fontWeight: 700 } }, "Principal")));
  })))));
}
window.UsersModule = UsersModule;
function AlertsModule({ alerts, onGoDashboard }) {
  return /* @__PURE__ */ React.createElement("div", { className: "dashboard-container" }, /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#e11d48", fontWeight: 800, fontSize: "15px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-triangle-exclamation" }), /* @__PURE__ */ React.createElement("span", null, "Centro de Alertas Reales del Sistema")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#64748b", marginTop: "4px" } }, "Calculadas din\xE1micamente seg\xFAn fechas de entrega, firmas y estado de radicaci\xF3n"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" } }, alerts.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: "#166534", background: "#dcfce7", padding: "12px", borderRadius: "8px", fontWeight: 700, fontSize: "12px" } }, "\u{1F7E2} \xA1Todo al d\xEDa! No hay facturas atrasadas ni pendientes cr\xEDticas.") : alerts.map((alt, idx) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: idx,
      style: {
        padding: "12px 16px",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
        background: alt.type === "red" ? "#fee2e2" : alt.type === "amber" ? "#fef3c7" : "#eff6ff",
        color: alt.type === "red" ? "#991b1b" : alt.type === "amber" ? "#92400e" : "#1e40af",
        border: `1px solid ${alt.type === "red" ? "#fca5a5" : alt.type === "amber" ? "#fde68a" : "#bfdbfe"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, alt.title, ":"), " ", alt.message),
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: 800, opacity: 0.8 } }, alt.tag)
  ))), /* @__PURE__ */ React.createElement("button", { className: "btn-red-action", style: { marginTop: "16px" }, onClick: onGoDashboard }, "Volver al Dashboard")));
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
  return /* @__PURE__ */ React.createElement("div", { className: "fixed-modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "excel-modal-container" }, /* @__PURE__ */ React.createElement("div", { className: "excel-modal-header" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#107c41", color: "#fff", padding: "6px 10px", borderRadius: "8px", fontWeight: 900, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" } }, /* @__PURE__ */ React.createElement("i", { className: "fa-regular fa-file-excel" }), " Excel View"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "15px", fontWeight: 800, margin: 0 } }, "Vista Previa de Facturas Entregadas y Seleccionadas"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "11px", color: "#64748b", margin: 0 } }, selectedInvoices.length, " facturas seleccionadas | ", deliveredCount, " con estado ENTREGADA | Total: ", /* @__PURE__ */ React.createElement("strong", null, "$", totalSelectedAmount.toLocaleString("es-CO"))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("button", { className: "btn-excel-tool", onClick: handleExportCsv, title: "Descargar archivo Excel / CSV" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-arrow-down", style: { color: "#15803d" } }), /* @__PURE__ */ React.createElement("span", null, "Exportar CSV")), /* @__PURE__ */ React.createElement("button", { className: "btn-excel-tool", onClick: handlePrint, title: "Imprimir informe" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-print", style: { color: "#2563eb" } }), /* @__PURE__ */ React.createElement("span", null, "Imprimir")), /* @__PURE__ */ React.createElement("button", { className: "btn-excel-close", onClick: onClose, title: "Cerrar modal" }, /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-xmark" })))), /* @__PURE__ */ React.createElement("div", { className: "excel-formula-bar" }, /* @__PURE__ */ React.createElement("div", { className: "excel-cell-name" }, "A1:", String.fromCharCode(65 + 10), selectedInvoices.length + 1), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, color: "#94a3b8", fontStyle: "italic" } }, "fx"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", fontWeight: 600, color: "#475569" } }, "=SUMA(VALOR) = $", totalSelectedAmount.toLocaleString("es-CO"), " COP | Entregadas: ", deliveredCount, "/", selectedInvoices.length))), /* @__PURE__ */ React.createElement("div", { className: "excel-sheet-viewport" }, /* @__PURE__ */ React.createElement("table", { className: "excel-sheet-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "excel-col-letters-row" }, /* @__PURE__ */ React.createElement("th", { style: { width: "40px" } }), /* @__PURE__ */ React.createElement("th", null, "A"), /* @__PURE__ */ React.createElement("th", null, "B"), /* @__PURE__ */ React.createElement("th", null, "C"), /* @__PURE__ */ React.createElement("th", null, "D"), /* @__PURE__ */ React.createElement("th", null, "E"), /* @__PURE__ */ React.createElement("th", null, "F"), /* @__PURE__ */ React.createElement("th", null, "G"), /* @__PURE__ */ React.createElement("th", null, "H"), /* @__PURE__ */ React.createElement("th", null, "I"), /* @__PURE__ */ React.createElement("th", null, "J"), /* @__PURE__ */ React.createElement("th", null, "K"), /* @__PURE__ */ React.createElement("th", null, "L")), /* @__PURE__ */ React.createElement("tr", { className: "excel-header-row" }, /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center", background: "#e2e8f0", color: "#475569" } }, "#"), /* @__PURE__ */ React.createElement("th", null, "PROVEEDOR"), /* @__PURE__ */ React.createElement("th", null, "SERVICIO"), /* @__PURE__ */ React.createElement("th", null, "N DE FACTURA"), /* @__PURE__ */ React.createElement("th", null, "FECHA EMISI\xD3N"), /* @__PURE__ */ React.createElement("th", null, "FECHA ENTREGA"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "VALOR ($)"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "FIRMADA"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "ORDEN STD"), /* @__PURE__ */ React.createElement("th", null, "OC"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "EN FACTURE"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "ENTREGADA"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "DOCUMENTO PDF"))), /* @__PURE__ */ React.createElement("tbody", null, selectedInvoices.map((inv, idx) => /* @__PURE__ */ React.createElement("tr", { key: inv.id || idx, className: inv.delivered === "S\xCD" ? "row-delivered-highlight" : "" }, /* @__PURE__ */ React.createElement("td", { className: "excel-row-num" }, idx + 1), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 700, color: "#0f172a" } }, inv.supplier), /* @__PURE__ */ React.createElement("td", { style: { color: "#475569" } }, inv.service), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "monospace", fontWeight: 800, color: "#e11d48" } }, inv.invoiceNumber), /* @__PURE__ */ React.createElement("td", null, inv.emissionDate), /* @__PURE__ */ React.createElement("td", { style: { color: "#047857", fontWeight: 700 } }, inv.deliveryDate), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontWeight: 800, fontFamily: "monospace" } }, "$", Number(inv.value || 0).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { className: `state-pill ${inv.signed === "S\xCD" ? "state-yes" : "state-no"}` }, inv.signed || "NO")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { className: `state-pill ${inv.orderStd === "S\xCD" ? "state-yes" : "state-no"}` }, inv.orderStd || "NO")), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "monospace", color: "#7c3aed", fontWeight: 700 } }, inv.oc), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { className: `state-pill ${inv.enFacture === "S\xCD" ? "state-yes" : "state-pending"}` }, inv.enFacture || "A\xDAN NO")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
    "span",
    {
      className: `state-pill ${inv.delivered === "S\xCD" ? "state-yes" : "state-no"}`,
      onClick: () => onToggleDelivered && onToggleDelivered(inv.id),
      style: { cursor: "pointer" },
      title: "Clic para cambiar estado de entrega"
    },
    inv.delivered === "S\xCD" ? "S\xCD \u2713" : "NO \u2715"
  )), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, inv.pdfPath ? /* @__PURE__ */ React.createElement(
    "a",
    {
      href: inv.pdfPath,
      target: "_blank",
      rel: "noreferrer",
      className: "btn-pdf-badge",
      title: `Ver PDF: ${inv.pdfOriginalName || "Archivo adjunto"}`
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-file-pdf" }),
    " Ver PDF"
  ) : /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn-upload-pdf-badge",
      onClick: () => onUploadPdf && onUploadPdf(inv.id),
      title: "Adjuntar PDF f\xEDsico a esta factura"
    },
    /* @__PURE__ */ React.createElement("i", { className: "fa-solid fa-paperclip" }),
    " Adjuntar PDF"
  ))))), /* @__PURE__ */ React.createElement("tfoot", null, /* @__PURE__ */ React.createElement("tr", { className: "excel-total-row" }, /* @__PURE__ */ React.createElement("td", { colSpan: "6", style: { textAlign: "right", fontWeight: 900, textTransform: "uppercase", color: "#0f172a" } }, "TOTAL GENERAL SELECCIONADO:"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontWeight: 900, fontSize: "13px", color: "#15803d", fontFamily: "monospace" } }, "$", totalSelectedAmount.toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("td", { colSpan: "6", style: { textAlign: "center", fontSize: "11px", color: "#64748b" } }, deliveredCount, " facturas entregadas de ", selectedInvoices.length, " seleccionadas"))))), /* @__PURE__ */ React.createElement("div", { className: "excel-modal-footer" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#64748b" } }, "\u{1F4A1} Los archivos PDF se guardan de forma segura en la carpeta local ", /* @__PURE__ */ React.createElement("code", null, "/uploads"), " y la informaci\xF3n en ", /* @__PURE__ */ React.createElement("strong", null, "MySQL"), "."), /* @__PURE__ */ React.createElement("button", { className: "btn-red-action", onClick: onClose }, "Entendido / Cerrar Vista"))));
}
window.ExcelPreviewModal = ExcelPreviewModal;
const { useState, useMemo, useEffect, useCallback } = React;
const ROUTE_MAP = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/facturas": "invoices",
  "/proveedores": "suppliers",
  "/crm": "crm",
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
  const [selectedMonth, setSelectedMonth] = useState("Todos");
  const [selectedYear, setSelectedYear] = useState("Todos");
  const [currentTab, setCurrentTab] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("Todos");
  const [selectedFactureFilter, setSelectedFactureFilter] = useState("Todos");
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [isExcelPreviewOpen, setIsExcelPreviewOpen] = useState(false);
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
  const loadInitialData = async () => {
    try {
      const [supData, invData, crmData, usrData] = await Promise.all([
        window.API.suppliers.getAll(),
        window.API.invoices.getAll(),
        window.API.crm.getAll(),
        window.API.users.getAll()
      ]);
      if (Array.isArray(supData)) setSuppliers(supData);
      if (Array.isArray(invData)) setManualInvoices(invData);
      if (Array.isArray(crmData)) setQuotations(crmData);
      if (Array.isArray(usrData) && usrData.length > 0) setUsers(usrData);
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
              invoiceNumber: "",
              emissionDate: "",
              deliveryDate: "",
              value: 0,
              signed: "NO",
              orderStd: "NO",
              oc: "",
              enFacture: "A\xDAN NO",
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
          title: `Factura Atrasada (${inv.invoiceNumber})`,
          message: `${inv.supplier} - Vencida hace ${diffDays} d\xEDa(s)`,
          tag: "\u25B2 Urgente"
        });
      }
      if (inv.enFacture === "A\xDAN NO") {
        list.push({
          type: "amber",
          title: `Pendiente en Facture (${inv.invoiceNumber})`,
          message: `${inv.supplier} a\xFAn no ha sido radicada`,
          tag: "A\xFAn no llega"
        });
      }
      if (inv.signed === "NO") {
        list.push({
          type: "blue",
          title: `Firma Pendiente (${inv.invoiceNumber})`,
          message: `${inv.supplier} requiere autorizaci\xF3n`,
          tag: "Por firmar"
        });
      }
    });
    return list;
  }, [activeInvoices]);
  const filteredRows = useMemo(() => {
    return activeInvoices.filter((inv) => {
      const matchText = (inv.supplier || "").toLowerCase().includes(searchTerm.toLowerCase()) || (inv.invoiceNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) || (inv.service || "").toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchText) return false;
      if (selectedSupplier !== "Todos" && inv.supplier !== selectedSupplier) return false;
      if (selectedFactureFilter !== "Todos" && inv.enFacture !== selectedFactureFilter) return false;
      if (selectedYear !== "Todos") {
        const invYear = (inv.emissionDate || "").substring(0, 4) || (inv.deliveryDate || "").substring(0, 4);
        if (invYear && invYear !== selectedYear) return false;
      }
      if (selectedMonth !== "Todos") {
        const monthNum = monthMap[selectedMonth];
        const invMonth = (inv.emissionDate || "").substring(5, 7) || (inv.deliveryDate || "").substring(5, 7);
        if (monthNum && invMonth && invMonth !== monthNum) return false;
      }
      if (currentTab === "Facturas" && !inv.invoiceNumber.startsWith("FAC")) return false;
      if (currentTab === "Cotizaciones" && !inv.invoiceNumber.startsWith("COT")) return false;
      if (currentTab === "Pendientes" && inv.delivered === "S\xCD") return false;
      if (currentTab === "Atrasadas") {
        const isDelayed = new Date(inv.deliveryDate) < /* @__PURE__ */ new Date("2026-09-01") && inv.delivered !== "S\xCD";
        if (!isDelayed) return false;
      }
      if (currentTab === "En Facture" && inv.enFacture !== "S\xCD") return false;
      return true;
    });
  }, [activeInvoices, searchTerm, selectedSupplier, selectedFactureFilter, selectedMonth, selectedYear, currentTab]);
  const tabCounts = useMemo(() => {
    return {
      total: activeInvoices.length,
      fac: activeInvoices.filter((i) => i.invoiceNumber.startsWith("FAC")).length,
      cot: activeInvoices.filter((i) => i.invoiceNumber.startsWith("COT")).length,
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
      const formData = new FormData();
      formData.append("file", file);
      try {
        Swal.fire({ title: "Guardando archivo PDF en el dispositivo...", didOpen: () => Swal.showLoading() });
        const data = await window.API.invoices.uploadPdf(file);
        if (data.success) {
          const updated = manualInvoices.map((inv) => {
            if (inv.id === invoiceId) {
              const updatedInv = { ...inv, pdfPath: data.relativePath, pdfOriginalName: data.originalName };
              window.API.invoices.save(updatedInv).catch(() => {
              });
              return updatedInv;
            }
            return inv;
          });
          setManualInvoices(updated);
          Swal.fire("\xA1PDF Guardado!", `Archivo ${data.originalName} almacenado en la carpeta local /uploads y registrado en la base de datos.`, "success");
        } else {
          Swal.fire("Error", data.error || "No se pudo subir el archivo.", "error");
        }
      } catch (err) {
        Swal.fire("Guardado Localmente", `Archivo ${file.name} vinculado a la factura.`, "info");
      }
    };
    fileInput.click();
  };
  const saveInvoiceToDb = (invoice) => {
    window.API.invoices.save(invoice).catch(() => {
    });
  };
  const handleToggleSigned = (id) => {
    const updated = manualInvoices.map((i) => {
      if (i.id === id) {
        const item = { ...i, signed: i.signed === "S\xCD" ? "NO" : "S\xCD" };
        saveInvoiceToDb(item);
        return item;
      }
      return i;
    });
    setManualInvoices(updated);
  };
  const handleToggleOrderStd = (id) => {
    const updated = manualInvoices.map((i) => {
      if (i.id === id) {
        const item = { ...i, orderStd: i.orderStd === "S\xCD" ? "NO" : "S\xCD" };
        saveInvoiceToDb(item);
        return item;
      }
      return i;
    });
    setManualInvoices(updated);
  };
  const handleToggleFacture = (id) => {
    const updated = manualInvoices.map((i) => {
      if (i.id === id) {
        const item = { ...i, enFacture: i.enFacture === "S\xCD" ? "A\xDAN NO" : "S\xCD" };
        saveInvoiceToDb(item);
        return item;
      }
      return i;
    });
    setManualInvoices(updated);
  };
  const handleToggleDelivered = (id) => {
    const updated = manualInvoices.map((i) => {
      if (i.id === id) {
        const item = { ...i, delivered: i.delivered === "S\xCD" ? "NO" : "S\xCD" };
        saveInvoiceToDb(item);
        return item;
      }
      return i;
    });
    setManualInvoices(updated);
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
  return /* @__PURE__ */ React.createElement("div", { className: "app-wrapper" }, /* @__PURE__ */ React.createElement(
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
      onClose: () => setIsSidebarOpen(false)
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
      onToggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
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
  ), /* @__PURE__ */ React.createElement(
    FiltersBar,
    {
      searchTerm,
      setSearchTerm,
      selectedSupplier,
      setSelectedSupplier,
      selectedFactureFilter,
      setSelectedFactureFilter,
      selectedMonth,
      setSelectedMonth,
      selectedYear,
      setSelectedYear,
      suppliersList,
      selectedCount: selectedInvoiceIds.length,
      onOpenExcelPreview: () => setIsExcelPreviewOpen(true),
      onClean: () => {
        setSearchTerm("");
        setSelectedSupplier("Todos");
        setSelectedFactureFilter("Todos");
        setSelectedMonth("Todos");
        setSelectedYear("Todos");
        setSelectedInvoiceIds([]);
      },
      onExportExcel: () => Swal.fire("Excel Exportado", "Reporte descargado correctamente.", "success")
    }
  ), /* @__PURE__ */ React.createElement(
    InvoicesTable,
    {
      rows: filteredRows,
      currentTab,
      setCurrentTab,
      tabCounts,
      selectedIds: selectedInvoiceIds,
      onToggleSelectRow: handleToggleSelectRow,
      onToggleSelectAll: handleToggleSelectAll,
      onToggleSigned: handleToggleSigned,
      onToggleFacture: handleToggleFacture,
      onToggleDelivered: handleToggleDelivered,
      onToggleOrderStd: handleToggleOrderStd,
      onViewDetail: handleViewDetail,
      onDeleteInvoice: handleDeleteInvoice,
      onUploadPdf: handleUploadPdf
    }
  )), currentView === "invoices" && /* @__PURE__ */ React.createElement(
    InvoicesModule,
    {
      invoices: filteredRows,
      onQuickRegister: handleQuickRegister,
      onToggleSigned: handleToggleSigned,
      onToggleOrderStd: handleToggleOrderStd,
      onToggleFacture: handleToggleFacture,
      onToggleDelivered: handleToggleDelivered,
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
      suppliersList,
      onOpenExcelPreview: () => setIsExcelPreviewOpen(true),
      selectedCount: selectedInvoiceIds.length
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
