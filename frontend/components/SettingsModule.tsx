'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Mail, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Shield, 
  Send,
  Database,
  RefreshCw,
  Bell,
  Cpu,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  Eye,
  KeyRound,
  FileCheck2,
  Lock,
  Layers,
  Flame,
  Check,
  AlertTriangle
} from 'lucide-react';
import { api } from '../lib/api';
import { notifySuccess, notifyError } from '../lib/alerts';
import { EmailSettings } from '../app/types';

interface SettingsModuleProps {
  onSettingsUpdated?: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ onSettingsUpdated }) => {
  const [activeTab, setActiveTab] = useState<'email' | 'facture' | 'ai' | 'portal'>('email');

  // Email / SMTP Settings State
  const [recipientEmail, setRecipientEmail] = useState('contabilidad@alimentosenriko.com');
  const [ccEmails, setCcEmails] = useState('');
  const [senderName, setSenderName] = useState('Alimentos Enriko S.A.S. — Facturación');
  const [emailSubject, setEmailSubject] = useState('Reporte de Facturas Entregadas — Alimentos Enriko S.A.S.');
  const [emailTemplate, setEmailTemplate] = useState(
    'Estimado equipo de Contabilidad y Pagos,\n\nAdjunto remitimos el reporte consolidado de las facturas que han sido radicadas y entregadas formalmente para su respectiva causación y trámite de pago.\n\nPor favor verificar el detalle en la tabla anexa a continuación.'
  );
  const [frequency, setFrequency] = useState('manual');
  const [outlookEnabled, setOutlookEnabled] = useState(true);
  const [smtpHost, setSmtpHost] = useState('smtp.office365.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  
  // AI Settings State
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingAi, setTestingAi] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  // Portal Proveedores Settings State
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [defaultClientName, setDefaultClientName] = useState('ALIMENTOS ENRIKO SAS');
  const [defaultClientNit, setDefaultClientNit] = useState('890330035');

  // Facture.co State
  const [factureUsername, setFactureUsername] = useState('TicsEnriko');
  const [facturePassword, setFacturePassword] = useState('');
  const [factureNit, setFactureNit] = useState('890330035');
  const [factureCompany, setFactureCompany] = useState('ALIMENTOS ENRIKO S.A.S');
  const [responsibleName, setResponsibleName] = useState('DAVID');
  const [responsibleLastName, setResponsibleLastName] = useState('SARRIA');
  const [responsibleIdNumber, setResponsibleIdNumber] = useState('1144078413');
  const [factureLastSync, setFactureLastSync] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingFacture, setSavingFacture] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [savingPortal, setSavingPortal] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [emailData, factureData] = await Promise.all([
        api.getEmailSettings().catch(() => null),
        api.getFactureStatus().catch(() => null)
      ]);

      if (emailData) {
        if (emailData.recipientEmail) setRecipientEmail(emailData.recipientEmail);
        if (emailData.ccEmails !== undefined) setCcEmails(emailData.ccEmails || '');
        if (emailData.senderName) setSenderName(emailData.senderName);
        if (emailData.emailSubject) setEmailSubject(emailData.emailSubject);
        if (emailData.emailTemplate) setEmailTemplate(emailData.emailTemplate);
        if (emailData.frequency) setFrequency(emailData.frequency);
        if (emailData.smtpHost) setSmtpHost(emailData.smtpHost);
        if (emailData.smtpPort) setSmtpPort(String(emailData.smtpPort));
        if (emailData.smtpUser) setSmtpUser(emailData.smtpUser || '');
        if (emailData.smtpPassword) setSmtpPassword(emailData.smtpPassword || '');
        if (emailData.outlookIntegrationEnabled !== undefined) {
          setOutlookEnabled(Boolean(emailData.outlookIntegrationEnabled));
        }
        if (emailData.portalEnabled !== undefined) {
          setPortalEnabled(Boolean(emailData.portalEnabled));
        }
        if (emailData.defaultClientName) setDefaultClientName(emailData.defaultClientName);
        if (emailData.defaultClientNit) setDefaultClientNit(emailData.defaultClientNit);
        if (emailData.geminiApiKey) setGeminiApiKey(emailData.geminiApiKey);
      }

      if (factureData) {
        if (factureData.username) setFactureUsername(factureData.username);
        if (factureData.nit) setFactureNit(factureData.nit);
        if (factureData.companyName) setFactureCompany(factureData.companyName);
        if (factureData.responsibleName) setResponsibleName(factureData.responsibleName);
        if (factureData.responsibleLastName) setResponsibleLastName(factureData.responsibleLastName);
        if (factureData.responsibleIdNumber) setResponsibleIdNumber(factureData.responsibleIdNumber);
        if (factureData.lastSyncAt) setFactureLastSync(factureData.lastSyncAt);
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      notifyError('Campo requerido', 'Por favor ingresa el correo destinatario.');
      return;
    }

    try {
      setSavingEmail(true);
      await api.saveEmailSettings({
        recipientEmail: recipientEmail.trim(),
        ccEmails: ccEmails.trim(),
        senderName: senderName.trim(),
        emailSubject: emailSubject.trim(),
        emailTemplate: emailTemplate.trim(),
        frequency,
        outlookIntegrationEnabled: outlookEnabled ? 1 : 0,
        smtpHost: smtpHost.trim(),
        smtpPort: parseInt(smtpPort) || 587,
        smtpUser: smtpUser.trim(),
        smtpPassword: smtpPassword.trim(),
        portalEnabled: portalEnabled ? 1 : 0,
        defaultClientName: defaultClientName.trim(),
        defaultClientNit: defaultClientNit.trim(),
        geminiApiKey: geminiApiKey.trim()
      });
      notifySuccess('Configuración Guardada', 'Ajustes de correo y servidor SMTP actualizados correctamente.');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err: any) {
      notifyError('Error al guardar', err.message);
    } finally {
      setSavingEmail(false);
    }
  };

  const handleTestEmail = async () => {
    if (!smtpUser.trim() || !smtpPassword.trim()) {
      notifyError('Credenciales faltantes', 'Ingresa el Usuario SMTP y Contraseña antes de realizar la prueba.');
      return;
    }
    try {
      setTestingEmail(true);
      await api.saveEmailSettings({
        recipientEmail: recipientEmail.trim(),
        ccEmails: ccEmails.trim(),
        senderName: senderName.trim(),
        emailSubject: emailSubject.trim(),
        emailTemplate: emailTemplate.trim(),
        frequency,
        outlookIntegrationEnabled: outlookEnabled ? 1 : 0,
        smtpHost: smtpHost.trim(),
        smtpPort: parseInt(smtpPort) || 587,
        smtpUser: smtpUser.trim(),
        smtpPassword: smtpPassword.trim(),
        portalEnabled: portalEnabled ? 1 : 0,
        defaultClientName: defaultClientName.trim(),
        defaultClientNit: defaultClientNit.trim(),
        geminiApiKey: geminiApiKey.trim()
      });

      const res = await api.testEmailConnection(recipientEmail.trim(), ccEmails.trim());
      notifySuccess('¡Prueba Exitosa!', res.message || 'Se envió el correo de prueba satisfactoriamente.');
    } catch (err: any) {
      notifyError('Fallo en la prueba SMTP', err.message);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleSaveFacture = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingFacture(true);
      await api.updateFactureCredentials({
        username: factureUsername.trim(),
        password: facturePassword.trim() || 'Septiembre2026*',
        nit: factureNit.trim(),
        companyName: factureCompany.trim(),
        responsibleName: responsibleName.trim(),
        responsibleLastName: responsibleLastName.trim(),
        responsibleIdNumber: responsibleIdNumber.trim(),
        autoSync: 0
      });
      notifySuccess('Configuración Facture.co', 'Credenciales y responsable DIAN guardados correctamente.');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err: any) {
      notifyError('Error al guardar Facture.co', err.message);
    } finally {
      setSavingFacture(false);
    }
  };

  const handleSaveAi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingAi(true);
      await api.saveEmailSettings({
        recipientEmail: recipientEmail.trim(),
        ccEmails: ccEmails.trim(),
        senderName: senderName.trim(),
        emailSubject: emailSubject.trim(),
        emailTemplate: emailTemplate.trim(),
        frequency,
        outlookIntegrationEnabled: outlookEnabled ? 1 : 0,
        smtpHost: smtpHost.trim(),
        smtpPort: parseInt(smtpPort) || 587,
        smtpUser: smtpUser.trim(),
        smtpPassword: smtpPassword.trim(),
        portalEnabled: portalEnabled ? 1 : 0,
        defaultClientName: defaultClientName.trim(),
        defaultClientNit: defaultClientNit.trim(),
        geminiApiKey: geminiApiKey.trim()
      });
      notifySuccess('Inteligencia Artificial', 'Clave de API de Gemini guardada correctamente.');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err: any) {
      notifyError('Error al guardar IA', err.message);
    } finally {
      setSavingAi(false);
    }
  };

  const handleTestAi = async () => {
    if (!geminiApiKey.trim()) {
      notifyError('API Key Requerida', 'Por favor ingresa la API Key de Google Gemini antes de probar la conexión.');
      return;
    }
    try {
      setTestingAi(true);
      setAiStatusMessage(null);
      const res = await api.testAiConnection(geminiApiKey.trim());
      setAiStatusMessage(res.response || 'Conexión verificada con Gemini AI');
      notifySuccess('¡Conexión IA Exitosa!', `Modelo: ${res.model || 'Gemini'} respondiendo con éxito.`);
    } catch (err: any) {
      setAiStatusMessage(null);
      notifyError('Error de Conexión IA', err.message);
    } finally {
      setTestingAi(false);
    }
  };

  const handleSavePortal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPortal(true);
      await api.saveEmailSettings({
        recipientEmail: recipientEmail.trim(),
        ccEmails: ccEmails.trim(),
        senderName: senderName.trim(),
        emailSubject: emailSubject.trim(),
        emailTemplate: emailTemplate.trim(),
        frequency,
        outlookIntegrationEnabled: outlookEnabled ? 1 : 0,
        smtpHost: smtpHost.trim(),
        smtpPort: parseInt(smtpPort) || 587,
        smtpUser: smtpUser.trim(),
        smtpPassword: smtpPassword.trim(),
        portalEnabled: portalEnabled ? 1 : 0,
        defaultClientName: defaultClientName.trim(),
        defaultClientNit: defaultClientNit.trim(),
        geminiApiKey: geminiApiKey.trim()
      });
      notifySuccess('Portal de Proveedores', `Módulo de facturas internas ${portalEnabled ? 'HABILITADO' : 'INHABILITADO'} correctamente.`);
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err: any) {
      notifyError('Error al guardar Portal', err.message);
    } finally {
      setSavingPortal(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 flex-shrink-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2 flex-wrap">
              <span>Centro de Configuración Integral</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Administración de servicios de Correo, Facture.co DIAN, Inteligencia Artificial Multimodal y Portal de Proveedores.
            </p>
          </div>
        </div>

        <button
          onClick={loadSettings}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Recargar Ajustes</span>
        </button>
      </div>

      {/* PESTAÑAS DE SUB-MÓDULOS */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            activeTab === 'email'
              ? 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-sm border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>1. Correo & Outlook SMTP</span>
        </button>

        <button
          onClick={() => setActiveTab('facture')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            activeTab === 'facture'
              ? 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-sm border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>2. Facture.co & DIAN</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-500" />
          <span>3. Inteligencia Artificial (Gemini)</span>
        </button>

        <button
          onClick={() => setActiveTab('portal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            activeTab === 'portal'
              ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-emerald-500" />
          <span>4. Portal Proveedores & Radicación</span>
        </button>
      </div>

      {/* CONTENIDO DEL SUB-MÓDULO 1: CORREO & OUTLOOK SMTP */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleSaveEmail} className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
                <Mail className="w-4 h-4 text-red-600" />
                <span>Plantilla & Correo Destinatario (Outlook)</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                Integración Activa
              </span>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Correo Electrónico Destinatario (Para) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="ejemplo@alimentosenriko.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Usuarios / Correos en Copia (CC)
              </label>
              <input
                type="text"
                value={ccEmails}
                onChange={(e) => setCcEmails(e.target.value)}
                placeholder="auditoria@alimentosenriko.com, direccion@alimentosenriko.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Nombre del Remitente
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Asunto del Correo
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Mensaje Introductorio del Reporte
              </label>
              <textarea
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none text-xs resize-none"
              />
            </div>

            {/* CREDENCIALES SMTP */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Servidor de Envío SMTP Corporativo</span>
                </div>
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Send className={`w-3 h-3 text-red-600 ${testingEmail ? 'animate-pulse' : ''}`} />
                  <span>{testingEmail ? 'Enviando...' : 'Probar Envío'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Servidor SMTP Host
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.office365.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Puerto SMTP
                  </label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Usuario / Correo Remitente
                  </label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="notificaciones@alimentosenriko.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Contraseña SMTP / App Password
                  </label>
                  <input
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={savingEmail}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingEmail ? 'Guardando...' : 'Guardar Ajustes de Correo'}</span>
              </button>
            </div>
          </form>

          {/* INFORMATIVO */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Despacho Automatizado</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                Los correos se envían en formato HTML con el diseño corporativo de Alimentos Enriko, tabla de facturas, desglose de IVA y valores netos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DEL SUB-MÓDULO 2: FACTURE.CO & DIAN */}
      {activeTab === 'facture' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleSaveFacture} className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
                <Building2 className="w-4 h-4 text-red-600" />
                <span>Credenciales de Facture.co & Firma de Eventos DIAN</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                Sincronización Activa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Usuario de Facture.co <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={factureUsername}
                  onChange={(e) => setFactureUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Contraseña de Facture.co
                </label>
                <input
                  type="password"
                  value={facturePassword}
                  onChange={(e) => setFacturePassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  NIT de la Empresa
                </label>
                <input
                  type="text"
                  value={factureNit}
                  onChange={(e) => setFactureNit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Razón Social
                </label>
                <input
                  type="text"
                  value={factureCompany}
                  onChange={(e) => setFactureCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium text-xs outline-none"
                />
              </div>
            </div>

            {/* RESPONSABLE DE EVENTOS DIAN */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Datos del Responsable de Emisión de Eventos DIAN</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Nombres
                  </label>
                  <input
                    type="text"
                    value={responsibleName}
                    onChange={(e) => setResponsibleName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={responsibleLastName}
                    onChange={(e) => setResponsibleLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Cédula / Documento
                  </label>
                  <input
                    type="text"
                    value={responsibleIdNumber}
                    onChange={(e) => setResponsibleIdNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={savingFacture}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingFacture ? 'Guardando...' : 'Guardar Credenciales Facture'}</span>
              </button>
            </div>
          </form>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
                <Building2 className="w-4 h-4 text-red-600" />
                <span>Sincronización Segura</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                Permite la descarga automática de facturas recibidas y la emisión oficial de los eventos DIAN (Acuse de Recibo, Recibo del Bien/Servicio y Aceptación Expresa).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DEL SUB-MÓDULO 3: INTELIGENCIA ARTIFICIAL (GEMINI) */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleSaveAi} className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>Motor de Inteligencia Artificial Multimodal (Google Gemini)</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                Lectura Total de Páginas PDF
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Google Gemini API Key <span className="text-purple-500">*</span>
              </label>
              
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                La API Key es utilizada para la extracción multimodal de ítems, cálculo discriminado de IVA, fechas de vencimiento y verificación de sumatorias de todas las páginas de los PDFs.
              </p>
            </div>

            {aiStatusMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{aiStatusMessage}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleTestAi}
                disabled={testingAi}
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border border-purple-200 dark:border-purple-800"
              >
                <Sparkles className={`w-3.5 h-3.5 ${testingAi ? 'animate-spin' : ''}`} />
                <span>{testingAi ? 'Verificando con Gemini...' : 'Probar Conexión con IA'}</span>
              </button>

              <button
                type="submit"
                disabled={savingAi}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingAi ? 'Guardando...' : 'Guardar Clave de IA'}</span>
              </button>
            </div>
          </form>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-purple-900 dark:text-purple-300">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>Modelos de IA Disponibles</span>
              </div>
              <ul className="text-[11px] text-purple-800 dark:text-purple-300/80 space-y-1.5 list-disc list-inside">
                <li><strong>gemini-3.8-flash:</strong> Alta velocidad y precisión contable.</li>
                <li><strong>gemini-flash-latest:</strong> Reconocimiento visual y OCR de tablas.</li>
                <li><strong>gemini-2.5-flash-lite:</strong> Extracción ligera y respuestas rápidas.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DEL SUB-MÓDULO 4: PORTAL DE PROVEEDORES & RADICACIÓN */}
      {activeTab === 'portal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleSavePortal} className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Portal de Radicación Interna de Proveedores</span>
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                portalEnabled 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
              }`}>
                {portalEnabled ? 'Módulo Habilitado' : 'Módulo Inhabilitado'}
              </span>
            </div>

            {/* SWITCH HABILITAR / INHABILITAR */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  Habilitar Módulo y Subida de Facturas de Proveedores
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Permite acceder a la Bandeja de Facturas Internas y subir Facturas de Venta o Notas Crédito (a crédito o contado).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPortalEnabled(!portalEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  portalEnabled 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                }`}
              >
                {portalEnabled ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    <span>Habilitado</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    <span>Inhabilitado</span>
                  </>
                )}
              </button>
            </div>

            {/* CLIENTE POR DEFECTO (RECEPTOR) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Cliente Receptor Predeterminado <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={defaultClientName}
                  onChange={(e) => setDefaultClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  NIT Cliente Receptor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={defaultClientNit}
                  onChange={(e) => setDefaultClientNit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono text-xs outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="submit"
                disabled={savingPortal}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPortal ? 'Guardando...' : 'Guardar Parámetros de Proveedores'}</span>
              </button>
            </div>
          </form>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Radicación Directa</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80 leading-relaxed">
                Al activar este módulo, los usuarios podrán radicar facturas y notas crédito directamente arrastrando su PDF, con autocompletado inteligente por IA y vinculación directa al control de pagos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
