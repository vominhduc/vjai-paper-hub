import { getCyclePhase, Cycle } from '../src/lib/data';

describe('getCyclePhase', () => {
  const baseCycle: Cycle = {
    id: '2026-apr',
    quarter: '',
    cycle: 1,
    month: 'April',
    year: 2026,
    theme: 'Test',
    nomination_end: '2026-03-29',
    exploration_start: '2026-03-30',
    session_date: '2026-04-12',
    nominations: [],
    session: { date: '2026-04-12', presenter: '', presenter_role: '', agenda: [] },
    status: 'active'
  };

  it('returns "nominating" before exploration_start', () => {
    expect(getCyclePhase(baseCycle, new Date('2026-03-28'))).toBe('nominating');
  });
  it('returns "voting" during voting window', () => {
    expect(getCyclePhase(baseCycle, new Date('2026-03-31'))).toBe('voting');
  });
  it('returns "deep-dive" after voting, before session', () => {
    expect(getCyclePhase(baseCycle, new Date('2026-04-05'))).toBe('deep-dive');
  });
  it('returns "archived" after session_date', () => {
    expect(getCyclePhase(baseCycle, new Date('2026-04-13'))).toBe('archived');
  });
});
