import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Chore, DomainState, PayFreq, PayCycleType, Reward } from '../lib/types';
import { fmt } from '../lib/domain';

// ── Seed data (verbatim from the prototype) ──────────────────────────────────
const SEED: DomainState = {
  kids: [
    { id: 'kid1', name: 'Sam', age: 12, balance: 14.25, streak: 6, lifetime: 212.75, week: [2.5, 3.25, 1.5, 4, 2.75, 0, 0], limit: 12 },
    { id: 'kid2', name: 'Max', age: 8, balance: 6.5, streak: 3, lifetime: 88.25, week: [1.25, 2, 0.75, 2.25, 1.5, 0, 0], limit: 8 },
  ],
  chores: [
    { id: 1, kid: 'kid1', title: 'Unload the dishwasher', value: 0.75, days: [0, 1, 2, 3, 4], recurring: true, status: 'todo', desc: 'Everything out of the racks and into the cupboards before school.', steps: ['Plates & bowls in the low cupboard', 'Glasses on the middle shelf', 'Cutlery sorted in the drawer'] },
    { id: 2, kid: 'kid1', title: 'Take out trash & recycling', value: 1, days: [3], recurring: true, status: 'todo', desc: 'Both bins to the curb — pickup is Friday morning.', steps: ['Tie the kitchen bag', 'Blue bin: paper & cans', 'New bag in the kitchen bin'] },
    { id: 3, kid: 'kid1', title: 'Walk Biscuit around the block', value: 1.5, days: [1, 3, 5], recurring: true, status: 'todo', desc: 'Once around the long block. Bring bags!', steps: ['Leash and two bags', 'Refill the water bowl when back'] },
    { id: 4, kid: 'kid2', title: 'Make your bed', value: 0.5, days: [0, 1, 2, 3, 4], recurring: true, status: 'done', desc: 'Pillow on top, dino on the pillow.', steps: ['Pull the duvet flat', 'Pillow at the top'] },
    { id: 5, kid: 'kid2', title: 'Feed Biscuit breakfast', value: 0.75, days: [0, 1, 2, 3, 4, 5, 6], recurring: true, status: 'todo', desc: 'One scoop, fresh water.', steps: ['One level scoop of kibble', 'Rinse and refill the water bowl'] },
    { id: 6, kid: 'kid2', title: 'Tidy the toy shelf', value: 1, days: [2], recurring: true, status: 'pending', desc: 'Lego in the lego tub, books standing up.', steps: ['Lego in the tub', 'Books spine-out', 'Floor clear'] },
    { id: 7, kid: 'open', title: 'Wash the car', value: 3, days: [5], recurring: false, status: 'todo', desc: 'Bucket, sponge, and the good soap from the garage.', steps: ['Rinse first', 'Soap top to bottom', 'Dry with the gray towels'] },
    { id: 8, kid: 'open', title: 'Weed the garden bed', value: 2.5, days: [], recurring: false, status: 'todo', desc: 'The front bed only — roots and all.', steps: ['Gloves are in the shed', 'Weeds in the green bin'] },
    { id: 9, kid: 'open', title: 'Vacuum the stairs', value: 1.5, days: [], recurring: false, status: 'todo', desc: 'Top to bottom with the handheld.', steps: ['Corners count!'] },
  ],
  activity: [
    { text: 'Alex paid Max for “Make your bed”', amt: '+$0.50', time: '8:12 AM' },
    { text: 'Sam cashed out “Movie night pick”', amt: '−$4.00', time: 'Yesterday' },
  ],
  parents: [{ id: 'parent1', name: 'Alex', phone: '', email: '' }],
  payDay: 4,
  payFreq: 'Weekly',
  payMonthDay: 1,
  payCycleType: 'allowance',
  currency: '$',
  approvalRequired: true,
  confetti: true,
};

