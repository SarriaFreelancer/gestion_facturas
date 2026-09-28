'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Layers,
  CalendarDays
} from 'lucide-react';

interface MonthCalendarPickerProps {
  selectedMonth: string;
  selectedYear: string;
  onSelectMonthYear: (month: string, year: string) => void;
  serverDateInfo?: any;
}

const MONTHS = [
  { name: 'Enero', short: 'Ene', num: 1 },
  { name: 'Febrero', short: 'Feb', num: 2 },
  { name: 'Marzo', short: 'Mar', num: 3 },
  { name: 'Abril', short: 'Abr', num: 4 },
  { name: 'Mayo', short: 'May', num: 5 },
  { name: 'Junio', short: 'Jun', num: 6 },
  { name: 'Julio', short: 'Jul', num: 7 },
  { name: 'Agosto', short: 'Ago', num: 8 },
  { name: 'Septiembre', short: 'Sep', num: 9 },
  { name: 'Octubre', short: 'Oct', num: 10 },
  { name: 'Noviembre', short: 'Nov', num: 11 },
  { name: 'Diciembre', short: 'Dic', num: 12 }
];

export const MonthCalendarPicker: React.FC<MonthCalendarPickerProps> = ({
  selectedMonth,
  selectedYear,
  onSelectMonthYear,
  serverDateInfo
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(() => {
    return parseInt(selectedYear, 10) || new Date().getFullYear();
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar viewYear cuando cambie selectedYear
  useEffect(() => {
    if (selectedYear && selectedYear !== 'Todos') {
      setViewYear(parseInt(selectedYear, 10));
    }
  }, [selectedYear]);

  // Obtener fecha actual
  const today = new Date();
  const currentMonthName = serverDateInfo?.currentMonth || MONTHS[today.getMonth()].name;
  const currentYearStr = serverDateInfo?.currentYear || String(today.getFullYear());

  const handleSelectMonth = (monthName: string) => {
    onSelectMonthYear(monthName, String(viewYear));
    setIsOpen(false);
  };

  const handleSelectAllYear = () => {
    onSelectMonthYear('Todos', String(viewYear));
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    onSelectMonthYear(currentMonthName, currentYearStr);
    setViewYear(parseInt(currentYearStr, 10));
    setIsOpen(false);
  };

  const isCurrentMonthActive = (mName: string) => {
    return selectedMonth.toLowerCase() === mName.toLowerCase() && selectedYear === String(viewYear);
  };

  const isRealCurrentMonth = (mName: string) => {
    return currentMonthName.toLowerCase() === mName.toLowerCase() && currentYearStr === String(viewYear);
  };

  return (
    <div className="relative" ref={pickerRef}>
      {/* BOTÓN CALENDARIO EN TOPNAVBAR */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 sm:gap-2 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/40 dark:hover:bg-red-950/30 transition-all shadow-2xs cursor-pointer group flex-shrink-0"
        title="Filtrar por Calendario de Mes y Año"
      >
        <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 group-hover:scale-110 transition-transform flex-shrink-0" />
        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black">
          <span className="text-slate-900 dark:text-white capitalize hidden sm:inline">
            {selectedMonth === 'Todos' ? `Todo ${selectedYear}` : `${selectedMonth} ${selectedYear}`}
          </span>
          <span className="text-slate-900 dark:text-white capitalize sm:hidden">
            {selectedMonth === 'Todos' ? `Todo '${selectedYear.slice(-2)}` : `${selectedMonth.substring(0, 3)} '${selectedYear.slice(-2)}`}
          </span>
        </div>
      </button>

      {/* MODAL / POPOVER CALENDARIO */}
      {isOpen && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-12 z-50 w-[calc(100vw-1rem)] sm:w-72 max-w-xs bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-4 animate-in fade-in duration-150">
          {/* CABECERA CON NAVEGACIÓN DE AÑO */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <button
              onClick={() => setViewYear(prev => prev - 1)}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="font-black text-sm text-slate-900 dark:text-white">
                {viewYear}
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Alimentos Enriko</span>
            </div>

            <button
              onClick={() => setViewYear(prev => prev + 1)}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* GRID DE 12 MESES */}
          <div className="grid grid-cols-3 gap-2 py-3">
            {MONTHS.map(m => {
              const selected = isCurrentMonthActive(m.name);
              const isTodayMonth = isRealCurrentMonth(m.name);
              return (
                <button
                  key={m.name}
                  onClick={() => handleSelectMonth(m.name)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer relative flex flex-col items-center justify-center ${
                    selected
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/30'
                      : isTodayMonth
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-900/50 hover:bg-red-100'
                      : 'bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{m.short}</span>
                  {isTodayMonth && !selected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-0.5"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ACCIONES RÁPIDAS: HOY & TODO EL AÑO */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={handleSelectToday}
              className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Hoy ({currentMonthName.substring(0,3)})</span>
            </button>

            <button
              onClick={handleSelectAllYear}
              className={`py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                selectedMonth === 'Todos' && selectedYear === String(viewYear)
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Todo {viewYear}</span>
            </button>
          </div>
        </div>
      )}
    </div>

  );
};
