'use client';

import React, { useState, useMemo } from 'react';
import { 
  Laptop, 
  Search, 
  Plus, 
  Share2, 
  ShoppingCart, 
  Package, 
  Trash2, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  Tag
} from 'lucide-react';
import { TechInventoryItem } from '../app/types';

interface TechInventoryModuleProps {
  inventory: TechInventoryItem[];
  onSaveItem: (item: Partial<TechInventoryItem>) => Promise<void>;
  onLoanItem: (id: string, qty: number, recipient: string, area: string, actionType: string) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export const TechInventoryModule: React.FC<TechInventoryModuleProps> = ({
  inventory,
  onSaveItem,
  onLoanItem,
  onDeleteItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<TechInventoryItem | null>(null);

  // Form State Creación / Compra
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Periféricos');
  const [brandModel, setBrandModel] = useState('');
  const [serialCode, setSerialCode] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('Unidades');
  const [areaAssigned, setAreaAssigned] = useState('Tecnología (TI)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State Préstamo / Entrega
  const [loanQty, setLoanQty] = useState<number>(1);
  const [recipient, setRecipient] = useState('');
  const [loanArea, setLoanArea] = useState('Tecnología (TI)');
  const [actionType, setActionType] = useState<'Préstamo' | 'Entrega Definitiva'>('Préstamo');
  const [loanError, setLoanError] = useState<string | null>(null);

  // Métricas
  const totalEquipos = useMemo(() => inventory.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0), [inventory]);
  const categoriesList = useMemo(() => {
    const cats = new Set(inventory.map(i => i.category || 'Otros'));
    return ['Todas', ...Array.from(cats)];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      if (selectedCategory !== 'Todas' && item.category !== selectedCategory) return false;
      const term = searchTerm.toLowerCase();
      return (
        (item.name || '').toLowerCase().includes(term) ||
        (item.brandModel || '').toLowerCase().includes(term) ||
        (item.serialCode || '').toLowerCase().includes(term) ||
        (item.areaAssigned || '').toLowerCase().includes(term)
      );
    });
  }, [inventory, selectedCategory, searchTerm]);

