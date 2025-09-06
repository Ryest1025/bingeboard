// hooks/useOpenShowModal.tsx - Centralized variant-aware modal launcher
import React, { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import BrandedShowModal from '@/components/search/BrandedShowModal';
import BrandedShowModalLite from '@/components/search/BrandedShowModalLite';
import { useModalVariant } from '@/context/ModalVariantContext';

type ShowType = string; // 'movie' | 'tv' but keep wide to avoid churn

interface Options {
  onAddToWatchlist?: (showId: number) => void;
  onWatchNow?: (show: any) => void;
  // analytics source for debugging e.g., 'search' | 'dashboard' | 'discover'
  source?: string;
}

export function useOpenShowModal(opts: Options = {}) {
  const qc = useQueryClient();
  const { variant } = useModalVariant();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ShowType>('movie');

  const openModal = useCallback((id: string, type: ShowType = 'movie') => {
    setSelectedId(id);
    setSelectedType(type);
    setOpen(true);
    // Prefetch details to speed up modal
    qc.prefetchQuery({
      queryKey: ['show-details', id, type],
      queryFn: () => fetch(`/api/tmdb/${type}/${id}`).then(r => r.json()),
      staleTime: 1000 * 60 * 10,
    });
  }, [qc]);

  const closeModal = useCallback(() => setOpen(false), []);

  const Modal = useMemo(() => function ModalRenderer() {
    if (variant === 'lite') {
      return (
        <BrandedShowModalLite
          showId={selectedId}
          showType={selectedType}
          open={open}
          onClose={closeModal}
          onAddToWatchlist={opts.onAddToWatchlist}
          onWatchNow={opts.onWatchNow}
        />
      );
    }
    return (
      <BrandedShowModal
        showId={selectedId}
        showType={selectedType}
        open={open}
        onClose={closeModal}
        onAddToWatchlist={opts.onAddToWatchlist}
        onWatchNow={opts.onWatchNow}
      />
    );
  }, [variant, selectedId, selectedType, open, closeModal, opts.onAddToWatchlist, opts.onWatchNow]);

  return { openModal, closeModal, Modal, currentId: selectedId, currentType: selectedType };
}

export default useOpenShowModal;
