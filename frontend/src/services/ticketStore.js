import { seedTickets } from '../data/mockTickets';

// Keep existing keys: changing them would hide users' saved demo tickets.
const TICKETS_KEY = 'deskflow.frontend.demo.tickets.v1';
const COUNTER_KEY = 'deskflow.frontend.demo.highestTicketNumber.v1';
const FIRST_DEMO_MAX = 1042;

const clone = (value) => JSON.parse(JSON.stringify(value));
let sessionHighWater = FIRST_DEMO_MAX;

/**
 * Migrate only known original demo customers, never user-created requests.
 * Old names are retained as aliases so older browser data still upgrades.
 */
const sampleCustomers = {
  'DF-1041': {
    names: ['Nika Beridze', 'Jonas Kahnwald'],
    name: 'Jonas Kahnwald',
    short: 'Jonas K.',
  },
  'DF-1040': {
    names: ['Mariam Tsiklauri', 'Martha Nielsen'],
    name: 'Martha Nielsen',
    short: 'Martha N.',
  },
  'DF-1039': {
    names: ['Alex Dadiani', 'Charlotte Doppler', 'Dana Scully', 'Peggy Blumquist'],
    name: 'Peggy Blumquist',
    short: 'Peggy B.',
  },
  'DF-1038': {
    names: ['Salome Gelashvili', 'Claudia Tiedemann', 'Elliot Alderson', 'Lumen Pierce'],
    name: 'Lumen Pierce',
    short: 'Lumen P.',
  },
};

function ticketNumber(id) {
  const match = /^DF-(\d+)$/.exec(String(id));
  return match ? Number(match[1]) : 0;
}

function maximumTicketNumber(tickets) {
  return tickets.reduce(
    (max, ticket) => Math.max(max, ticketNumber(ticket.id)),
    FIRST_DEMO_MAX,
  );
}

function readCounter() {
  try {
    const stored = Number(localStorage.getItem(COUNTER_KEY));
    return Number.isSafeInteger(stored) && stored >= FIRST_DEMO_MAX
      ? stored
      : FIRST_DEMO_MAX;
  } catch {
    return FIRST_DEMO_MAX;
  }
}

function reserveHighWater(tickets) {
  sessionHighWater = Math.max(
    sessionHighWater,
    readCounter(),
    maximumTicketNumber(tickets),
  );

  try {
    localStorage.setItem(COUNTER_KEY, String(sessionHighWater));
  } catch (error) {
    console.warn('Could not persist ticket counter:', error);
  }
}

function migrateTickets(tickets) {
  return tickets.map((ticket) => {
    const sample = sampleCustomers[ticket.id];
    const knownSample = sample && sample.names.includes(ticket.customer);

    return {
      ...ticket,
      priority: ticket.priority === 'Normal' ? 'Medium' : ticket.priority,
      ...(knownSample ? {
        customer: sample.name,
        customerShort: sample.short,
        comments: (ticket.comments || []).map((comment) => (
          sample.names.includes(comment.author)
            ? { ...comment, author: sample.name }
            : comment
        )),
      } : {}),
    };
  });
}

/** Frontend demo storage only. The SQL backend must allocate authoritative IDs. */
export function loadTickets() {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const tickets = migrateTickets(parsed);
        reserveHighWater(tickets);
        return tickets;
      }
    }
  } catch (error) {
    console.warn('Could not restore local tickets:', error);
  }

  const initial = clone(seedTickets);
  reserveHighWater(initial);
  return initial;
}

export function saveTickets(tickets) {
  // Deletion must never decrease this counter; otherwise IDs could be reused.
  reserveHighWater(tickets);
  try {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  } catch (error) {
    console.warn('Could not save local tickets:', error);
  }
}

export function makeTicketId(tickets) {
  reserveHighWater(tickets);
  sessionHighWater += 1;

  try {
    localStorage.setItem(COUNTER_KEY, String(sessionHighWater));
  } catch (error) {
    console.warn('Could not persist ticket counter:', error);
  }

  return `DF-${sessionHighWater}`;
}

export function resetDemoTickets() {
  try {
    localStorage.removeItem(TICKETS_KEY);
  } catch (error) {
    console.warn('Could not reset local tickets:', error);
  }

  // Intentionally retain the counter even after a demo-data reset.
  const tickets = clone(seedTickets);
  reserveHighWater(tickets);
  return tickets;
}
