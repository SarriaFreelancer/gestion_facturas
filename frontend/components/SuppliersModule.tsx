'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  History, 
  ChevronDown, 
  ChevronUp, 
  Pencil, 
  Trash2, 
  FileText, 
  X,
  Layers,
  MapPin,
  Building2,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Phone,
  Mail
} from 'lucide-react';
import { Supplier, SupplierService } from '../app/types';

interface SuppliersModuleProps {
  suppliers: Supplier[];
  onAddSupplier: () => void;
  onEditSupplier: (sup: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onUpdateSupplierServices: (supId: string, services: SupplierService[]) => void;
}

export const SuppliersModule: React.FC<SuppliersModuleProps> = ({
  suppliers,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onUpdateSupplierServices
}) => {
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedSupplierId(expandedSupplierId === id ? null : id);
  };

  const handleServiceTypeChange = (sup: Supplier, sIdx: number, newType: 'factura' | 'cotizacion') => {
    const updatedServices = [...(sup.services || [])];
    updatedServices[sIdx] = { ...updatedServices[sIdx], type: newType };
    onUpdateSupplierServices(sup.id, updatedServices);
  };

  const handleServiceNameChange = (sup: Supplier, sIdx: number, newName: string) => {
    const updatedServices = [...(sup.services || [])];
    updatedServices[sIdx] = { ...updatedServices[sIdx], serviceName: newName };
    onUpdateSupplierServices(sup.id, updatedServices);
  };

  const handleToggleServiceEnable = (sup: Supplier, sIdx: number) => {
    const updatedServices = [...(sup.services || [])];
    const currentEnabled = updatedServices[sIdx].enabled !== false;
    updatedServices[sIdx] = { ...updatedServices[sIdx], enabled: !currentEnabled };
    onUpdateSupplierServices(sup.id, updatedServices);
  };

  const handleAddConcept = (sup: Supplier) => {
    const updatedServices = [...(sup.services || [])];
    updatedServices.push({
      serviceName: `Servicio #${updatedServices.length + 1}`,
      type: 'factura',
      enabled: true
    });
    onUpdateSupplierServices(sup.id, updatedServices);
  };

