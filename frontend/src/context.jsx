import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { authApi, ticketApi } from './services/api';
import { fromApiTicket, parseTicketId, toApiStatus, toApiTicket } from './services/adapter';

const DeskFlowContext = createContext(null);
const THEME_KEY = 'deskflow.theme';

function readTheme() {
  try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}

/** All shared ticket state comes from Express/SQLite, never demo localStorage. */
export function DeskFlowProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(readTheme);
  const [toast, setToast] = useState('');
  const notify = useCallback((message) => setToast(message), []);
  const clearToast = useCallback(() => setToast(''), []);
  const handleError = useCallback((err) => {
    setError(err.message);
    notify(err.message);
    throw err;
  }, [notify]);

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* theme can be ephemeral */ }
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme((t) => t === 'light' ? 'dark' : 'light'), []);

  const refreshTickets = useCallback(async () => {
    try {
      const list = await ticketApi.list();
      setTickets((current) => list.map((row) => {
        const next = fromApiTicket(row);
        const previous = current.find((ticket) => ticket.id === next.id);
        return previous ? { ...next, comments: previous.comments } : next;
      }));
      setError('');
      return list;
    } catch (err) {
      if (err.status === 401) { setUser(null); setTickets([]); }
      else setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const current = await authApi.me();
        if (!active) return;
        setUser(current);
        const list = await ticketApi.list();
        if (active) setTickets(list.map(fromApiTicket));
      } catch (err) {
        if (active && err.status !== 401) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const current = await authApi.login(email, password);
      setUser(current);
      const list = await ticketApi.list();
      setTickets((current) => list.map((row) => {
        const next = fromApiTicket(row);
        const previous = current.find((ticket) => ticket.id === next.id);
        return previous ? { ...next, comments: previous.comments } : next;
      }));
      setError('');
      return current;
    } catch (err) { return handleError(err); }
  }, [handleError]);

  const register = useCallback(async (name, email, password) => {
    try {
      const current = await authApi.register(name, email, password);
      setUser(current);
      setTickets([]);
      setError('');
      return current;
    } catch (err) { return handleError(err); }
  }, [handleError]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); }
    catch (err) { return handleError(err); }
    setUser(null);
    setTickets([]);
    notify('Signed out');
  }, [handleError, notify]);

  const loadTicketDetail = useCallback(async (id) => {
    try {
      const result = fromApiTicket(await ticketApi.get(parseTicketId(id)));
      setTickets((current) => current.some((t) => t.id === id)
        ? current.map((t) => t.id === id ? result : t)
        : [result, ...current]);
      return result;
    } catch (err) { return handleError(err); }
  }, [handleError]);

  const createTicket = useCallback(async (input) => {
    try {
      const created = await ticketApi.create(toApiTicket(input));
      await refreshTickets();
      const id = `DF-${String(created.id).padStart(4, '0')}`;
      notify(`Ticket ${id} created`);
      return id;
    } catch (err) { return handleError(err); }
  }, [handleError, notify, refreshTickets]);

  const updateTicket = useCallback(async (id, changes) => {
    try {
      const payload = user?.role === 'agent'
        ? { status: toApiStatus(changes.status) }
        : toApiTicket(changes);
      await ticketApi.update(parseTicketId(id), payload);
      await refreshTickets();
      notify(`Ticket ${id} updated`);
    } catch (err) { return handleError(err); }
  }, [user, refreshTickets, handleError, notify]);

  const deleteTicket = useCallback(async (id) => {
    try {
      await ticketApi.remove(parseTicketId(id));
      setTickets((current) => current.filter((t) => t.id !== id));
      notify(`Ticket ${id} deleted`);
    } catch (err) { return handleError(err); }
  }, [handleError, notify]);

  const addReply = useCallback(async (id, message) => {
    try {
      await ticketApi.reply(parseTicketId(id), message.trim());
      await loadTicketDetail(id);
      notify('Reply posted');
    } catch (err) { return handleError(err); }
  }, [loadTicketDetail, handleError, notify]);

  const editComment = useCallback(async (id, commentId, text) => {
    try {
      await ticketApi.editComment(commentId, text.trim());
      await loadTicketDetail(id);
      notify('Comment updated');
    } catch (err) { return handleError(err); }
  }, [loadTicketDetail, handleError, notify]);

  const deleteComment = useCallback(async (id, commentId) => {
    try {
      await ticketApi.deleteComment(commentId);
      await loadTicketDetail(id);
      notify('Comment deleted');
    } catch (err) { return handleError(err); }
  }, [loadTicketDetail, handleError, notify]);

  const value = useMemo(() => ({
    tickets, user, loading, error, theme, toggleTheme, login, register, logout,
    refreshTickets, loadTicketDetail, createTicket, updateTicket, deleteTicket,
    addReply, editComment, deleteComment, notify,
  }), [tickets, user, loading, error, theme, toggleTheme, login, register, logout,
      refreshTickets, loadTicketDetail, createTicket, updateTicket, deleteTicket,
      addReply, editComment, deleteComment, notify]);

  return (
    <DeskFlowContext.Provider value={value}>
      {children}
      {toast && <div className="toast" role="status">{toast}<button type="button" onClick={clearToast} aria-label="Dismiss notification">×</button></div>}
    </DeskFlowContext.Provider>
  );
}

export function useDeskFlow() {
  const value = useContext(DeskFlowContext);
  if (!value) throw new Error('DeskFlowProvider is missing');
  return value;
}
