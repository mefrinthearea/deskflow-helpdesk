import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadTickets, makeTicketId, saveTickets, resetDemoTickets } from './services/ticketStore';

const Context = createContext(null);
export function DeskFlowProvider({ children }) {
  const [tickets, setTickets] = useState(loadTickets);
  const [theme, setTheme] = useState(() => localStorage.getItem('deskflow.theme') === 'dark' ? 'dark' : 'light');
  const [toast, setToast] = useState('');
  useEffect(() => saveTickets(tickets), [tickets]);
  useEffect(() => { localStorage.setItem('deskflow.theme', theme); }, [theme]);
  const toggleTheme = useCallback(() => setTheme(x => x === 'light' ? 'dark' : 'light'), []);
  const notify = useCallback((message) => setToast(message), []);
  const clearToast = useCallback(() => setToast(''), []);
  const createTicket = useCallback((input) => {
    const id = makeTicketId(tickets);
    const time = new Date().toISOString();
    const newTicket = { id, subject: input.subject.trim(), description: input.description.trim(), category: input.category,
      priority: input.priority, status: 'Open', customer: 'Demo Customer', customerShort: 'Demo Customer',
      assignee: 'Unassigned', createdAt: time, updatedAt: time, comments: [] };
    setTickets(current => [newTicket, ...current]);
    notify(`Ticket ${id} created`);
    return id;
  }, [tickets, notify]);
  const updateTicket = useCallback((id, changes) => {
    setTickets(current => current.map(ticket => ticket.id === id ? { ...ticket, ...changes, updatedAt: new Date().toISOString() } : ticket));
    notify(`Ticket ${id} updated`);
  }, [notify]);
  const deleteTicket = useCallback((id) => { setTickets(current => current.filter(t => t.id !== id)); notify(`Ticket ${id} deleted`); }, [notify]);
  const addReply = useCallback((id, text) => {
    setTickets(current => current.map(t => t.id === id ? {
      ...t, updatedAt: new Date().toISOString(),
      comments: [...t.comments, { id: globalThis.crypto?.randomUUID?.() || `reply-${Date.now()}`, author: 'Support Team', text: text.trim(), createdAt: new Date().toISOString() }],
    } : t));
    notify('Reply added to this demo ticket');
  }, [notify]);
  const reset = useCallback(() => { setTickets(resetDemoTickets()); notify('Demo tickets restored'); }, [notify]);
  const value = useMemo(() => ({ tickets, theme, toggleTheme, createTicket, updateTicket, deleteTicket, addReply, reset, notify }),
    [tickets, theme, toggleTheme, createTicket, updateTicket, deleteTicket, addReply, reset, notify]);
  return <Context.Provider value={value}>{children}{toast && <div className="toast" role="status">{toast}<button onClick={clearToast} aria-label="Dismiss notification">×</button></div>}</Context.Provider>;
}
export function useDeskFlow() { const context = useContext(Context); if (!context) throw new Error('DeskFlowProvider is missing'); return context; }
