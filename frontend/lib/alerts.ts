import Swal from 'sweetalert2';

// Instancia estilizada acorde a la paleta institucional Enriko
export const EnrikoAlert = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 font-sans',
    title: 'text-lg font-black text-slate-900 dark:text-white mb-2',
    htmlContainer: 'text-xs text-slate-600 dark:text-zinc-300 leading-relaxed',
    confirmButton: 'px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all cursor-pointer mx-1.5 focus:outline-none',
    cancelButton: 'px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs transition-all cursor-pointer mx-1.5 focus:outline-none',
    denyButton: 'px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer mx-1.5 focus:outline-none',
    actions: 'gap-2 mt-4'
  },
  buttonsStyling: false,
  background: 'transparent'
});

// Toast flotante tipo notificación
export const EnrikoToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: 'rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl p-3 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 font-sans',
    title: 'text-xs font-bold text-slate-900 dark:text-white',
    timerProgressBar: 'bg-red-600'
  }
});

// Métodos directos listos para usar
export const notifySuccess = (title: string, text?: string) => {
  return EnrikoToast.fire({
    icon: 'success',
    title: title,
    text: text
  });
};

export const notifyError = (title: string, text?: string) => {
  return EnrikoAlert.fire({
    icon: 'error',
    title: title,
    text: text || 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
    confirmButtonText: 'Entendido'
  });
};

export const notifyInfo = (title: string, text?: string) => {
  return EnrikoAlert.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonText: 'Aceptar'
  });
};

export const confirmDelete = async (title: string, text?: string, confirmText: string = 'Sí, eliminar'): Promise<boolean> => {
  const result = await EnrikoAlert.fire({
    title: title,
    text: text || 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });
  return result.isConfirmed;
};

export const confirmAction = async (title: string, text: string, confirmText: string = 'Confirmar'): Promise<boolean> => {
  const result = await EnrikoAlert.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });
  return result.isConfirmed;
};
