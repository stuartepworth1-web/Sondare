import { useEffect, useRef, useCallback, useState } from 'react';

interface AutoSaveOptions {
  onSave: () => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ onSave, delay = 3000, enabled = true }: AutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const dataRef = useRef<any>();

  const saveNow = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsSaving(true);
      await onSave();
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [onSave, enabled]);

  const scheduleSave = useCallback(() => {
    if (!enabled) return;

    setHasUnsavedChanges(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveNow();
    }, delay);
  }, [delay, saveNow, enabled]);

  const markChanged = useCallback(() => {
    scheduleSave();
  }, [scheduleSave]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveNow,
    markChanged,
    scheduleSave,
  };
}
