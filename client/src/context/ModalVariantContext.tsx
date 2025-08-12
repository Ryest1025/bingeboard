// context/ModalVariantContext.tsx - Provides A/B modal variant across app
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type ModalVariant = 'full' | 'lite';

interface ModalVariantContextValue {
  variant: ModalVariant;
  setVariant: (v: ModalVariant) => void; // manual override (debug / QA)
  source: string; // how the current variant was chosen (query|storage|env|random|override)
}

const ModalVariantContext = createContext<ModalVariantContextValue | undefined>(undefined);

function resolveInitialVariant(): { variant: ModalVariant; source: string } {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const qp = params.get('variant');
      if (qp === 'lite' || qp === 'full') {
        return { variant: qp, source: 'query' };
      }
      const stored = localStorage.getItem('bb.modalVariant');
      if (stored === 'lite' || stored === 'full') {
        return { variant: stored, source: 'storage' };
      }
    } catch (e) {
      // ignore
    }
  }
  // @ts-ignore Vite inject
  const envDefault = typeof import.meta !== 'undefined' ? import.meta.env.VITE_DEFAULT_MODAL_VARIANT : undefined;
  if (envDefault === 'lite' || envDefault === 'full') {
    return { variant: envDefault, source: 'env' };
  }
  // Random assignment (simple 50/50) - can later plug in user hashing
  const randomVariant: ModalVariant = Math.random() < 0.5 ? 'full' : 'lite';
  return { variant: randomVariant, source: 'random' };
}

export function ModalVariantProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => resolveInitialVariant(), []);
  const [variant, setVariantState] = useState<ModalVariant>(initial.variant);
  const [source, setSource] = useState<string>(initial.source);
  const { user } = useAuth();

  // Persist if from random/env so it's sticky for session/future visits
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bb.modalVariant');
      if (!stored || stored !== variant) {
        localStorage.setItem('bb.modalVariant', variant);
      }
    } catch (e) {
      // no-op
    }
  }, [variant]);

  // Expose source globally for analytics enrichment
  useEffect(() => {
    try { (window as any).__bbVariantSource = source; } catch { /* ignore */ }
  }, [source]);

  const setVariant = (v: ModalVariant) => {
    setVariantState(v);
    setSource('override');
    try { localStorage.setItem('bb.modalVariant', v); } catch { /* ignore */ }
  };

  // Deterministic assignment based on user ID/email when available
  useEffect(() => {
    if (!user) return;
    // Don't override explicit sources
    if (source === 'query' || source === 'storage' || source === 'override') return;
    const key = user?.id || user?.uid || user?.email || '';
    if (!key) return;
    const hash = simpleHash(key);
    const detVariant: ModalVariant = (hash % 2 === 0) ? 'full' : 'lite';
    if (detVariant !== variant) {
      setVariantState(detVariant);
    }
    setSource('deterministic');
    try { localStorage.setItem('bb.modalVariant', detVariant); } catch { /* ignore */ }
  }, [user, source]);

  const value = useMemo<ModalVariantContextValue>(() => ({ variant, setVariant, source }), [variant, source]);
  return <ModalVariantContext.Provider value={value}>{children}</ModalVariantContext.Provider>; 
}

export function useModalVariant(): ModalVariantContextValue {
  const ctx = useContext(ModalVariantContext);
  if (!ctx) throw new Error('useModalVariant must be used within ModalVariantProvider');
  return ctx;
}

// Simple string hash (deterministic)
function simpleHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}
