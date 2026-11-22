import { seedTickets } from '../data/mockTickets';

const KEY = 'deskflow.frontend.demo.tickets.v1';
const COUNTER_KEY = 'deskflow.frontend.demo.highestTicketNumber.v1';
const FIRST_DEMO_MAX = 1042;
const clone = (value) => JSON.parse(JSON.stringify(value));
let sessionHighWater = FIRST_DEMO_MAX;

// Only migrate known demo customers on the original seed tickets.
// User-created tickets and unrelated edits are never renamed.
const sampleCustomers = {
  'DF-1041': {
    names: ['Nika Beridze', 'Jonas Kahnwald'],
    name: 'Jonas Kahnwald', short: 'Jonas K.',
  },
  'DF-1040': {
    names: ['Mariam Tsiklauri', 'Martha Nielsen'],
    name: 'Martha Nielsen', short: 'Martha N.',
  },
  'DF-1039': {
    names: ['Alex Dadiani', 'Charlotte Doppler', 'Dana Scully', 'Peggy Blumquist'],
    name: 'Peggy Blumquist', short: 'Peggy B.',
  },
  'DF-1038': {
    names: ['Salome Gelashvili', 'Claudia Tiedemann', 'Elliot Alderson', 'Lumen Pierce'],
    name: 'Lumen Pierce', short: 'Lumen P.',
  },
};

const ticketNumber = (id) => {
  const match = /^DF-(\d+)$/.exec(String(id));
  return match ? Number(match[1]) : 0;
};
const maximumTicketNumber = (tickets) => tickets.reduce(
  (max, ticket) => Math.max(max, ticketNumber(ticket.id)), FIRST_DEMO_MAX
);
function readCounter() {
  try {
    const n = Number(localStorage.getItem(COUNTER_KEY));
    return Number.isSafeInteger(n) && n >= FIRST_DEMO_MAX ? n : FIRST_DEMO_MAX;
  } catch { return FIRST_DEMO_MAX; }
}
function reserveHighWater(tickets) {
  sessionHighWater = Math.max(sessionHighWater, readCounter(), maximumTicketNumber(tickets));
  try { localStorage.setItem(COUNTER_KEY, String(sessionHighWater)); }
  catch (error) { console.warn('Could not persist ticket counter:', error); }
}

function migrateTickets(tickets) {
  return tickets.map(ticket => {
    const sample = sampleCustomers[ticket.id];
    const knownSample = sample && sample.names.includes(ticket.customer);
    return {
      ...ticket,
      priority: ticket.priority === 'Normal' ? 'Medium' : ticket.priority,
      ...(knownSample ? {
        customer: sample.name,
        customerShort: sample.short,
        comments: (ticket.comments || []).map(comment =>
          sample.names.includes(comment.author) ? { ...comment, author: sample.name } : comment
        ),
      } : {}),
    };
  });
}

/** Frontend demo storage only. Server/database must allocate final IDs. */
export function loadTickets() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const tickets = migrateTickets(parsed);
        reserveHighWater(tickets);
        return tickets;
      }
    }
  } catch (error) { console.warn('Could not restore local tickets:', error); }
  const initial = clone(seedTickets);
  reserveHighWater(initial);
  return initial;
}
export function saveTickets(tickets) {
  reserveHighWater(tickets); // Never decrease the counter when tickets are deleted.
  try { localStorage.setItem(KEY, JSON.stringify(tickets)); }
  catch (error) { console.warn('Could not save local tickets:', error); }
}
export function makeTicketId(tickets) {
  reserveHighWater(tickets);
  sessionHighWater += 1;
  try { localStorage.setItem(COUNTER_KEY, String(sessionHighWater)); }
  catch (error) { console.warn('Could not persist ticket counter:', error); }
  return `DF-${sessionHighWater}`;
}
export function resetDemoTickets() {
  try { localStorage.removeItem(KEY); }
  catch (error) { console.warn('Could not reset local tickets:', error); }
  // Important: intentionally keep COUNTER_KEY so deleted IDs are never reused.
  const tickets = clone(seedTickets);
  reserveHighWater(tickets);
  return tickets;
}