export const REWARDS: Reward[] = [
  { id: 'r1', title: 'Movie night pick', price: 4, note: 'You choose Friday’s film. Popcorn included.' },
  { id: 'r2', title: 'Extra 30 min screen time', price: 2.5, note: 'Any day this week, after homework.' },
  { id: 'r3', title: 'Ice cream run', price: 3, note: 'Two scoops, any flavor, no vegetables first.' },
  { id: 'r4', title: 'Skip-a-chore pass', price: 5, note: 'One chore, no questions asked.' },
  { id: 'r5', title: 'Sleepover Saturday', price: 8, note: 'One friend, pizza included.' },
  { id: 'r6', title: 'Cash payout', price: 5, note: '$5 in real paper money from Dad’s wallet.' },
];

// Payload accepted by add/update chore (mirrors the form's "shared" object).
export interface ChoreDraft {
  title: string;
  desc: string;
  icon: string | null; // explicit icon; null = auto-derive from title
  value: number;
  paymentType: 'allowance' | 'perChore';
  reviewRequired: boolean;
  photoRequired: boolean;
  active: boolean;
  recurring: boolean;
  freq: 'Daily' | 'Weekly' | 'Monthly';
  days: number[];
  monthDays: number[];
  times: string[];
  start: string;
  startDate: string;
  biweekly: boolean;
  targets: string[]; // kid ids, or ['open'] for marketplace
}

export interface FamilyDraft {
  kind: 'parent' | 'child';
  name: string;
  phone: string;
  email: string;
}