  const handleRemoveConcept = (sup: Supplier, sIdx: number) => {
    const updatedServices = (sup.services || []).filter((_, idx) => idx !== sIdx);
    onUpdateSupplierServices(sup.id, updatedServices);
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const term = searchTerm.toLowerCase();
      return (
        (s.name || '').toLowerCase().includes(term) ||
        (s.tradeName || '').toLowerCase().includes(term) ||
        (s.nit || '').toLowerCase().includes(term) ||
        (s.contact || '').toLowerCase().includes(term) ||
        (s.city || '').toLowerCase().includes(term) ||
        (s.area || '').toLowerCase().includes(term)
      );
    });
  }, [suppliers, searchTerm]);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              Directorio de Proveedores Autorizados
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Maestro corporativo de proveedores, condiciones de pago, datos bancarios y conceptos recurrentes.
            </p>
          </div>
        </div>

        <button 
          onClick={onAddSupplier}
          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Registrar Proveedor</span>
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 flex-1 focus-within:border-red-500 focus-within:bg-white dark:focus-within:bg-zinc-800 focus-within:ring-2 focus-within:ring-red-500/20 transition-all shadow-inner">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar por razón social, nombre comercial, NIT, contacto, ciudad o área..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none w-full placeholder:text-slate-400"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="text-slate-400 hover:text-red-600 text-xs font-bold cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button 
          onClick={() => setSearchTerm('')}
          className="px-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-zinc-700 shadow-2xs cursor-pointer"
          title="Restablecer búsqueda"
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span>Limpiar</span>
        </button>
      </div>

      {/* TABLA DE PROVEEDORES */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                <th className="px-4 py-3.5 w-12 text-center text-white">Ver</th>
                <th className="px-4 py-3.5 text-white">NIT / RUT</th>
                <th className="px-4 py-3.5 text-white">Proveedor / Razón Social</th>
                <th className="px-4 py-3.5 text-white">Condiciones & Pago</th>
                <th className="px-4 py-3.5 text-white">Contacto & Ciudad</th>
                <th className="px-4 py-3.5 text-white">Conceptos / Mes</th>
                <th className="px-4 py-3.5 text-center text-white">Estado</th>
                <th className="px-4 py-3.5 text-center text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
                      <span>No se encontraron proveedores registrados.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((sup) => {
                  const isExpanded = expandedSupplierId === sup.id;
                  const services = sup.services || [];
                  const activeCount = services.filter(s => s.enabled !== false).length;

                  return (
                    <React.Fragment key={sup.id}>
                      <tr className={`hover:bg-red-50/20 dark:hover:bg-zinc-800/40 transition-colors ${isExpanded ? 'bg-red-50/30 dark:bg-red-950/20' : ''}`}>
                        {/* TOGGLE EXPAND */}
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => toggleExpand(sup.id)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              isExpanded 
                                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30' 
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                            }`}
                            title={isExpanded ? "Ocultar conceptos y detalles" : "Desplegar conceptos recurrentes y datos bancarios"}
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-zinc-300">
                          {sup.nit}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 cursor-pointer" onClick={() => toggleExpand(sup.id)}>
                            <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-red-700 text-white text-[10px] font-black flex items-center justify-center shadow-xs ring-1 ring-red-100 dark:ring-red-950 flex-shrink-0">
                              {(sup.name || 'PR').substring(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <span className="hover:text-red-600 transition-colors block leading-tight">{sup.name}</span>
                              {sup.tradeName && (
                                <span className="text-[10px] font-semibold text-slate-400 block">{sup.tradeName}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-slate-900 dark:text-white font-bold">
                            {sup.paymentConditions || 'Crédito 30 días'}
                          </div>
                          {sup.bankName && (
                            <span className="text-[10px] font-mono text-slate-500 block">
                              {sup.bankName} • {sup.bankAccountType || 'Ahorros'}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                          <div className="font-semibold text-slate-800 dark:text-zinc-200">
                            {sup.contact || '—'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            {sup.city && <span>{sup.city} • </span>}
                            <span>{sup.phone || sup.email || 'Sin teléfono'}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                            <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            {activeCount} {activeCount === 1 ? 'concepto' : 'conceptos'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            sup.status === 'Inactivo'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                          }`}>
                            {sup.status || 'Activo'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => onEditSupplier(sup)}
                              className="w-7 h-7 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors border border-transparent hover:border-blue-200 cursor-pointer"
                              title="Editar proveedor"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              onClick={() => onDeleteSupplier(sup.id)}
                              className="w-7 h-7 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                              title="Eliminar proveedor"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* SUBFILA DESPLEGABLE CON CONCEPTOS RECURRENTES Y DATOS BANCARIOS */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-0 bg-slate-50/70 dark:bg-zinc-950/60">
                            <div className="p-5 sm:p-6 border-y border-slate-200 dark:border-zinc-800 space-y-4">
                              
                              {/* DATOS CORPORATIVOS & BANCARIOS EXPANDIDOS */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-xs">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-slate-400 block">Dirección & Ciudad</span>
                                  <span className="font-bold text-slate-800 dark:text-zinc-200">{sup.address || 'No registrada'} {sup.city ? `(${sup.city})` : ''}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-black uppercase text-slate-400 block">Condición Comercial</span>
                                  <span className="font-bold text-slate-800 dark:text-zinc-200">{sup.paymentConditions || 'Crédito 30 días'} (Área: {sup.area || 'General'})</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-black uppercase text-slate-400 block">Información Bancaria</span>
                                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                                    {sup.bankName ? `${sup.bankName} • ${sup.bankAccountType || 'Ahorros'} No. ${sup.bankAccountNumber || 'N/A'}` : 'Sin cuenta registrada'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="text-xs font-black text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                                    <FileText className="w-3.5 h-3.5 text-red-600" />
                                  </div>
                                  <span>Conceptos Recurrentes Mensuales de <strong>{sup.name}</strong></span>
                                </div>

                                <button 
                                  onClick={() => handleAddConcept(sup)}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-red-600/20 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3 text-white" />
                                  <span>Agregar Concepto</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {services.length === 0 ? (
                                  <div className="col-span-full p-6 text-center text-slate-400 text-xs bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                                    No hay conceptos configurados. Haz clic en "Agregar Concepto" para registrar servicios mensuales.
                                  </div>
                                ) : (
                                  services.map((srv, sIdx) => {
                                    const isEnabled = srv.enabled !== false;
                                    const isCot = srv.type === 'cotizacion';

                                    return (
                                      <div 
                                        key={sIdx}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 ${
                                          isEnabled 
                                            ? 'bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md' 
                                            : 'bg-slate-100/60 dark:bg-zinc-900/40 border-slate-200/60 dark:border-zinc-800/40 opacity-60'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2.5">
                                          <div className="flex items-center gap-2.5 flex-1">
                                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                                              #{sIdx + 1}
                                            </span>
                                            <input 
                                              type="text"
                                              value={srv.serviceName || ''}
                                              onChange={(e) => handleServiceNameChange(sup, sIdx, e.target.value)}
                                              placeholder="Nombre del concepto o servicio"
                                              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-1 focus:ring-red-500/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none flex-1 transition-all shadow-2xs"
                                            />
                                          </div>

                                          <button 
                                            onClick={() => handleRemoveConcept(sup, sIdx)}
                                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
                                            title="Eliminar este concepto"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-full text-[10px] font-bold border border-slate-200/80 dark:border-zinc-700/80">
                                            <button 
                                              onClick={() => handleServiceTypeChange(sup, sIdx, 'factura')}
                                              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                                                !isCot 
                                                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-2xs font-black' 
                                                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                                              }`}
                                            >
                                              Factura
                                            </button>
                                            <button 
                                              onClick={() => handleServiceTypeChange(sup, sIdx, 'cotizacion')}
                                              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                                                isCot 
                                                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-2xs font-black' 
                                                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                                              }`}
                                            >
                                              Cotización
                                            </button>
                                          </div>

                                          <button 
                                            onClick={() => handleToggleServiceEnable(sup, sIdx)}
                                            className={`w-12 h-6 rounded-full px-1 flex items-center transition-all cursor-pointer border ${
                                              isEnabled 
                                                ? 'bg-emerald-500 border-emerald-600 justify-end' 
                                                : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                                            }`}
                                            title={isEnabled ? "Desactivar concepto" : "Activar concepto"}
                                          >
                                            <span className={`text-[8.5px] font-black mr-1 ${isEnabled ? 'text-white' : 'hidden'}`}>SÍ</span>
                                            <span className="w-4 h-4 rounded-full bg-white shadow-xs"></span>
                                            <span className={`text-[8.5px] font-black ml-1 ${isEnabled ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
