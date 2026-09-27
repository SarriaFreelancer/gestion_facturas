'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, User, Phone, Mail, MapPin, Hash, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Supplier, SupplierService } from '../app/types';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplierData: Partial<Supplier>) => Promise<void>;
  initialSupplier?: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSupplier
}) => {
  const [nit, setNit] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('General');
  const [services, setServices] = useState<SupplierService[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSupplier) {
      setNit(initialSupplier.nit || '');
      setName(initialSupplier.name || '');
      setContact(initialSupplier.contact || '');
      setPhone(initialSupplier.phone || '');
      setEmail(initialSupplier.email || '');
      setArea(initialSupplier.area || 'General');
      setServices(initialSupplier.services || []);
    } else {
      setNit('');
      setName('');
      setContact('');
      setPhone('');
      setEmail('');
      setArea('General');
      setServices([
        { serviceName: 'Facturación Mensual Estándar', type: 'factura', enabled: true }
      ]);
    }
    setError(null);
  }, [initialSupplier, isOpen]);

  if (!isOpen) return null;

  const handleAddService = () => {
    setServices(prev => [
      ...prev,
      { serviceName: `Servicio #${prev.length + 1}`, type: 'factura', enabled: true }
    ]);
  };

  const handleRemoveService = (idx: number) => {
    setServices(prev => prev.filter((_, i) => i !== idx));
  };

  const handleServiceChange = (idx: number, field: keyof SupplierService, val: any) => {
    setServices(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nit.trim()) {
      setError('El NIT y la Razón Social son campos obligatorios.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        id: initialSupplier?.id,
        nit: nit.trim(),
        name: name.trim(),
        contact: contact.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        area: area.trim() || 'General',
        monthlyCount: services.length,
        services: services
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar proveedor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* ENCABEZADO CON GRADIENTE ENRIKO */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">
                {initialSupplier ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
              </h2>
              <p className="text-[11px] text-white/90 font-medium">
                Alimentos Enriko — Directorio Autorizado
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO CON METRICA VISUAL Y PADDINGS AMPLIOS */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 font-bold text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NIT / RUT */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-red-600" />
                <span>NIT / RUT *</span>
              </label>
              <input
                type="text"
                value={nit}
                onChange={e => setNit(e.target.value)}
                placeholder="ej: 900.849.201-1"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
                required
              />
            </div>

            {/* RAZÓN SOCIAL */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-red-600" />
                <span>Razón Social / Proveedor *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ej: Distribuidora Alimentos SAS"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CONTACTO / ASESOR */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-600" />
                <span>Contacto / Asesor</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="ej: Lic. Carlos Gómez"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
              />
            </div>

            {/* TELÉFONO */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span>Teléfono / Móvil</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="ej: +57 310 445 9920"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CORREO ELECTRÓNICO */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-600" />
                <span>Correo Electrónico</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ej: facturacion@proveedor.com"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
              />
            </div>

            {/* ÁREA ASIGNADA */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>Área Organizacional</span>
              </label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 transition-all shadow-inner cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Tecnología (TI)">Tecnología (TI)</option>
                <option value="Adquisiciones & Compras">Adquisiciones & Compras</option>
                <option value="Contabilidad & Finanzas">Contabilidad & Finanzas</option>
                <option value="Operaciones & Planta">Operaciones & Planta</option>
                <option value="Dirección General">Dirección General</option>
              </select>
            </div>
          </div>

          {/* CONCEPTOS / SERVICIOS RECURRENTES */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Conceptos Recurrentes ({services.length})
                </span>
                <p className="text-[10px] text-slate-400">
                  Define si este proveedor emite Facturas o Cotizaciones de manera recurrente.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddService}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-red-600" />
                <span>Agregar Concepto</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {services.map((srv, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700"
                >
                  <input
                    type="text"
                    value={srv.serviceName}
                    onChange={e => handleServiceChange(idx, 'serviceName', e.target.value)}
                    placeholder="Descripción del concepto"
                    className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-bold text-xs outline-none focus:border-red-500"
                  />

                  <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => handleServiceChange(idx, 'type', 'factura')}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                        srv.type === 'factura'
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Factura
                    </button>
                    <button
                      type="button"
                      onClick={() => handleServiceChange(idx, 'type', 'cotizacion')}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                        srv.type === 'cotizacion'
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Cotización
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 flex items-center justify-center cursor-pointer"
                    title="Eliminar concepto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold flex items-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Guardando...' : (initialSupplier ? 'Actualizar Proveedor' : 'Crear Proveedor')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
