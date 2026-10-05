import { useCallback, useEffect, useRef, useState } from 'react';
import { ContractProject } from '../types';
import { ConflictError, WorkspaceStore } from './store';

export type SyncStatus =
  | { state: 'idle' }
  | { state: 'saving' }
  | { state: 'saved'; at: number }
  | { state: 'readonly' }
  | { state: 'error'; message: string }
  | { state: 'conflict'; message: string };

/**
 * Debounced, strictly sequential persistence of edited contracts.
 * Only the latest edit of each contract is sent; saves never overlap, so
 * version-checked updates cannot race each other.
 */
export function useContractSync(store: WorkspaceStore, canWrite: boolean, debounceMs: number) {
  const pending = useRef(new Map<string, ContractProject>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushing = useRef(false);
  const [status, setStatus] = useState<SyncStatus>(canWrite ? { state: 'idle' } : { state: 'readonly' });

  const flush = useCallback(async () => {
    if (flushing.current || pending.current.size === 0) return;
    flushing.current = true;
    setStatus({ state: 'saving' });

    const batch = [...pending.current.values()];
    pending.current.clear();

    let failed: unknown = null;
    for (let i = 0; i < batch.length; i++) {
      try {
        await store.saveContract(batch[i]);
      } catch (err) {
        failed = err;
        // Requeue what was not saved, unless a newer edit was queued meanwhile
        for (const c of batch.slice(i)) {
          if (!pending.current.has(c.id) && !(err instanceof ConflictError && c.id === batch[i].id)) {
            pending.current.set(c.id, c);
          }
        }
        break;
      }
    }
    flushing.current = false;

    if (failed instanceof ConflictError) {
      setStatus({ state: 'conflict', message: failed.message });
    } else if (failed) {
      const message = failed instanceof Error ? failed.message : 'Unknown error';
      setStatus({ state: 'error', message });
    } else if (pending.current.size > 0) {
      // Edits arrived while saving
      void flush();
    } else {
      setStatus({ state: 'saved', at: Date.now() });
    }
  }, [store]);

  const queue = useCallback(
    (contract: ContractProject) => {
      if (!canWrite) return;
      pending.current.set(contract.id, contract);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), debounceMs);
    },
    [canWrite, debounceMs, flush]
  );

  const retry = useCallback(() => void flush(), [flush]);

  /** Drop unsaved edits, e.g. after reloading the latest server copy. */
  const discardPending = useCallback(() => {
    pending.current.clear();
    if (timer.current) clearTimeout(timer.current);
    setStatus(canWrite ? { state: 'idle' } : { state: 'readonly' });
  }, [canWrite]);

  // Warn before closing the tab with unsaved edits
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pending.current.size > 0 || flushing.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // Flush on unmount (e.g. switching organization)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      void flush();
    },
    [flush]
  );

  return { status, queue, retry, discardPending };
}
