import { Chore, DomainState, Kid, PayFreq } from './types';

// The prototype pins "today" so the seed data (streaks, week totals, the
// Friday-July-17 header) lines up deterministically. Keep it identical.
export const TODAY = Date.UTC(2026, 6, 17);
const DAY = 86400000;

export const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
export const DAYS_MED = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const NEXT_DATE = ['Jul 20', 'Jul 21', 'Jul 22', 'Jul 23', 'Jul 24', 'Jul 18', 'Jul 19'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const fmt = (n: number, currency = '$') => currency + n.toFixed(2);

export const valueLabel = (c: Chore, currency = '$') =>
  c.paymentType === 'allowance' ? 'Allowance' : fmt(c.value, currency);

export function ordinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return n + 'th';
  const r = n % 10;
  return n + (r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th');
}

export function isoOf(t: number) {
  const d = new Date(t);
  return (
    d.getUTCFullYear() +
    '-' +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getUTCDate()).padStart(2, '0')
  );
}

export function formatDate(iso?: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dateStr = MONTHS[m - 1] + ' ' + d + ', ' + y;
  const target = Date.UTC(y, m - 1, d);
  const diffDays = Math.round((target - TODAY) / DAY);
  const prefix =
    diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : WEEKDAYS[new Date(target).getUTCDay()];
  return prefix + ', ' + dateStr;
}

/** Icon key (matches the <Icon name>) + background color for a chore title. */
export function choreIcon(title: string) {
  const t = (title || '').toLowerCase();
  const defs: [RegExp, string, string][] = [
    [/dish|kitchen/, 'utensils', 'var-neutral-800'],
    [/trash|garbage|recycl/, 'trash', 'var-neutral-700'],
    [/laundry|clothes|fold/, 'shirt', 'var-accent-700'],
    [/homework|read|book|study/, 'book', 'var-neutral-800'],
    [/car|wash/, 'car', 'var-accent-600'],
    [/water|plant/, 'droplet', 'var-neutral-700'],
    [/dog|cat|pet|feed/, 'paw', 'var-accent-700'],
    [/yard|lawn|leaves|garden/, 'leaf', 'var-neutral-800'],
    [/bed|room|tidy|clean|vacuum|sweep/, 'sparkles', 'var-accent-600'],
  ];
  const hit = defs.find(([re]) => re.test(t));
  return { name: hit ? hit[1] : 'star', bgKey: hit ? hit[2] : 'var-neutral-800' };
}

// Icons offered in the chore form's picker (same set the title-matcher uses).
export const CHORE_ICONS: string[] = ['utensils', 'trash', 'shirt', 'book', 'car', 'droplet', 'paw', 'leaf', 'sparkles', 'star'];

const ICON_BG: Record<string, string> = {
  utensils: 'var-neutral-800',
  trash: 'var-neutral-700',
  shirt: 'var-accent-700',
  book: 'var-neutral-800',
  car: 'var-accent-600',
  droplet: 'var-neutral-700',
  paw: 'var-accent-700',
  leaf: 'var-neutral-800',
  sparkles: 'var-accent-600',
  star: 'var-neutral-800',
};

/** A chore's tile icon: explicit `icon` if set, otherwise derived from the title. */
export function iconForChore(c: Chore) {
  if (c.icon) return { name: c.icon, bgKey: ICON_BG[c.icon] ?? 'var-neutral-800' };
  return choreIcon(c.title);
}

export function schedule(c: Chore) {
  if (!c.recurring) {
    const t = (c.times || []).join('/');
    return 'One time' + (t ? ' · ' + t : '');
  }
  let freqLbl: string;
  if (c.freq === 'Daily') freqLbl = 'Every day';
  else if (c.freq === 'Monthly')
    freqLbl = (c.monthDays || []).length
      ? 'Monthly: ' + (c.monthDays || []).map((d) => ordinal(d)).join(', ')
      : 'Monthly';
  else {
    const d = c.days || [];
    freqLbl = d.length === 7 ? 'Every day' : d.length ? d.map((i) => DAYS_MED[i]).join(' · ') : 'Weekly';
  }
  const t = (c.times || []).join('/');
  return freqLbl + (t ? ' · ' + t : '');
}

/** Does a chore occur on a given timestamp? (weekday index Mon=0). */
export function occursOn(c: Chore, t: number) {
  const d = new Date(t);
  const monWeekday = (d.getUTCDay() + 6) % 7;
  const monthDay = d.getUTCDate();
  if (!c.recurring) return c.startDate === isoOf(t);
  if (c.freq === 'Daily') return true;
  if (c.freq === 'Monthly') return (c.monthDays || []).includes(monthDay);
  return (c.days || []).includes(monWeekday);
}

export function weekSum(k: Kid) {
  return k.week.reduce((a, b) => a + b, 0);
}

export function planned(state: DomainState, kidId: string) {
  return state.chores
    .filter((c) => c.kid === kidId && c.active !== false)
    .reduce((a, c) => {
      if (!c.recurring) return a + c.value;
      const mult =
        c.freq === 'Daily'
          ? 7
          : c.freq === 'Monthly'
          ? Math.max((c.monthDays || []).length, 1)
          : Math.max((c.days || []).length, 1);
      return a + c.value * mult;
    }, 0);
}

