'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit2, 
  Mail, 
  UserCheck, 
  DollarSign, 
  FileText, 
  Laptop, 
  ShieldCheck, 
  X, 
  CheckCircle2,
  Users,
  Briefcase
} from 'lucide-react';
import { CompanyArea, Invoice, Supplier, TechInventoryItem } from '../app/types';

interface AreasModuleProps {
  areas: CompanyArea[];
  invoices: Invoice[];
  suppliers: Supplier[];
  inventory: TechInventoryItem[];
  onSaveArea: (area: Partial<CompanyArea>) => Promise<void>;
  onDeleteArea: (id: string) => Promise<void>;
  onSelectAreaFilter?: (areaName: string) => void;
}

export const AreasModule: React.FC<AreasModuleProps> = ({
  areas,
  invoices,
  suppliers,
  inventory,
  onSaveArea,
  onDeleteArea,
  onSelectAreaFilter
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<CompanyArea | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [director, setDirector] = useState('');
  const [headOrCoord, setHeadOrCoord] = useState('');
  const [email, setEmail] = useState('');
  const [budgetLimit, setBudgetLimit] = useState<number>(0);
  const [color, setColor] = useState('red');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formateador de moneda
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleOpenCreate = () => {
    setEditingArea(null);
    setName('');
    setDirector('');
    setHeadOrCoord('');
    setEmail('');
    setBudgetLimit(25000000);
    setColor('red');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (area: CompanyArea) => {
    setEditingArea(area);
    setName(area.name);
    setDirector(area.director || '');
    setHeadOrCoord(area.headOrCoord || '');
    setEmail(area.email || '');
    setBudgetLimit(area.budgetLimit || 0);
    setColor(area.color || 'red');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setIsSubmitting(true);
      await onSaveArea({
        id: editingArea?.id,
        name: name.trim(),
        director: director.trim() || undefined,
        headOrCoord: headOrCoord.trim() || undefined,
        email: email.trim() || undefined,
        budgetLimit: Number(budgetLimit) || 0,
        color
      });
      setIsModalOpen(false);
      setEditingArea(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resumen global de áreas
  const totalBudgetAcrossAreas = useMemo(() => {
    return areas.reduce((acc, a) => acc + (a.budgetLimit || 0), 0);
  }, [areas]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Áreas Organizacionales
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                Alimentos Enriko S.A.S.
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Estructura corporativa, directores responsables, techos presupuestales y facturas por departamento
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Área</span>
        </button>
      </div>

      {/* METRICAS SUPERIORES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Departamentos Registrados</span>
            <div className="text-lg font-black text-slate-900 dark:text-white">{areas.length} Áreas</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Presupuesto Asignado Global</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalBudgetAcrossAreas)}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Proveedores Asignados</span>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">{suppliers.length} Proveedores</div>
          </div>
        </div>
      </div>

      {/* TARJETAS DE ÁREAS (ESTILO CORPORATIVO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {areas.map(area => {
          // Facturas asociadas a proveedores de esta área
          const areaSuppliers = suppliers.filter(s => (s.area || '').toLowerCase() === area.name.toLowerCase());
          const areaSupplierNames = areaSuppliers.map(s => s.name.toLowerCase());
          const areaInvoices = invoices.filter(inv => areaSupplierNames.includes((inv.supplier || '').toLowerCase()));
          const areaTotalSpent = areaInvoices.reduce((acc, inv) => acc + (inv.value || 0), 0);
          
          // Artículos de inventario asignados
          const areaInventoryCount = inventory
            .filter(i => (i.areaAssigned || '').toLowerCase().includes(area.name.toLowerCase()))
            .reduce((acc, i) => acc + (i.quantity || 0), 0);

          const budgetLimit = area.budgetLimit || 0;
          const budgetPercentage = budgetLimit > 0 ? Math.min(100, Math.round((areaTotalSpent / budgetLimit) * 100)) : 0;

          return (
            <div 
              key={area.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* LÍNEA SUPERIOR DE COLOR */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 to-red-700"></div>

              <div>
                {/* CABECERA TARJETA */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(area)}
                      className="w-8 h-8 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                      title="Editar área"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteArea(area.id)}
                      className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                      title="Eliminar área"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* NOMBRE DEL ÁREA */}
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                  {area.name}
                </h3>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block mt-0.5">
                  Alimentos Enriko S.A.S.
                </span>

                {/* RESPONSABLES */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">
                      <strong>Director:</strong> {area.director || 'No asignado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                    <UserCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">
                      <strong>Coordinador:</strong> {area.headOrCoord || 'No asignado'}
                    </span>
                  </div>

                  {area.email && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate font-mono text-[11px]">{area.email}</span>
                    </div>
                  )}
                </div>

                {/* MÉTRICAS DE PRESUPUESTO & GASTO */}
                <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 dark:text-zinc-400 text-[11px]">Tope Presupuestal:</span>
                    <span className="font-black text-slate-900 dark:text-white">{formatCurrency(budgetLimit)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 dark:text-zinc-400 text-[11px]">Gasto en Facturas:</span>
                    <span className="font-black text-red-600 dark:text-red-400">{formatCurrency(areaTotalSpent)}</span>
                  </div>

                  {/* BARRA DE PROGRESO */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        budgetPercentage > 90 ? 'bg-red-600' : budgetPercentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${budgetPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* CONTEO DE PROVEEDORES, FACTURAS E INVENTARIO */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50/75 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Proveedores</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">{areaSuppliers.length}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50/75 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Facturas</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">{areaInvoices.length}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50/75 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Equipos TI</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">{areaInventoryCount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CREAR / EDITAR ÁREA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
                    {editingArea ? 'Editar Área Corporativa' : 'Nueva Área — Alimentos Enriko'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Alimentos Enriko S.A.S.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                  Nombre del Área o Departamento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Logística & Bodega, Calidad, Producción..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Director / Responsable
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Ing. Carlos Mendoza..."
                    value={director}
                    onChange={e => setDirector(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Coordinador / Líder
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Andrea Valbuena..."
                    value={headOrCoord}
                    onChange={e => setHeadOrCoord(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="area@alimentosenriko.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Tope Presupuestal Mensual (COP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="25000000"
                    value={budgetLimit}
                    onChange={e => setBudgetLimit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingArea ? 'Guardar Cambios' : 'Crear Área'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
