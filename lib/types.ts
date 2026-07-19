export type PaymentType = 'allowance' | 'perChore';
export type ChoreStatus = 'todo' | 'pending' | 'done';
export type Freq = 'Daily' | 'Weekly' | 'Monthly';
export type PayFreq = 'Weekly' | 'Every 2 weeks' | 'Monthly';

export interface Kid {
  id: string;
  name: string;
  age: number | null;
  balance: number;
  streak: number;
  lifetime: number;
  week: number[]; // Mon..Sun earnings
  limit: number; // weekly allowance cap
  phone?: string;
  email?: string;
}

export interface Parent {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface Chore {
  id: number;
  kid: string; // kid id, or 'open' for marketplace
  title: string;
  value: number;
  days: number[]; // Mon=0..Sun=6 (weekly)
  monthDays?: number[]; // 1..31 (monthly)
  recurring: boolean;
  freq?: Freq;
  status: ChoreStatus;
  desc?: string;
  steps?: string[];
  times?: string[]; // Morning/Afternoon/Evening
  startDate?: string; // ISO yyyy-mm-dd
  start?: string;
  biweekly?: boolean;
  active?: boolean;
  paymentType?: PaymentType;
  reviewRequired?: boolean;
  photoRequired?: boolean;
  completions?: Record<string, boolean>; // iso -> done (past days)
}

export interface Activity {
  text: string;
  amt: string;
  time: string;
}

export interface Reward {
  id: string;
  title: string;
  price: number;
  note: string;
}

export type PayCycleType = 'allowance' | 'perChore';

export interface DomainState {
  kids: Kid[];
  chores: Chore[];
  parents: Parent[];
  activity: Activity[];
  payDay: number; // Mon=0..Sun=6
  payFreq: PayFreq;
  payMonthDay: number;
  payCycleType: PayCycleType;
  currency: string;
  approvalRequired: boolean; // was a design prop; gates auto-payout on completion
  confetti: boolean;
}
