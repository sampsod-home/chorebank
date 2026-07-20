# ChoreBank — build notes

React Native + Expo implementation of the **ChoreBank** prototype
(`../chore-app-prototype/project/Chore App.dc.html`). This pass builds the
**parent iPhone app**; the kid iPad app is the next milestone.

## Run it

```bash
cd chorebank
npm start          # Expo dev server — scan the QR with Expo Go on your iPhone/iPad
npm run web        # browser preview (fast design iteration)
npm run ios        # needs full Xcode + a simulator (Command Line Tools alone won't work)
```

## Architecture

| Layer | Location | Notes |
|-------|----------|-------|
| Design tokens | `theme/index.ts` | Ported from `modernist.css`. `color-mix()` → `rgba()`; added semantic green/red/yellow/blue the prototype lacked. |
| Types | `lib/types.ts` | Kid / Chore / Parent / Activity / DomainState. |
| Pure domain logic | `lib/domain.ts` | `schedule`, `choreIcon`, `occursOn`, `cycleStats`, `planned`, currency + date helpers. "Today" is pinned to 2026‑07‑17 so seed data lines up. |
| Store | `store/store.tsx` | React context: domain state + actions (approve/redo/add/update/delete chore, family CRUD, pay settings) + toast. Seed data is verbatim from the prototype. |
| Primitives | `components/` | Button, Card, Tag, Input, Toggle, Chip/SegBar, Icon (SVG set), Dialog, Toast, TopBar, TabBar. |
| Screens | `screens/` | Home, Chores (`chores/ChoreList` + `chores/ChoreForm`), Payday, Family. |

Split from the prototype's single component: **domain data lives in the store**;
**form/dialog/sub-tab UI state is local to each screen**.

## Verified (Expo web)

- Home: approve pays out → wallet +, activity logged, pending clears, toast.
- Chores: library list w/ icon matcher; create form with cascading reveals
  (repeat→freq→days, payment type→value chips); live `disabled` validation.
- Payday: allowance limits (stepper + input), payout schedule, pay-cycle bars.
- Family: sorted member list, add/edit form, remove-confirm dialog.
- Chores → Manage / Current / Previous sub-tabs. Current (today→payday, only
  today checkable) and Previous (last 30 days, fully editable) run off
  `kidDayGroups`; check-off uses markDone / uncheckChore / toggleCompletion.

## Deferred / next

- **Kid iPad app** (the `showIpad` half of the prototype): Today two-column
  checklist, Reward store, Stats, chore-detail modal, confetti, marketplace claim.
  (Note: `kidDayGroups` + the check-off actions are already ported — ~70% of the
  kid app's core logic is in place.)
- **Photo upload** for family members (the prototype's `image-slot`) — native
  concern; currently an initial-based avatar.
- **Persistence** (state resets on reload) and the **cloud backend** the brief
  calls for (4 devices, one shared reality).
