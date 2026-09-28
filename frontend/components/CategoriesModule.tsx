'use client';

import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Layers, 
  Laptop, 
  Mouse, 
  Wifi, 
  Printer, 
  Server, 
  Cable, 
  PhoneCall, 
  Key, 
  X, 
  CheckCircle2, 
  ShieldAlert,
  Edit2,
  Boxes
} from 'lucide-react';
import { InventoryCategory } from '../app/types';

interface CategoriesModuleProps {
  categories: InventoryCategory[];
  onSaveCategory: (category: Partial<InventoryCategory>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

const AVAILABLE_ICONS = [
  { name: 'Layers', label: 'Capas / General', icon: Layers },
  { name: 'Laptop', label: 'Cómputo / Laptops', icon: Laptop },
  { name: 'Mouse', label: 'Periféricos', icon: Mouse },
  { name: 'Wifi', label: 'Redes & Wifi', icon: Wifi },
  { name: 'Printer', label: 'Impresoras', icon: Printer },
  { name: 'Server', label: 'Servidores & NAS', icon: Server },
  { name: 'Cable', label: 'Cables & Conectores', icon: Cable },
  { name: 'PhoneCall', label: 'Telefonía IP', icon: PhoneCall },
  { name: 'Key', label: 'Licencias / Software', icon: Key },
  { name: 'Boxes', label: 'Insumos Varios', icon: Boxes }
];

export const CategoriesModule: React.FC<CategoriesModuleProps> = ({
  categories,
  onSaveCategory,
  onDeleteCategory
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Layers');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('Layers');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: InventoryCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Layers');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setIsSubmitting(true);
      await onSaveCategory({
        id: editingCategory?.id,
        name: name.trim(),
        description: description.trim() || undefined,
        icon
      });
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIconComponent = (iconName?: string | null) => {
    const found = AVAILABLE_ICONS.find(i => i.name === iconName);
    const IconComponent = found ? found.icon : Layers;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-600 flex-shrink-0">
            <Tag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Categorías de Inventario TI
              </h1>
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40">
                Solo Superadmin
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Gestiona los tipos y agrupaciones para los activos tecnológicos de Alimentos Enriko S.A.S.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* GRID DE CATEGORÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div 
            key={cat.id}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                  {getCategoryIconComponent(cat.icon)}
                </div>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                    title="Editar categoría"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                {cat.description || 'Sin descripción especificada.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Tipo oficial Enriko TI</span>
              <span className="font-mono text-[10px] text-slate-400">{cat.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría de Inventario'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Alimentos Enriko S.A.S. — TI
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

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                  Nombre de la Categoría <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Servidores & Almacenamiento, Periféricos..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                  Icono Representativo
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map(i => {
                    const IconComp = i.icon;
                    const isSelected = icon === i.name;
                    return (
                      <button
                        key={i.name}
                        type="button"
                        onClick={() => setIcon(i.name)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-100'
                        }`}
                        title={i.label}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[9px] font-bold truncate max-w-[50px]">{i.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica qué tipo de equipos o materiales pertenecen a esta categoría..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-red-500 dark:text-white resize-none"
                />
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
                  <span>{editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
