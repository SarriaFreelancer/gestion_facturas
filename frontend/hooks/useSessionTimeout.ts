'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { User } from '../app/types';

// Tiempo predeterminado de inactividad antes de auto-logout: 20 minutos (1200 seg)
const DEFAULT_INACTIVITY_TIMEOUT_SEC = 20 * 60;
// Mostrar advertencia visual cuando falten 2 minutos (120 seg)
const WARNING_THRESHOLD_SEC = 2 * 60;

interface UseSessionTimeoutProps {
  isAuthenticated: boolean;
  currentUser: User | null;
  onLogout: (reason?: string) => void;
  timeoutSeconds?: number;
  warningThresholdSeconds?: number;
}

export function useSessionTimeout({
  isAuthenticated,
  currentUser,
  onLogout,
  timeoutSeconds = DEFAULT_INACTIVITY_TIMEOUT_SEC,
  warningThresholdSeconds = WARNING_THRESHOLD_SEC
}: UseSessionTimeoutProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(timeoutSeconds);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const lastActivityRef = useRef<number>(Date.now());
  const logoutTriggeredRef = useRef<boolean>(false);

  // Renovar actividad
  const extendSession = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ae_last_activity', now.toString());
    }
    setRemainingSeconds(timeoutSeconds);
    setShowWarning(false);
    logoutTriggeredRef.current = false;
  }, [timeoutSeconds]);

  // Manejador de eventos de interacción de usuario (con throttling)
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    logoutTriggeredRef.current = false;
    const storedLast = localStorage.getItem('ae_last_activity');
    if (storedLast) {
      const parsed = parseInt(storedLast, 10);
      if (!isNaN(parsed) && Date.now() - parsed < timeoutSeconds * 1000) {
        lastActivityRef.current = parsed;
      } else {
        lastActivityRef.current = Date.now();
        localStorage.setItem('ae_last_activity', lastActivityRef.current.toString());
      }
    } else {
      lastActivityRef.current = Date.now();
      localStorage.setItem('ae_last_activity', lastActivityRef.current.toString());
    }

    let throttleTimer: NodeJS.Timeout | null = null;
    const handleUserActivity = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 2000); // 2 segundos throttle

      // Si la advertencia aún no está abierta, actualizar última actividad
      if (!showWarning) {
        const now = Date.now();
        lastActivityRef.current = now;
        localStorage.setItem('ae_last_activity', now.toString());
      }
    };

    // Sincronizar actividad entre múltiples pestañas del navegador
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ae_last_activity' && e.newValue) {
        const parsed = parseInt(e.newValue, 10);
        if (!isNaN(parsed)) {
          lastActivityRef.current = parsed;
          setShowWarning(false);
        }
      }
      if (e.key === 'ae_token' && !e.newValue) {
        // Otra pestaña cerró la sesión
        onLogout('Cierre de sesión desde otra ventana');
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(ev => window.addEventListener(ev, handleUserActivity, { passive: true }));
    window.addEventListener('storage', handleStorageChange);

    // Intervalo de comprobación cada segundo
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSec = Math.floor((now - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, timeoutSeconds - elapsedSec);

      setRemainingSeconds(remaining);

      if (remaining <= 0 && !logoutTriggeredRef.current) {
        logoutTriggeredRef.current = true;
        setShowWarning(false);
        onLogout('Sesión expirada por inactividad');
      } else if (remaining <= warningThresholdSeconds && remaining > 0) {
        setShowWarning(true);
      } else if (remaining > warningThresholdSeconds) {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleUserActivity));
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [isAuthenticated, timeoutSeconds, warningThresholdSeconds, showWarning, onLogout]);

  return {
    remainingSeconds,
    showWarning,
    extendSession,
    totalTimeoutSeconds: timeoutSeconds
  };
}
