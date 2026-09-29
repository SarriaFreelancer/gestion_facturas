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
  Bell
} from 'lucide-react';
import { api } from '../lib/api';
import { notifySuccess, notifyError } from '../lib/alerts';
import { EmailSettings } from '../app/types';

interface SettingsModuleProps {
  onSettingsUpdated?: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ onSettingsUpdated }) => {
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Facture.co State
  const [factureUsername, setFactureUsername] = useState('TicsEnriko');
  const [facturePassword, setFacturePassword] = useState('');
  const [factureNit, setFactureNit] = useState('890330035');
  const [factureCompany, setFactureCompany] = useState('ALIMENTOS ENRIKO S.A.S');
  const [responsibleName, setResponsibleName] = useState('DAVID');
  const [responsibleLastName, setResponsibleLastName] = useState('SARRIA');
  const [responsibleIdNumber, setResponsibleIdNumber] = useState('1144078413');
  const [factureLastSync, setFactureLastSync] = useState<string | null>(null);
  const [savingFacture, setSavingFacture] = useState(false);

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
        if (emailData.ccEmails) setCcEmails(emailData.ccEmails);
        if (emailData.senderName) setSenderName(emailData.senderName);
        if (emailData.emailSubject) setEmailSubject(emailData.emailSubject);
        if (emailData.emailTemplate) setEmailTemplate(emailData.emailTemplate);
        if (emailData.frequency) setFrequency(emailData.frequency);
        if (emailData.smtpHost) setSmtpHost(emailData.smtpHost);
        if (emailData.smtpPort) setSmtpPort(String(emailData.smtpPort));
        if (emailData.smtpUser) setSmtpUser(emailData.smtpUser);
        if (emailData.smtpPassword) setSmtpPassword(emailData.smtpPassword);
        if (emailData.outlookIntegrationEnabled !== undefined) {
          setOutlookEnabled(Boolean(emailData.outlookIntegrationEnabled));
        }
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
      notifySuccess('Configuración Facture.co', 'Parámetros de acceso y datos de responsable para eventos guardados correctamente.');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err: any) {
      notifyError('Error al guardar Facture.co', err.message);
    } finally {
      setSavingFacture(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      notifyError('Campo requerido', 'Por favor ingresa el correo destinatario.');
      return;
    }

    try {
      setSaving(true);
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
        smtpPassword: smtpPassword.trim()
      });
      notifySuccess('Configuración Guardada', 'Los ajustes de correo y servidor SMTP se actualizaron correctamente.');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err: any) {
      notifyError('Error al guardar', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!smtpUser.trim() || !smtpPassword.trim()) {
      notifyError('Credenciales faltantes', 'Por favor ingresa el Usuario SMTP y Contraseña antes de realizar la prueba.');
      return;
    }
    try {
      setTesting(true);
      // Primero guardar por si hubo cambios
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
        smtpPassword: smtpPassword.trim()
      });

      const res = await api.testEmailConnection(recipientEmail.trim(), ccEmails.trim());
      notifySuccess('¡Prueba Exitosa!', res.message || 'Se envió el correo de prueba satisfactoriamente.');
    } catch (err: any) {
      notifyError('Fallo en la prueba SMTP', err.message);
    } finally {
      setTesting(false);
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
              <span>Configuración del Sistema & Envíos Outlook</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Parametrización de correos destinatarios, plantillas automáticas y reglas de despacho.
            </p>
          </div>
        </div>

        <button
          onClick={loadSettings}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Recargar</span>
        </button>
      </div>

      {/* FORMULARIO DE CONFIGURACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL PRINCIPAL */}
        <form onSubmit={handleSave} className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
              <Mail className="w-4 h-4 text-red-600" />
              <span>Plantilla & Correo Destinatario (Outlook)</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              Integración Activa
            </span>
          </div>

          {/* CORREO DESTINATARIO */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Correo Electrónico Destinatario (Para) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="ejemplo@alimentosenriko.com, pagos@alimentosenriko.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none text-xs"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Dirección de correo electrónico principal a donde se dirigirán los reportes de facturas entregadas.
            </p>
          </div>

          {/* CORREOS EN COPIA (CC) */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Usuarios / Correos en Copia (CC)
            </label>
            <input
              type="text"
              value={ccEmails}
              onChange={(e) => setCcEmails(e.target.value)}
              placeholder="gerencia@alimentosenriko.com, auditoria@alimentosenriko.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none text-xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Agrega uno o varios correos en copia separados por coma para que también reciban la notificación automáticamente.
            </p>
          </div>

          {/* NOMBRE DE REMITENTE Y ASUNTO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Nombre de Remitente
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
                Asunto Predeterminado
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none text-xs"
                required
              />
            </div>
          </div>

          {/* CUERPO DEL MENSAJE */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Mensaje del Cuerpo del Correo (Introducción antes de la tabla)
            </label>
            <textarea
              rows={4}
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none text-xs resize-none"
            />
          </div>

          {/* CONFIGURACIÓN DEL SERVIDOR SMTP (ENVÍO AUTOMÁTICO SIN ABRIR OUTLOOK) */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs">
                <Send className="w-4 h-4 text-red-600" />
                <span>Servidor SMTP (Envío Automático Directo)</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Permite enviar sin tener que abrir la aplicación de Outlook
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Servidor SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.office365.com / smtp.gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Puerto SMTP
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="587"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Usuario / Correo Remitente SMTP
                </label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="facturas@alimentosenriko.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Contraseña / Contraseña de Aplicación
                </label>
                <input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-[10.5px] text-slate-500 dark:text-zinc-400">
              💡 <strong>Nota Outlook / Office 365:</strong> Si tu cuenta tiene 2FA (verificación en 2 pasos), genera una <em>Contraseña de Aplicación</em> en tu cuenta de Microsoft para conectarte sin inconvenientes.
            </div>
          </div>

          {/* BOTONES GUARDAR Y PROBAR */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testing || !smtpUser || !smtpPassword}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-40"
              title="Enviar un correo de prueba para verificar la conexión SMTP"
            >
              <Send className={`w-4 h-4 text-red-600 ${testing ? 'animate-pulse' : ''}`} />
              <span>{testing ? 'Probando conexión...' : 'Probar Envío de Correo'}</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Parámetros'}</span>
            </button>
          </div>
        </form>

        {/* PANEL LATERAL INFORMATIVO */}
        <div className="lg:col-span-4 space-y-4">
          {/* PANEL FACTURE.CO CREDENCIALES & EVENTOS */}
          <form onSubmit={handleSaveFacture} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs">
                <Database className="w-4 h-4 text-red-600" />
                <span>Integración Facture.co</span>
              </div>
              <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                Conectado
              </span>
            </div>

            <p className="text-[10.5px] text-slate-500 dark:text-zinc-400">
              Credenciales de acceso a la plataforma <a href="https://plataforma.facture.co/plataforma/login" target="_blank" rel="noreferrer" className="text-red-600 underline font-semibold">facture.co</a> y datos del responsable para eventos de aceptación.
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  NIT de Empresa
                </label>
                <input
                  type="text"
                  value={factureNit}
                  onChange={(e) => setFactureNit(e.target.value)}
                  placeholder="890330035"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Usuario Facture.co
                </label>
                <input
                  type="text"
                  value={factureUsername}
                  onChange={(e) => setFactureUsername(e.target.value)}
                  placeholder="TicsEnriko"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Contraseña Facture.co
                </label>
                <input
                  type="password"
                  value={facturePassword}
                  onChange={(e) => setFacturePassword(e.target.value)}
                  placeholder="Septiembre2026*"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                <span className="text-[10.5px] font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wide block mb-2">
                  👤 Responsable para Aceptación (3 campos)
                </span>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-0.5">Nombre</label>
                    <input
                      type="text"
                      value={responsibleName}
                      onChange={(e) => setResponsibleName(e.target.value)}
                      placeholder="DAVID"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-0.5">Apellido</label>
                    <input
                      type="text"
                      value={responsibleLastName}
                      onChange={(e) => setResponsibleLastName(e.target.value)}
                      placeholder="SARRIA"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-0.5">Cédula / Documento</label>
                  <input
                    type="text"
                    value={responsibleIdNumber}
                    onChange={(e) => setResponsibleIdNumber(e.target.value)}
                    placeholder="1144078413"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingFacture}
              className="w-full mt-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingFacture ? 'Guardando...' : 'Guardar Facture.co'}</span>
            </button>
          </form>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs">
              <Shield className="w-4 h-4 text-red-600" />
              <span>Reglas de Entrega & Correo</span>
            </div>
            <div className="space-y-2 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Solo se pueden enviar facturas que tengan <strong>Entregado: SÍ</strong> y fecha de entrega registrada.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Las facturas enviadas quedan marcadas como <strong>Enviada: SÍ</strong> en la base de datos para no repetirse.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Puedes filtrar por fecha exacta de entrega para consolidar la remisión diaria o semanal.</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl p-5 shadow-md space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 block">
              Alimentos Enriko S.A.S.
            </span>
            <h3 className="font-extrabold text-sm leading-snug">
              Sincronización Total MySQL
            </h3>
            <p className="text-[11px] text-white/90 leading-relaxed">
              Todos los cambios de correo y configuración quedan guardados en el servidor en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
