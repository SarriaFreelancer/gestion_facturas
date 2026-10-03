'use client';

import { useEffect } from 'react';

/**
 * Componente de Protección de Integridad y Código Fuente:
 * - Deshabilita el menú contextual (clic derecho)
 * - Bloquea accesos directos de inspección (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
 * - Limpia la consola y muestra aviso de seguridad corporativo
 */
export default function SecurityShield() {
  useEffect(() => {
    // 1. Bloquear menú contextual (clic derecho)
    const handleContextMenu = (e: MouseEvent) => {
      // Permitir clic derecho únicamente en inputs o textareas si es necesario
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 2. Bloquear combinaciones de teclas de DevTools e Inspección
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 (DevTools)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Ctrl + Shift + I (Inspeccionar)
      // Ctrl + Shift + J (Consola)
      // Ctrl + Shift + C (Selector de Elementos)
      // Ctrl + Shift + K (Firefox DevTools)
      if (isCtrlOrMeta && e.shiftKey) {
        const key = e.key.toUpperCase();
        if (key === 'I' || key === 'J' || key === 'C' || key === 'K') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Ctrl + U (Ver Código Fuente)
      if (isCtrlOrMeta && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S (Guardar Página)
      if (isCtrlOrMeta && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Aviso de Seguridad Corporativo en Consola
    const showSecurityBanner = () => {
      try {
        console.clear();
        console.log(
          '%c⚠️ ADVERTENCIA DE SEGURIDAD — ALIMENTOS ENRIKO S.A.S.',
          'color: #dc2626; font-size: 16px; font-weight: 900; background: #fee2e2; padding: 6px 12px; border-radius: 6px;'
        );
        console.log(
          '%cEl acceso a las herramientas de desarrollo y modificación del código en el cliente está restringido para proteger la integridad y confidencialidad de la información financiera de la compañía.',
          'font-size: 12px; color: #475569; margin-top: 4px;'
        );
      } catch {
        // Ignorar
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('keydown', handleKeyDown, true);

    showSecurityBanner();
    const interval = setInterval(showSecurityBanner, 10000);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      clearInterval(interval);
    };
  }, []);

  return null;
}
