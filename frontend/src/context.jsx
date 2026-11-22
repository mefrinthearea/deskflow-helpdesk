import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  loadTickets,
  makeTicketId,
  resetDemoTickets,
  saveTickets,
} from './services/ticketStore';

const DeskFlowContext = createContext(null);
const THEME_KEY = 'deskflow.theme';

function readTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Temporary frontend data layer. Components call these actions rather than
 * knowing how tickets are stored; the Express API can replace this layer later.
 */
export function DeskFlowProvider({ children }) {
  const [tickets, setTickets] = useState(loadTickets);
  const [theme, setTheme] = useState(readTheme);
  const [toast, setToast] = useState('');

  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.warn('Could not save theme preference:', error);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const notify = useCallback((message) => setToast(message), []);
  const clearToast = useCallback(() => setToast(''), []);

  const createTicket = useCallback((input) => {
    const id = makeTicketId(tickets);
    const timestamp = new Date().toISOString();
    const newTicket = {
      id,
      subject: input.subject.trim(),
      description: input.description.trim(),
      category: input.category,
      priority: input.priority,
      status: 'Open',
      customer: 'Demo Customer',
      customerShort: 'Demo Customer',
      assignee: 'Unassigned',
      createdAt: timestamp,
      updatedAt: timestamp,
      comments: [],
    };

    setTickets((current) => [newTicket, ...current]);
    notify(`Ticket ${id} created`);
    return id;
  }, [tickets, notify]);

  const updateTicket = useCallback((id, changes) => {
    setTickets((current) => current.map((ticket) => (
      ticket.id === id
        ? { ...ticket, ...changes, updatedAt: new Date().toISOString() }
        : ticket
    )));
    notify(`Ticket ${id} updated`);
  }, [notify]);

  const deleteTicket = useCallback((id) => {
    setTickets((current) => current.filter((ticket) => ticket.id !== id));
    notify(`Ticket ${id} deleted`);
  }, [notify]);

  const addReply = useCallback((id, message) => {
    const timestamp = new Date().toISOString();
    const reply = {
      id: globalThis.crypto?.randomUUID?.() || `reply-${Date.now()}`,
      author: 'Support Team',
      text: message.trim(),
      createdAt: timestamp,
    };

    setTickets((current) => current.map((ticket) => (
      ticket.id === id
        ? {
            ...ticket,
            updatedAt: timestamp,
            comments: [...ticket.comments, reply],
          }
        : ticket
    )));
    notify('Reply added to this demo ticket');
  }, [notify]);

  const reset = useCallback(() => {
    setTickets(resetDemoTickets());
    notify('Demo tickets restored');
  }, [notify]);

  const value = useMemo(() => ({
    tickets,
    theme,
    toggleTheme,
    createTicket,
    updateTicket,
    deleteTicket,
    addReply,
    reset,
    notify,
  }), [tickets, theme, toggleTheme, createTicket, updateTicket, deleteTicket, addReply, reset, notify]);

  return (
    <DeskFlowContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button type="button" onClick={clearToast} aria-label="Dismiss notification">×</button>
        </div>
      )}
    </DeskFlowContext.Provider>
  );
}

export function useDeskFlow() {
  const context = useContext(DeskFlowContext);
  if (!context) {
    throw new Error('DeskFlowProvider is missing');
  }
  return context;
}
