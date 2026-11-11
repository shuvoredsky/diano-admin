'use client';

import { useEffect, useCallback } from 'react';

/**
 * Warns users before navigating away or closing the window with unsaved form changes.
 */
export function useDirtyFormGuard(
  isDirty: boolean,
  message = 'You have unsaved changes. Are you sure you want to discard them?'
) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);

  const confirmNavigation = useCallback((): boolean => {
    if (!isDirty) return true;
    return window.confirm(message);
  }, [isDirty, message]);

  return { confirmNavigation };
}