interface StoreValue extends DomainState {
  toastMsg: string | null;
  showToast: (msg: string) => void;
  approve: (id: number) => void;
  redo: (id: number) => void;
  markDone: (id: number) => void;
  uncheckChore: (id: number) => void;
  toggleCompletion: (id: number, iso: string) => void;
  addChore: (d: ChoreDraft) => void;
  updateChore: (id: number, d: ChoreDraft) => void;
  deleteChore: (id: number) => void;
  setKidLimit: (id: string, limit: number) => void;
  setPay: (patch: Partial<Pick<DomainState, 'payDay' | 'payFreq' | 'payMonthDay' | 'payCycleType'>>) => void;
  addFamily: (d: FamilyDraft) => void;
  updateFamily: (kind: 'parent' | 'child', id: string, d: Omit<FamilyDraft, 'kind'>) => void;
  removeFamily: (kind: 'parent' | 'child', id: string) => string | null; // returns error msg or null
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DomainState>(SEED);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3500);
  }, []);

  const kidById = useCallback((id: string) => state.kids.find((k) => k.id === id), [state.kids]);

  const pay = useCallback((kidId: string, amount: number) => {
    setState((s) => ({
      ...s,
      kids: s.kids.map((k) =>
        k.id === kidId
          ? {
              ...k,
              balance: +(k.balance + amount).toFixed(2),
              lifetime: +(k.lifetime + amount).toFixed(2),
              week: k.week.map((v, i) => (i === 4 ? +(v + amount).toFixed(2) : v)),
            }
          : k
      ),
    }));
  }, []);

  const approve = useCallback(
    (id: number) => {
      const c = state.chores.find((x) => x.id === id);
      if (!c) return;
      const kid = kidById(c.kid);
      if (!kid) return;
      setState((s) => ({
        ...s,
        chores: s.chores.map((x) => (x.id === id ? { ...x, status: 'done' } : x)),
        activity: [
          { text: (s.parents[0]?.name ?? 'Parent') + ' paid ' + kid.name + ' for “' + c.title + '”', amt: '+' + fmt(c.value, s.currency), time: 'Just now' },
          ...s.activity,
        ],
      }));
      pay(c.kid, c.value);
      showToast('Approved “' + c.title + '” — ' + fmt(c.value, state.currency) + ' paid to ' + kid.name);
    },
    [state.chores, state.currency, kidById, pay, showToast]
  );

  const redo = useCallback(
    (id: number) => {
      const c = state.chores.find((x) => x.id === id);
      if (!c) return;
      setState((s) => ({ ...s, chores: s.chores.map((x) => (x.id === id ? { ...x, status: 'todo' } : x)) }));
      showToast('Asked ' + (kidById(c.kid)?.name ?? '') + ' to redo “' + c.title + '”');
    },
    [state.chores, kidById, showToast]
  );

  // Check off a chore for today: pays out instantly or sends it for review.
  const markDone = useCallback(
    (id: number) => {
      const c = state.chores.find((x) => x.id === id);
      if (!c || c.status !== 'todo') return;
      const kid = kidById(c.kid);
      if (!kid) return;
      const isAllowance = c.paymentType === 'allowance';
      const instant = isAllowance ? !c.reviewRequired : !state.approvalRequired;
      setState((s) => ({ ...s, chores: s.chores.map((x) => (x.id === id ? { ...x, status: instant ? 'done' : 'pending' } : x)) }));
      if (instant) {
        pay(c.kid, c.value);
        setState((s) => ({
          ...s,
          activity: [{ text: kid.name + ' finished “' + c.title + '”', amt: '+' + fmt(c.value, s.currency), time: 'Just now' }, ...s.activity],
        }));
        showToast(kid.name + ' finished “' + c.title + '” — ' + fmt(c.value, state.currency) + ' paid automatically');
      } else {
        showToast(kid.name + ' finished “' + c.title + '” — ' + fmt(c.value, state.currency) + ' waiting for your OK');
      }
    },
    [state.chores, state.approvalRequired, state.currency, kidById, pay, showToast]
  );

  const uncheckChore = useCallback((id: number) => {
    setState((s) => ({ ...s, chores: s.chores.map((x) => (x.id === id ? { ...x, status: 'todo' } : x)) }));
  }, []);

  // Toggle a past-day completion record (history editing on the Previous tab).
  const toggleCompletion = useCallback((id: number, iso: string) => {
    setState((s) => ({
      ...s,
      chores: s.chores.map((x) => {
        if (x.id !== id) return x;
        const completions = { ...(x.completions || {}) };
        completions[iso] = !completions[iso];
        return { ...x, completions };
      }),
    }));
  }, []);

  const draftToShared = (d: ChoreDraft) => ({
    value: +d.value.toFixed(2),
    paymentType: d.paymentType,
    reviewRequired: d.reviewRequired,
    photoRequired: d.photoRequired,
    active: d.active,
    recurring: d.recurring,
    freq: d.freq,
    days: [...d.days].sort((a, b) => a - b),
    monthDays: [...d.monthDays].sort((a, b) => a - b),
    times: [...d.times],
    start: d.start,
    startDate: d.startDate,
    biweekly: d.biweekly,
    desc: d.desc.trim(),
    icon: d.icon || undefined,
  });

  const addChore = useCallback(
    (d: ChoreDraft) => {
      const shared = draftToShared(d);
      const base = Date.now();
      const added: Chore[] = d.targets.map((kid, i) => ({
        id: base + i,
        kid,
        title: d.title.trim(),
        status: 'todo',
        steps: [],
        ...shared,
      }));
      setState((s) => ({ ...s, chores: [...s.chores, ...added] }));
      const payDesc = d.paymentType === 'allowance' ? 'part of allowance' : fmt(d.value, state.currency);
      if (d.targets[0] === 'open') {
        showToast('Posted “' + d.title.trim() + '” to the marketplace — ' + payDesc);
      } else {
        const names = d.targets.map((t) => kidById(t)?.name).join(' & ');
        showToast('Added “' + d.title.trim() + '” to ' + names + '’s list — ' + payDesc);
      }
    },
    [state.currency, kidById, showToast]
  );

  const updateChore = useCallback(
    (id: number, d: ChoreDraft) => {
      const shared = draftToShared(d);
      const first = d.targets[0];
      const base = Date.now();
      const extra: Chore[] = d.targets.slice(1).map((kid, i) => ({
        id: base + i,
        kid,
        title: d.title.trim(),
        status: 'todo',
        steps: [],
        ...shared,
      }));
      setState((s) => ({
        ...s,
        chores: [
          ...s.chores.map((x) => (x.id === id ? { ...x, title: d.title.trim(), kid: first, ...shared } : x)),
          ...extra,
        ],
      }));
      showToast('Updated “' + d.title.trim() + '”');
    },
    [showToast]
  );

  const deleteChore = useCallback(
    (id: number) => {
      const c = state.chores.find((x) => x.id === id);
      setState((s) => ({ ...s, chores: s.chores.filter((x) => x.id !== id) }));
      if (c) showToast('Deleted “' + c.title + '”');
    },
    [state.chores, showToast]
  );

  const setKidLimit = useCallback((id: string, limit: number) => {
    setState((s) => ({ ...s, kids: s.kids.map((k) => (k.id === id ? { ...k, limit: Math.max(0, +limit.toFixed(2)) } : k)) }));
  }, []);

  const setPay = useCallback((patch: Partial<DomainState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const addFamily = useCallback(
    (d: FamilyDraft) => {
      const name = d.name.trim();
      if (!name) return;
      if (d.kind === 'parent') {
        const id = 'parent-' + Date.now();
        setState((s) => ({ ...s, parents: [...s.parents, { id, name, phone: d.phone.trim(), email: d.email.trim() }] }));
        showToast('Added ' + name + ' as a parent');
      } else {
        const id = 'kid-' + Date.now();
        setState((s) => ({
          ...s,
          kids: [...s.kids, { id, name, age: null, balance: 0, streak: 0, lifetime: 0, week: [0, 0, 0, 0, 0, 0, 0], limit: 10, phone: d.phone.trim(), email: d.email.trim() }],
        }));
        showToast('Added ' + name);
      }
    },
    [showToast]
  );

  const updateFamily = useCallback(
    (kind: 'parent' | 'child', id: string, d: Omit<FamilyDraft, 'kind'>) => {
      const name = d.name.trim();
      if (!name) return;
      if (kind === 'parent') {
        setState((s) => ({ ...s, parents: s.parents.map((p) => (p.id === id ? { ...p, name, phone: d.phone.trim(), email: d.email.trim() } : p)) }));
      } else {
        setState((s) => ({ ...s, kids: s.kids.map((k) => (k.id === id ? { ...k, name, phone: d.phone.trim(), email: d.email.trim() } : k)) }));
      }
      showToast('Updated ' + name);
    },
    [showToast]
  );

  const removeFamily = useCallback(
    (kind: 'parent' | 'child', id: string): string | null => {
      if (kind === 'parent') {
        if (state.parents.length <= 1) {
          showToast('At least one parent is required');
          return 'At least one parent is required';
        }
        const name = state.parents.find((p) => p.id === id)?.name ?? '';
        setState((s) => ({ ...s, parents: s.parents.filter((p) => p.id !== id) }));
        showToast('Removed ' + name);
      } else {
        const name = kidById(id)?.name ?? '';
        setState((s) => ({ ...s, kids: s.kids.filter((k) => k.id !== id), chores: s.chores.filter((c) => c.kid !== id) }));
        showToast('Removed ' + name);
      }
      return null;
    },
    [state.parents, kidById, showToast]
  );

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      toastMsg,
      showToast,
      approve,
      redo,
      markDone,
      uncheckChore,
      toggleCompletion,
      addChore,
      updateChore,
      deleteChore,
      setKidLimit,
      setPay,
      addFamily,
      updateFamily,
      removeFamily,
    }),
    [state, toastMsg, showToast, approve, redo, markDone, uncheckChore, toggleCompletion, addChore, updateChore, deleteChore, setKidLimit, setPay, addFamily, updateFamily, removeFamily]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
