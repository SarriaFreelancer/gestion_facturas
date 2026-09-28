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
  const [senderName, setSenderName] = useState('Alimentos Enriko S.A.S. — Facturación');
  const [emailSubject, setEmailSubject] = useState('Reporte de Facturas Entregadas — Alimentos Enriko S.A.S.');
  const [emailTemplate, setEmailTemplate] = useState(
    'Estimado equipo de Contabilidad y Pagos,\n\nAdjunto remitimos el reporte consolidado de las facturas que han sido radicadas y entregadas formalmente para su respectiva causación y trámite de pago.\n\nPor favor verificar el detalle en la tabla anexa a continuación.'
  );
  const [frequency, setFrequency] = useState('manual');
  const [outlookEnabled, setOutlookEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getEmailSettings();
      if (data) {
        if (data.recipientEmail) setRecipientEmail(data.recipientEmail);
        if (data.senderName) setSenderName(data.senderName);
        if (data.emailSubject) setEmailSubject(data.emailSubject);
        if (data.emailTemplate) setEmailTemplate(data.emailTemplate);
        if (data.frequency) setFrequency(data.frequency);
        if (data.outlookIntegrationEnabled !== undefined) {
          setOutlookEnabled(Boolean(data.outlookIntegrationEnabled));
        }
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
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
        senderName: senderName.trim(),
        emailSubject: emailSubject.trim(),
        emailTemplate: emailTemplate.trim(),
        frequency,
        outlookIntegrationEnabled: outlookEnabled ? 1 : 0
      });
      notifySuccess('Configuración Guardada', 'Los ajustes de correo y Outlook se actualizaron correctamente.');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err: any) {
      notifyError('Error al guardar', err.message);
    } finally {
      setSaving(false);
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
              Correo Electrónico Destinatario <span className="text-red-500">*</span>
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
              Dirección de correo electrónico a donde se dirigirán los reportes de facturas entregadas en Outlook.
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

          {/* FRECUENCIA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Modo / Frecuencia de Despacho
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold outline-none text-xs cursor-pointer"
              >
                <option value="manual">Manual al seleccionar facturas</option>
                <option value="each_delivery">Al marcar cada factura como entregada</option>
                <option value="daily">Consolidado Diario de Entregas</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-800 dark:text-zinc-200 block text-xs">
                    Habilitar Enlace Outlook
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Apertura rápida en Outlook Web & Desktop
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={outlookEnabled}
                  onChange={(e) => setOutlookEnabled(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded accent-red-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* BOTÓN GUARDAR */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
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