function paydayTarget(state: DomainState) {
  const s = state;
  if (s.payFreq === 'Monthly') {
    const d = new Date(TODAY);
    let target = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), s.payMonthDay);
    if (target <= TODAY) target = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, s.payMonthDay);
    return target;
  }
  const jsTarget = (s.payDay + 1) % 7;
  for (let i = 1; i <= 14; i++) {
    const t = TODAY + i * DAY;
    if (new Date(t).getUTCDay() === jsTarget) return t;
  }
  return TODAY + 7 * DAY;
}

function cycleStart(state: DomainState) {
  const end = paydayTarget(state);
  if (state.payFreq === 'Monthly') {
    const d = new Date(end);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, state.payMonthDay);
  }
  const len = state.payFreq === 'Every 2 weeks' ? 14 : 7;
  return end - len * DAY;
}

export function nextPayoutTarget(state: DomainState) {
  return paydayTarget(state);
}

/** Per-kid pay-cycle stats split by allowance vs per-chore. */
export function cycleStats(state: DomainState, kidId: string) {
  const start = cycleStart(state);
  const end = paydayTarget(state) - DAY;
  let allowTotal = 0,
    allowDone = 0;
  let perTotal = 0,
    perDone = 0,
    perPossible = 0,
    perEarned = 0;
  for (let t = start; t <= end; t += DAY) {
    const iso = isoOf(t);
    state.chores
      .filter((c) => c.kid === kidId && c.active !== false && occursOn(c, t))
      .forEach((c) => {
        const isToday = t === TODAY;
        const done = isToday
          ? c.status !== 'todo'
          : t < TODAY
          ? !!(c.completions && c.completions[iso])
          : false;
        if (c.paymentType === 'allowance') {
          allowTotal++;
          if (done) allowDone++;
        } else {
          perTotal++;
          perPossible += c.value;
          if (done) {
            perDone++;
            perEarned += c.value;
          }
        }
      });
  }
  const limit = state.kids.find((k) => k.id === kidId)!.limit;
  const perChoreShare = allowTotal ? limit / allowTotal : 0;
  return {
    allowance: {
      choresTotal: allowTotal,
      choresDone: allowDone,
      moneyEarned: +(allowDone * perChoreShare).toFixed(2),
      moneyPossible: limit,
    },
    perChore: {
      choresTotal: perTotal,
      choresDone: perDone,
      moneyEarned: +perEarned.toFixed(2),
      moneyPossible: +perPossible.toFixed(2),
    },
  };
}

export interface DayGroupItem {
  chore: Chore;
  iso: string;
  checked: boolean;
  isDone: boolean; // today + done → line-through
  editable: boolean; // today (Current) or any day (Previous)
  isToday: boolean;
  showPay: boolean;
  valueLabel: string;
}
export interface DayGroup {
  label: string;
  items: DayGroupItem[];
}

/**
 * Chores grouped by day for a kid.
 *  - mode 'current':  today → payday, only today is editable (future is preview).
 *  - mode 'previous': last 30 days (most-recent first), every day editable.
 * `filter` is 'all' | 'allowance' | 'perChore'.
 */
export function kidDayGroups(
  state: DomainState,
  kidId: string,
  filter: 'all' | 'allowance' | 'perChore',
  mode: 'current' | 'previous'
): DayGroup[] {
  const isPrevious = mode === 'previous';
  const start = isPrevious ? TODAY - 30 * DAY : TODAY;
  const end = isPrevious ? TODAY - DAY : Math.max(nextPayoutTarget(state), TODAY);
  const step = isPrevious ? -DAY : DAY;
  const from = isPrevious ? end : start;
  const to = isPrevious ? start : end;
  const groups: DayGroup[] = [];
  for (let t = from; isPrevious ? t >= to : t <= to; t += step) {
    const d = new Date(t);
    const jsDay = d.getUTCDay();
    const diff = Math.round((t - TODAY) / DAY);
    const iso = isoOf(t);
    const label =
      (diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff === -1 ? 'Yesterday' : WEEKDAYS[jsDay]) +
      ', ' +
      MONTHS[d.getUTCMonth()] +
      ' ' +
      d.getUTCDate();
    const items: DayGroupItem[] = state.chores
      .filter((c) => c.kid === kidId && c.active !== false)
      .filter((c) => {
        const pt = c.paymentType || 'perChore';
        if (filter === 'allowance' && pt !== 'allowance') return false;
        if (filter === 'perChore' && pt !== 'perChore') return false;
        return occursOn(c, t);
      })
      .map((c) => {
        const isToday = diff === 0 && !isPrevious;
        const checked = isToday ? c.status !== 'todo' : !!(c.completions && c.completions[iso]);
        return {
          chore: c,
          iso,
          checked,
          isDone: isToday && c.status === 'done',
          editable: isToday || isPrevious,
          isToday,
          showPay: (c.paymentType || 'perChore') === 'perChore',
          valueLabel: valueLabel(c, state.currency),
        };
      });
    if (items.length) groups.push({ label, items });
  }
  return groups;
}

export function payFreqLabel(state: DomainState) {
  return state.payFreq === 'Weekly'
    ? 'every ' + DAYS_MED[state.payDay]
    : state.payFreq === 'Every 2 weeks'
    ? 'every other ' + DAYS_MED[state.payDay]
    : 'monthly on the ' + ordinal(state.payMonthDay);
}
