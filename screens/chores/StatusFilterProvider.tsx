import React, { createContext, useContext, useMemo, useState } from 'react';
import { useStore } from '../../store/store';
import { FilterSheet } from './FilterSheet';

type Filter = 'all' | 'allowance' | 'perChore';
type Mode = 'current' | 'previous';

interface StatusFilter {
  kidId: string;
  filter: Filter;
  mode: Mode;
  setKid: (id: string) => void;
  setFilter: (f: Filter) => void;
  setMode: (m: Mode) => void;
  open: () => void;
  close: () => void;
}

const Ctx = createContext<StatusFilter | null>(null);

export function useStatusFilter() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStatusFilter must be used within StatusFilterProvider');
  return c;
}

/**
 * Holds the Chores→Status filter selection and renders the filter sheet as an
 * in-frame overlay. Mounted inside the device frame so the sheet dims/covers
 * the app, not the whole browser window.
 */
export function StatusFilterProvider({ children }: { children: React.ReactNode }) {
  const { kids } = useStore();
  const [kidId, setKid] = useState<string>(() => kids[0]?.id ?? '');
  const [filter, setFilter] = useState<Filter>('all');
  const [mode, setMode] = useState<Mode>('current');
  const [isOpen, setOpen] = useState(false);

  const value = useMemo<StatusFilter>(
    () => ({ kidId, filter, mode, setKid, setFilter, setMode, open: () => setOpen(true), close: () => setOpen(false) }),
    [kidId, filter, mode]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <FilterSheet
        visible={isOpen}
        onClose={() => setOpen(false)}
        kids={kids}
        kidId={kidId}
        onKid={setKid}
        mode={mode}
        onMode={setMode}
        filter={filter}
        onFilter={setFilter}
      />
    </Ctx.Provider>
  );
}
