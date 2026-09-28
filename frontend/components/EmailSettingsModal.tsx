'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Settings, 
  X, 
  CheckCircle2, 
  Save, 
  Sparkles, 
  Building2, 
  Clock, 
  Send,
  HelpCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { notifySuccess, notifyError } from '../lib/alerts';
import { EmailSettings } from '../app/types';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [recipientEmail, setRecipientEmail] = useState('contabilidad@alimentosenriko.com');
  const [ccEmails, setCcEmails] = useState('');
  const [senderName, setSenderName] = useState('Alimentos Enriko S.A.S. — Facturación');
  const [emailSubject, setEmailSubject] = useState('Reporte de Facturas Entregadas — Alimentos Enriko S.A.S.');
  const [emailTemplate, setEmailTemplate] = useState(
    'Estimado equipo de Contabilidad y Pagos,\n\nAdjunto remitimos el reporte consolidado de las facturas que han sido radicadas y entregadas formalmente para su respectiva causación y trámite de pago.\n\nPor favor verificar el detalle en la tabla anexa a continuación.'
  );
  const [frequency, setFrequency] = useState('manual');
  const [outlookEnabled, setOutlookEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getEmailSettings();
      if (data) {
        if (data.recipientEmail) setRecipientEmail(data.recipientEmail);
        if (data.ccEmails) setCcEmails(data.ccEmails);
        if (data.senderName) setSenderName(data.senderName);
        if (data.emailSubject) setEmailSubject(data.emailSubject);
        if (data.emailTemplate) setEmailTemplate(data.emailTemplate);
        if (data.frequency) setFrequency(data.frequency);
        if (data.outlookIntegrationEnabled !== undefined) {
          setOutlookEnabled(Boolean(data.outlookIntegrationEnabled));
        }
      }
    } catch (err: any) {
      console.error('Error loading email settings:', err);
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
        ccEmails: ccEmails.trim(),
        senderName: senderName.trim(),
        emailSubject: emailSubject.trim(),
        emailTemplate: emailTemplate.trim(),
        frequency,
        outlookIntegrationEnabled: outlookEnabled ? 1 : 0
      });
      notifySuccess('Configuración Guardada', 'Los parámetros de correo y Outlook se actualizaron correctamente.');
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      notifyError('Error al guardar', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ENCABEZADO */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Configuración de Envío Outlook</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-[11px] text-white/90">
                Destinatarios, asunto y plantilla del reporte de facturas entregadas
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* CONTENIDO FORMULARIO */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none transition-all"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Puedes ingresar uno o varios correos principales separados por comas.
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Agrega correos en copia separados por comas para que también les llegue el reporte.
            </p>
          </div>

          {/* ASUNTO DEL CORREO */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Asunto Predeterminado en Outlook
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Asunto del correo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none transition-all"
              required
            />
          </div>

          {/* MENSAJE O CUERPO DEL CORREO */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Mensaje del Cuerpo del Correo (Encabezado)
            </label>
            <textarea
              rows={4}
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              placeholder="Texto introductorio antes de la tabla de facturas..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Este mensaje aparecerá en el correo antes de la tabla estructurada con el detalle de las facturas.
            </p>
          </div>

          {/* FRECUENCIA / DISPARADOR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Frecuencia / Modo de Envío
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
              >
                <option value="manual">Manual al seleccionar facturas</option>
                <option value="each_delivery">Al marcar cada factura como entregada</option>
                <option value="daily">Consolidado Diario de Entregas</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-800 dark:text-zinc-200 block text-[11px]">
                    Integración con Outlook
                  </span>
                  <span className="text-[9.5px] text-slate-400">
                    Apertura directa de correo en cliente Web / Desktop
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

          {/* NOTA DE SEGURIDAD / DUPLICADOS */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 flex items-start gap-2.5 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Control Anti-Duplicados Activo:</span>
              <span>El sistema registra cada factura enviada para que no vuelva a ser remitida por accidente. Podrás ver en todo momento cuáles están pendientes de enviar.</span>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold transition-all cursor-pointer text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold shadow-md shadow-red-600/30 transition-all cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
