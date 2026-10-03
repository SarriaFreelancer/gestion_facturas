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
  Tag,
  Pencil,
  History,
  RotateCcw,
  UserCheck,
  CheckCircle,
  Filter
} from 'lucide-react';
import { TechInventoryItem, InventoryMovement, InventoryCategory } from '../app/types';

interface TechInventoryModuleProps {
  inventory: TechInventoryItem[];
  movements?: InventoryMovement[];
  categories?: InventoryCategory[];
  onSaveItem: (item: Partial<TechInventoryItem>) => Promise<void>;
  onLoanItem: (id: string, qty: number, recipient: string, area: string, actionType: string) => Promise<void>;
  onReturnMovement?: (movementId: string, returnQty?: number, notes?: string) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export const TechInventoryModule: React.FC<TechInventoryModuleProps> = ({
  inventory,
  movements = [],
  categories = [],
  onSaveItem,
  onLoanItem,
  onReturnMovement,
  onDeleteItem
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TechInventoryItem | null>(null);
  
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<TechInventoryItem | null>(null);

  // Form State Creación / Edición
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

  // Categorías disponibles
  const availableCategories = useMemo(() => {
    if (categories.length > 0) {
      return ['Todas', ...categories.map(c => c.name)];
    }
    return [
      'Todas',
      'Equipos de Cómputo',
      'Periféricos',
      'Redes & Conectividad',
      'Impresión & Escáneres',
      'Servidores & Almacenamiento',
      'Accesorios & Cables',
      'Telefonía & Comunicación',
      'Licencias & Software'
    ];
  }, [categories]);

  // Métricas
  const totalStockItems = useMemo(() => inventory.reduce((acc, curr) => acc + (curr.quantity || 0), 0), [inventory]);
  const activeLoansCount = useMemo(() => movements.filter(m => m.status === 'Activo').length, [movements]);
  const totalCategoriesCount = useMemo(() => new Set(inventory.map(i => i.category)).size, [inventory]);

  // Filtrado de Stock
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      if (selectedCategory !== 'Todas' && item.category !== selectedCategory) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (item.name || '').toLowerCase().includes(term) ||
        (item.brandModel || '').toLowerCase().includes(term) ||
        (item.serialCode || '').toLowerCase().includes(term) ||
        (item.areaAssigned || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term)
      );
    });
  }, [inventory, selectedCategory, searchTerm]);

  // Filtrado de Movimientos (Historial)
  const filteredMovements = useMemo(() => {
    return movements.filter(mov => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (mov.itemName || '').toLowerCase().includes(term) ||
        (mov.recipient || '').toLowerCase().includes(term) ||
        (mov.area || '').toLowerCase().includes(term) ||
        (mov.actionType || '').toLowerCase().includes(term) ||
        (mov.status || '').toLowerCase().includes(term)
      );
    });
  }, [movements, searchTerm]);

  // Abrir modal de creación
  const handleOpenCreate = () => {
    setEditingItem(null);
    setName('');
    setCategory(categories[0]?.name || 'Periféricos');
    setBrandModel('');
    setSerialCode('');
    setQuantity(1);
    setUnit('Unidades');
    setAreaAssigned('Tecnología (TI)');
    setNotes('');
    setIsModalOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEdit = (item: TechInventoryItem) => {
    setEditingItem(item);
    setName(item.name || '');
    setCategory(item.category || 'Periféricos');
    setBrandModel(item.brandModel || '');
    setSerialCode(item.serialCode || '');
    setQuantity(item.quantity || 1);
    setUnit(item.unit || 'Unidades');
    setAreaAssigned(item.areaAssigned || 'Tecnología (TI)');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  // Abrir modal de préstamo
  const handleOpenLoan = (item: TechInventoryItem) => {
    setSelectedItemForAction(item);
    setLoanQty(1);
    setRecipient('');
    setLoanArea(item.areaAssigned || 'Tecnología (TI)');
    setActionType('Préstamo');
    setLoanError(null);
    setIsLoanModalOpen(true);
  };

  // Guardar (Crear o Actualizar)
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setIsSubmitting(true);
      await onSaveItem({
        id: editingItem?.id,
        name: name.trim(),
        category,
        brandModel: brandModel.trim() || undefined,
        serialCode: serialCode.trim() || undefined,
        quantity: Number(quantity) || 0,
        unit,
        areaAssigned,
        notes: notes.trim() || undefined
      });
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Procesar préstamo
  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAction) return;
    if (!recipient.trim()) {
      setLoanError('Por favor ingresa el nombre del funcionario o receptor.');
      return;
    }
    if (loanQty <= 0 || loanQty > (selectedItemForAction.quantity || 0)) {
      setLoanError(`Cantidad inválida. Stock disponible: ${selectedItemForAction.quantity}`);
      return;
    }

    try {
      setIsSubmitting(true);
      setLoanError(null);
      await onLoanItem(selectedItemForAction.id, loanQty, recipient.trim(), loanArea, actionType);
      setIsLoanModalOpen(false);
      setSelectedItemForAction(null);
    } catch (err: any) {
      setLoanError(err.message || 'Error al procesar la entrega');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER PRINCIPAL */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-600 flex-shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>Inventario & Equipamiento TI</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                  Alimentos Enriko S.A.S.
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Control de hardware, periféricos, compras y registro oficial de préstamos y asignaciones
              </p>
            </div>
          </div>
        </div>

        {/* BOTÓN NUEVO ARTÍCULO */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleOpenCreate}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Compra / Ingreso</span>
          </button>
        </div>
      </div>

      {/* MÉTRICAS DE INVENTARIO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Unidades en Stock</span>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{totalStockItems} <span className="text-xs font-normal text-slate-400">uds</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Préstamos Activos</span>
            <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">{activeLoansCount} <span className="text-xs font-normal text-slate-400">asignaciones</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categorías Activas</span>
            <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">{totalCategoriesCount} <span className="text-xs font-normal text-slate-400">tipos</span></div>
          </div>
        </div>
      </div>

      {/* SELECTOR DE VISTA: STOCK VS HISTORIAL DE PRÉSTAMOS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'stock'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock de Artículos & Equipos ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'movements'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historial de Préstamos y Entregas ({movements.length})</span>
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder={activeTab === 'stock' ? "Buscar por nombre, marca, serial..." : "Buscar por receptor, equipo, área..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:border-red-500 dark:text-white"
          />
        </div>

        {activeTab === 'stock' && (
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium outline-none focus:border-red-500 dark:text-white cursor-pointer"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TABLA: VISTA STOCK */}
      {activeTab === 'stock' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/75 dark:bg-zinc-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <th className="px-4 py-3.5">Artículo / Equipo</th>
                  <th className="px-4 py-3.5">Categoría</th>
                  <th className="px-4 py-3.5">Marca / Modelo</th>
                  <th className="px-4 py-3.5">Serial / Código</th>
                  <th className="px-4 py-3.5 text-center">Stock Disp.</th>
                  <th className="px-4 py-3.5">Área Asignada</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400 dark:text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
                        <span className="text-xs font-bold">No se encontraron artículos en inventario</span>
                        <p className="text-[11px] max-w-xs text-slate-400">
                          Registra una nueva compra o equipo con el botón superior.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map(item => {
                    const isAvailable = (item.quantity || 0) > 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/75 dark:hover:bg-zinc-800/40 transition-colors">
                        {/* NOMBRE */}
                        <td className="px-4 py-3">
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.name}</span>
                          </div>
                          {item.notes && (
                            <span className="text-[10px] text-slate-400 block truncate max-w-xs">{item.notes}</span>
                          )}
                        </td>

                        {/* CATEGORÍA */}
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-[10px]">
                            {item.category}
                          </span>
                        </td>

                        {/* MARCA/MODELO */}
                        <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                          {item.brandModel || '—'}
                        </td>

                        {/* SERIAL */}
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                          {item.serialCode || '—'}
                        </td>

                        {/* STOCK */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                            isAvailable 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40' 
                              : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                          }`}>
                            {item.quantity} {item.unit || 'uds'}
                          </span>
                        </td>

                        {/* ÁREA */}
                        <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{item.areaAssigned || 'Tecnología (TI)'}</span>
                          </div>
                        </td>

                        {/* ESTADO */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAvailable 
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' 
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                          }`}>
                            {isAvailable ? 'Disponible' : 'Agotado'}
                          </span>
                        </td>

                        {/* ACCIONES */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* BOTÓN PRESTAR / ENTREGAR */}
                            <button
                              disabled={!isAvailable}
                              onClick={() => handleOpenLoan(item)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                                isAvailable
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900/40'
                                  : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-zinc-800 text-slate-400'
                              }`}
                              title="Asignar o prestar a funcionario"
                            >
                              <Share2 className="w-3 h-3 text-blue-600" />
                              <span>Prestar / Entregar</span>
                            </button>

                            {/* BOTÓN LÁPIZ EDITAR */}
                            <button 
                              onClick={() => handleOpenEdit(item)}
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-center transition-colors cursor-pointer"
                              title="Editar artículo"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* BOTÓN ELIMINAR */}
                            <button 
                              onClick={() => onDeleteItem(item.id)}
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
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
      )}

      {/* TABLA: VISTA HISTORIAL DE MOVIMIENTOS / PRÉSTAMOS */}
      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/75 dark:bg-zinc-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <th className="px-4 py-3.5">Fecha y Hora</th>
                  <th className="px-4 py-3.5">Artículo Prestado/Entregado</th>
                  <th className="px-4 py-3.5 text-center">Cant.</th>
                  <th className="px-4 py-3.5">Funcionario / Receptor</th>
                  <th className="px-4 py-3.5">Área Destino</th>
                  <th className="px-4 py-3.5">Tipo de Movimiento</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400 dark:text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <History className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
                        <span className="text-xs font-bold">No hay registros de préstamos ni entregas</span>
                        <p className="text-[11px] max-w-xs text-slate-400">
                          Cada vez que entregues o prestes un equipo desde el stock, quedará guardado su registro histórico aquí.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map(mov => {
                    const isLoan = mov.actionType === 'Préstamo';
                    const isActive = mov.status === 'Activo';
                    return (
                      <tr key={mov.id} className="hover:bg-slate-50/75 dark:hover:bg-zinc-800/40 transition-colors">
                        {/* FECHA */}
                        <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 whitespace-nowrap text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{(mov.movementDate || '').replace('T', ' ').substring(0, 19)}</span>
                          </div>
                        </td>

                        {/* ARTÍCULO */}
                        <td className="px-4 py-3">
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {mov.itemName}
                          </div>
                          {mov.itemCategory && (
                            <span className="text-[10px] text-slate-400">{mov.itemCategory}</span>
                          )}
                        </td>

                        {/* CANTIDAD */}
                        <td className="px-4 py-3 text-center font-black text-slate-800 dark:text-zinc-200">
                          {mov.quantity}
                        </td>

                        {/* RECEPTOR */}
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                            <span>{mov.recipient}</span>
                          </div>
                        </td>

                        {/* ÁREA */}
                        <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[10px] font-semibold">
                            {mov.area}
                          </span>
                        </td>

                        {/* TIPO */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLoan 
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40' 
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                          }`}>
                            {mov.actionType}
                          </span>
                        </td>

                        {/* ESTADO */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                          }`}>
                            {mov.status}
                          </span>
                        </td>

                        {/* ACCIONES */}
                        <td className="px-4 py-3 text-center">
                          {isLoan && isActive && onReturnMovement && (
                            <button
                              onClick={() => onReturnMovement(mov.id, mov.quantity)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-[10px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Registrar devolución de equipo a stock"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Devolver al Stock</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR ARTÍCULO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-600 flex-shrink-0">
                  {editingItem ? <Pencil className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
                    {editingItem ? 'Editar Artículo en Inventario' : 'Registrar Compra / Entrada de Equipo'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Alimentos Enriko S.A.S. — Gestión TI
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

            <form onSubmit={handleSaveSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Nombre del Equipo o Artículo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Laptop Dell Latitude 3420, Cable Patch Cord 2m..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-medium cursor-pointer"
                  >
                    {availableCategories.filter(c => c !== 'Todas').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">Marca / Modelo</label>
                  <input
                    type="text"
                    placeholder="Ej: Dell Core i5 16GB, Logitech MK220..."
                    value={brandModel}
                    onChange={e => setBrandModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">Serial / Placa Activo</label>
                  <input
                    type="text"
                    placeholder="Ej: SN-987654321..."
                    value={serialCode}
                    onChange={e => setSerialCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">Cantidad / Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">Unidad de Medida</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white cursor-pointer"
                  >
                    <option value="Unidades">Unidades (uds)</option>
                    <option value="Metros">Metros (m)</option>
                    <option value="Kits">Kits / Sets</option>
                    <option value="Cajas">Cajas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">Área Asignada</label>
                  <select
                    value={areaAssigned}
                    onChange={e => setAreaAssigned(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white cursor-pointer"
                  >
                    <option value="Tecnología (TI)">Tecnología (TI)</option>
                    <option value="Producción">Producción</option>
                    <option value="Logística & Bodega">Logística & Bodega</option>
                    <option value="Administración & Finanzas">Administración & Finanzas</option>
                    <option value="Comercial & Ventas">Comercial & Ventas</option>
                    <option value="Calidad & Laboratorio">Calidad & Laboratorio</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">Observaciones / Notas</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles de compra, proveedor, garantía, accesorios incluidos..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white resize-none"
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
                  <span>{editingItem ? 'Guardar Cambios' : 'Registrar en Stock'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRÉSTAMO / ENTREGA */}
      {isLoanModalOpen && selectedItemForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-blue-50/50 dark:bg-blue-950/30 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
                    Asignar o Prestar Equipo
                  </h2>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {selectedItemForAction.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsLoanModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLoanSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">

              {loanError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loanError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Tipo de Movimiento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActionType('Préstamo')}
                      className={`p-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        actionType === 'Préstamo'
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      🔄 Préstamo Temporal
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('Entrega Definitiva')}
                      className={`p-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        actionType === 'Entrega Definitiva'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      📦 Entrega Definitiva
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Cantidad a Asignar (Stock Disponible: {selectedItemForAction.quantity}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItemForAction.quantity}
                    required
                    value={loanQty}
                    onChange={e => setLoanQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-blue-500 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Funcionario / Persona Receptora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez (Analista Contable)..."
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-blue-500 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    Área de Destino
                  </label>
                  <select
                    value={loanArea}
                    onChange={e => setLoanArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-blue-500 dark:text-white cursor-pointer"
                  >
                    <option value="Tecnología (TI)">Tecnología (TI)</option>
                    <option value="Producción">Producción</option>
                    <option value="Logística & Bodega">Logística & Bodega</option>
                    <option value="Administración & Finanzas">Administración & Finanzas</option>
                    <option value="Comercial & Ventas">Comercial & Ventas</option>
                    <option value="Calidad & Laboratorio">Calidad & Laboratorio</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoanModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Entrega</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
