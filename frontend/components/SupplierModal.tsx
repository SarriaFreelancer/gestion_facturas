'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Hash, 
  Plus, 
  Trash2, 
  CheckCircle2,
  CreditCard,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
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
  const [tradeName, setTradeName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('General');
  const [paymentConditions, setPaymentConditions] = useState('Crédito 30 días');
  const [bankName, setBankName] = useState('');
  const [bankAccountType, setBankAccountType] = useState('Ahorros');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [status, setStatus] = useState<'Activo' | 'Inactivo'>('Activo');
  const [services, setServices] = useState<SupplierService[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSupplier) {
      setNit(initialSupplier.nit || '');
      setName(initialSupplier.name || '');
      setTradeName(initialSupplier.tradeName || '');
      setContact(initialSupplier.contact || '');
      setPhone(initialSupplier.phone || '');
      setEmail(initialSupplier.email || '');
      setAddress(initialSupplier.address || '');
      setCity(initialSupplier.city || '');
      setArea(initialSupplier.area || 'General');
      setPaymentConditions(initialSupplier.paymentConditions || 'Crédito 30 días');
      setBankName(initialSupplier.bankName || '');
      setBankAccountType(initialSupplier.bankAccountType || 'Ahorros');
      setBankAccountNumber(initialSupplier.bankAccountNumber || '');
      setStatus((initialSupplier.status as any) || 'Activo');
      setServices(initialSupplier.services || []);
    } else {
      setNit('');
      setName('');
      setTradeName('');
      setContact('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('');
      setArea('General');
      setPaymentConditions('Crédito 30 días');
      setBankName('');
      setBankAccountType('Ahorros');
      setBankAccountNumber('');
      setStatus('Activo');
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
        tradeName: tradeName.trim() || undefined,
        contact: contact.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        area: area.trim() || 'General',
        paymentConditions: paymentConditions.trim() || 'Crédito 30 días',
        bankName: bankName.trim() || undefined,
        bankAccountType: bankAccountType.trim() || 'Ahorros',
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        status: status,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* ENCABEZADO CON GRADIENTE ENRIKO */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                {initialSupplier ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-white/90 font-medium">
                Alimentos Enriko — Maestro de Proveedores y Condiciones Comerciales
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

        {/* CUERPO DEL FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs">

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 font-bold text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>{error}</span>
            </div>
          )}

          {/* DATOS BÁSICOS & FISCALES */}
          <div className="space-y-3">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 dark:border-zinc-800 pb-1">
              1. Identificación y Razón Social
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* NIT / RUT */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-red-600" />
                  <span>NIT / RUT *</span>
                </label>
                <input
                  type="text"
                  required
                  value={nit}
                  onChange={e => setNit(e.target.value)}
                  placeholder="Ej. 900123456-1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* ESTADO */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  <span>Estado del Proveedor</span>
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Activo">Activo (Habilitado para Facturar)</option>
                  <option value="Inactivo">Inactivo (Suspendido)</option>
                </select>
              </div>

              {/* RAZON SOCIAL */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Razón Social Completa *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. HARINAS DEL VALLE S.A.S."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* NOMBRE COMERCIAL */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-red-600" />
                  <span>Nombre Comercial (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={e => setTradeName(e.target.value)}
                  placeholder="Ej. Harinas El Sol"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* ÁREA ENRIKO RESPONSABLE */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Área Enriko Responsable</span>
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="Ej. Compras, Producción, TI, Finanzas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* CONTACTO & UBICACIÓN */}
          <div className="space-y-3">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 dark:border-zinc-800 pb-1">
              2. Contacto y Localización
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Persona de Contacto</span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="Ej. Carlos Mendoza (Ejecutivo)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Teléfono / Celular</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ej. +57 310 987 6543"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Correo Electrónico (Notificaciones)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="facturacion@proveedor.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ciudad</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Ej. Cali, Valle del Cauca"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dirección Comercial</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Ej. Carrera 15 # 45-30, Zona Industrial"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* CONDICIONES DE PAGO & DATOS BANCARIOS */}
          <div className="space-y-3">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 dark:border-zinc-800 pb-1">
              3. Condiciones de Pago & Cuenta Bancaria
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  Plazo de Pago
                </label>
                <select
                  value={paymentConditions}
                  onChange={e => setPaymentConditions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Contado">Contado</option>
                  <option value="Crédito 15 días">Crédito 15 días</option>
                  <option value="Crédito 30 días">Crédito 30 días</option>
                  <option value="Crédito 45 días">Crédito 45 días</option>
                  <option value="Crédito 60 días">Crédito 60 días</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  Banco
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="Ej. Bancolombia, Davivienda"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  Tipo de Cuenta
                </label>
                <select
                  value={bankAccountType}
                  onChange={e => setBankAccountType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Ahorros">Cuenta de Ahorros</option>
                  <option value="Corriente">Cuenta Corriente</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  Número de Cuenta Bancaria
                </label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={e => setBankAccountNumber(e.target.value)}
                  placeholder="Ej. 123-456789-01"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* LISTA DE SERVICIOS / CONCEPTOS FACTURABLES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                4. Conceptos y Servicios Mensuales ({services.length})
              </span>
              <button
                type="button"
                onClick={handleAddService}
                className="text-[11px] font-black text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Añadir Concepto</span>
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {services.map((srv, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={srv.serviceName}
                    onChange={e => handleServiceChange(idx, 'serviceName', e.target.value)}
                    placeholder="Nombre del servicio o producto"
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <select
                    value={srv.type}
                    onChange={e => handleServiceChange(idx, 'type', e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-xs font-bold"
                  >
                    <option value="factura">Factura</option>
                    <option value="cotizacion">Cotización</option>
                  </select>
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-xs shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : initialSupplier ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