  const handleOpenLoan = (item: TechInventoryItem) => {
    setSelectedItemForAction(item);
    setLoanQty(1);
    setRecipient('');
    setLoanArea(item.areaAssigned || 'Tecnología (TI)');
    setActionType('Préstamo');
    setLoanError(null);
    setIsLoanModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setIsSubmitting(true);
      await onSaveItem({
        name: name.trim(),
        category,
        brandModel: brandModel.trim() || undefined,
        serialCode: serialCode.trim() || undefined,
        quantity: Number(quantity) || 0,
        unit,
        areaAssigned,
        notes: notes.trim() ? `[COMPRA/INGRESO]: ${notes.trim()}` : undefined
      });
      setName('');
      setBrandModel('');
      setSerialCode('');
      setQuantity(1);
      setNotes('');
      setIsCreateModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAction) return;
    if (!recipient.trim()) {
      setLoanError('Indica el nombre de la persona que recibe el equipo.');
      return;
    }
    if (loanQty > selectedItemForAction.quantity) {
      setLoanError(`Cantidad solicitada (${loanQty}) supera el stock disponible (${selectedItemForAction.quantity}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      setLoanError(null);
      await onLoanItem(
        selectedItemForAction.id,
        loanQty,
        recipient.trim(),
        loanArea,
        actionType
      );
      setIsLoanModalOpen(false);
      setSelectedItemForAction(null);
    } catch (err: any) {
      setLoanError(err.message || 'Error al procesar el préstamo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 flex-shrink-0">
            <Laptop className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
              <span>Inventario Tecnológico (Área TI)</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                {totalEquipos} items en total
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Control de equipos de Tecnología, compras de stock y registro de préstamos o entregas a funcionarios.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 text-white" />
          <span>Ingresar / Comprar Equipo</span>
        </button>
      </div>

      {/* FILTROS Y CATEGORÍAS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/20' 
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 w-full sm:w-80 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por equipo, modelo, serial o área..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* TABLA DE INVENTARIO CON SCROLL SUAVE */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                <th className="px-4 py-3.5 text-white">Categoría</th>
                <th className="px-4 py-3.5 text-white">Nombre del Equipo</th>
                <th className="px-4 py-3.5 text-white">Marca / Modelo</th>
                <th className="px-4 py-3.5 text-white">N° Serial</th>
                <th className="px-4 py-3.5 text-center text-white">Stock TI</th>
                <th className="px-4 py-3.5 text-white">Área Ubicación</th>
                <th className="px-4 py-3.5 text-center text-white">Estado</th>
                <th className="px-4 py-3.5 text-center text-white">Acciones / Préstamos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Laptop className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
                      <span>No hay equipos en inventario para esta categoría o búsqueda.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const isAvailable = item.quantity > 0;
                  return (
                    <tr key={item.id} className="hover:bg-red-50/20 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-zinc-300 font-medium">
                        {item.brandModel || '—'}
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-zinc-300 text-[11px]">
                        {item.serialCode || 'S/N'}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono ${
                          item.quantity > 3 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200' 
                            : item.quantity > 0 
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                        }`}>
                          {item.quantity} {item.unit || 'uds'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                        {item.areaAssigned || 'Tecnología (TI)'}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          isAvailable 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200' 
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                        }`}>
                          {isAvailable ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-rose-600" />}
                          <span>{item.status}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* BOTÓN PRESTAR / ENTREGAR EQUIPO */}
                          <button
                            onClick={() => handleOpenLoan(item)}
                            disabled={!isAvailable}
                            className={`px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                              isAvailable 
                                ? 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                                : 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                            }`}
                            title={isAvailable ? "Prestar o entregar equipo a un funcionario" : "Sin unidades disponibles"}
                          >
                            <Share2 className="w-3 h-3 text-blue-600" />
                            <span>Prestar / Entregar</span>
                          </button>

                          <button 
                            onClick={() => {
                              if (confirm(`¿Eliminar ${item.name} del inventario?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                            title="Eliminar artículo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INGRESO / COMPRA DE EQUIPO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col">
            <div className="px-6 py-5 bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black">Registrar Compra / Ingreso de Equipo</h3>
                  <p className="text-[11px] text-white/90">Aumenta el inventario de Tecnología</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-zinc-300 mb-1">Categoría</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold outline-none focus:border-red-500"
                  >
                    <option value="Periféricos">Periféricos</option>
                    <option value="Monitores">Monitores</option>
                    <option value="Equipos de Cómputo">Equipos de Cómputo</option>
                    <option value="Redes & Conectividad">Redes & Conectividad</option>
                    <option value="Licencias de AI">Licencias de AI</option>
                    <option value="Servidores">Servidores</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-zinc-300 mb-1">Cantidad Comprada</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold outline-none focus:border-red-500"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-zinc-300 mb-1">Nombre del Equipo *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="ej: Mouse Ergonómico Inalámbrico"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold outline-none focus:border-red-500"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-zinc-300 mb-1">Marca / Modelo</label>
                  <input 
                    type="text" 
                    value={brandModel} 
                    onChange={e => setBrandModel(e.target.value)}
                    placeholder="ej: Logitech MX Master 3S"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-zinc-300 mb-1">Serial / Código</label>
                  <input 
                    type="text" 
                    value={serialCode} 
                    onChange={e => setSerialCode(e.target.value)}
                    placeholder="ej: SN-LOG-8812"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold font-mono outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-zinc-300 mb-1">Notas de Compra</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="ej: Lote adquirido con Factura FAC-9901 para el equipo de analítica"
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-medium outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold"
                >
                  {isSubmitting ? 'Guardando...' : 'Registrar Ingreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRESTAR / ENTREGAR EQUIPO */}
      {isLoanModalOpen && selectedItemForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black">Prestar o Entregar Equipo</h3>
                  <p className="text-[11px] text-white/90">{selectedItemForAction.name} (Stock: {selectedItemForAction.quantity})</p>
                </div>
              </div>
              <button onClick={() => setIsLoanModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLoanSubmit} className="p-6 space-y-4 text-xs">
              {loanError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl font-bold border border-red-200">
                  {loanError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActionType('Préstamo')}
                  className={`py-2 rounded-xl font-black text-center transition-all ${
                    actionType === 'Préstamo' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600'
                  }`}
                >
                  Préstamo Temporal
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('Entrega Definitiva')}
                  className={`py-2 rounded-xl font-black text-center transition-all ${
                    actionType === 'Entrega Definitiva' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600'
                  }`}
                >
                  Entrega Definitiva
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-zinc-300 mb-1">Nombre del Funcionario / Receptor *</label>
                <input 
                  type="text" 
                  value={recipient} 
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="ej: David Sarria (Líder Sistemas)"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold outline-none focus:border-blue-500"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-zinc-300 mb-1">Área Destino</label>
                  <select 
                    value={loanArea} 
                    onChange={e => setLoanArea(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold outline-none focus:border-blue-500"
                  >
                    <option value="Tecnología (TI)">Tecnología (TI)</option>
                    <option value="Adquisiciones & Compras">Adquisiciones & Compras</option>
                    <option value="Contabilidad & Finanzas">Contabilidad & Finanzas</option>
                    <option value="Operaciones & Planta">Operaciones & Planta</option>
                    <option value="Dirección General">Dirección General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-zinc-300 mb-1">Cantidad a Descontar</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedItemForAction.quantity}
                    value={loanQty} 
                    onChange={e => setLoanQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold outline-none focus:border-blue-500"
                    required 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button 
                  type="button" 
                  onClick={() => setIsLoanModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Préstamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
