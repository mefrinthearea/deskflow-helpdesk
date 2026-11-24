import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Send, Trash2 } from 'lucide-react';
import Badge from '../components/Badge';
import PageHeading from '../components/PageHeading';
import { useDeskFlow } from '../context';
import { statuses } from '../data/options';
import { formatDate, timeAgo } from '../utils/tickets';

function initials(name) { return (name || '?').split(' ').slice(0, 2).map((x) => x[0]).join('').toUpperCase(); }

function ConversationMessage({ comment, user, onEdit, onDelete }) {
  const canEdit = comment.userId === user?.id;
  const canDelete = canEdit || user?.role === 'agent';
  return (
    <article className="message">
      <div className="message-avatar">{initials(comment.author)}</div>
      <div className="message-body">
        <h3>{comment.author}</h3><time>{formatDate(comment.createdAt)}</time><p>{comment.text}</p>
        {comment.id !== 'initial' && (canEdit || canDelete) && (
          <div className="comment-actions">
            {canEdit && <button type="button" onClick={() => onEdit(comment)}>Edit</button>}
            {canDelete && <button type="button" onClick={() => onDelete(comment)}>Delete</button>}
          </div>
        )}
      </div>
    </article>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, user, loadTicketDetail, addReply, editComment, deleteComment, deleteTicket, updateTicket } = useDeskFlow();
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ticket = tickets.find((item) => item.id === id);
  const isAgent = user?.role === 'agent';
  const canEditTicket = !isAgent && ticket?.status === 'Open' && ticket?.ownerId === user?.id;

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadTicketDetail(id).catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, loadTicketDetail]);

  async function run(action) {
    setBusy(true); setError('');
    try { await action(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  if (loading && !ticket) return <div className="missing" role="status">Loading ticket…</div>;
  if (!ticket || error && !ticket) return (
    <div className="missing"><h1>Ticket unavailable</h1><p>{error || 'This ticket may have been deleted.'}</p>
      <Link className="primary-button" to="/">Back to tickets</Link></div>
  );

  const messages = [{
    id: 'initial',
    author: ticket.customer,
    text: ticket.description,
    createdAt: ticket.createdAt,
  }, ...ticket.comments];

  return (
    <>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <PageHeading
        eyebrow={<><Link className="breadcrumb-link" to="/">TICKETS</Link> / {ticket.id}</>}
        title={ticket.subject}
        description={`Opened by ${ticket.customerShort}   /   ${ticket.category}   /   ${formatDate(ticket.createdAt)}`}
        action={canEditTicket ? <Link to={`/tickets/${id}/edit`} className="primary-button"><Pencil size={16}/> Edit ticket</Link> : null}
      />
      <div className="detail-layout">
        <section className="conversation-panel glass-panel">
          <div className="section-label conversation-heading">CONVERSATION</div>
          <div className="conversation-list">
            {messages.map((comment) => <ConversationMessage key={comment.id} comment={comment} user={user}
              onEdit={(c) => {
                const next = window.prompt('Edit comment', c.text);
                if (next !== null && next.trim()) run(() => editComment(id, c.id, next));
              }}
              onDelete={(c) => {
                if (window.confirm('Delete this comment?')) run(() => deleteComment(id, c.id));
              }} />)}
          </div>
          <form className="reply-form" onSubmit={(event) => {
            event.preventDefault();
            if (!reply.trim()) return;
            run(async () => { await addReply(id, reply); setReply(''); });
          }}>
            <label className="sr-only" htmlFor="ticket-reply">Reply message</label>
            <textarea id="ticket-reply" value={reply} onChange={(event) => setReply(event.target.value)}
              placeholder={`Write a reply to ${ticket.customerShort}...`} required rows={3} maxLength={1000}/>
            <div className="composer-bottom"><span>Reply to this ticket</span>
              <button type="submit" className="primary-button" disabled={busy || !reply.trim()}><Send size={15}/> Send reply</button>
            </div>
          </form>
        </section>
        <aside className="detail-metadata glass-panel">
          <div className="section-label">TICKET DETAILS</div>
          <dl>
            <div><dt>Status</dt><dd>{isAgent ? (
              <select aria-label="Update ticket status" value={ticket.status} disabled={busy}
                onChange={(event) => run(async () => { await updateTicket(id, { status: event.target.value }); await loadTicketDetail(id); })}>
                {statuses.map((value) => <option key={value}>{value}</option>)}
              </select>
            ) : <Badge value={ticket.status}/>}</dd></div>
            <div><dt>Priority</dt><dd><Badge value={ticket.priority} kind="priority"/></dd></div>
            <div><dt>Category</dt><dd>{ticket.category}</dd></div>
            <div><dt>Created</dt><dd>{formatDate(ticket.createdAt)}</dd></div>
            <div><dt>Updated</dt><dd>{timeAgo(ticket.updatedAt)} ago</dd></div>
          </dl>
          {isAgent && <button className="delete-text-button" type="button" disabled={busy}
            onClick={() => setConfirmDelete(true)}><Trash2 size={15}/> Delete ticket</button>}
        </aside>
      </div>
      {confirmDelete && isAgent && <div className="dialog-backdrop" onClick={() => setConfirmDelete(false)}>
        <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"
          onClick={(event) => event.stopPropagation()}>
          <div className="section-label">CONFIRM DELETE</div><h2 id="confirm-title">Delete ticket {id}?</h2>
          <p>This action cannot be undone.</p>
          <div className="dialog-actions">
            <button className="secondary-button" onClick={() => setConfirmDelete(false)}>Cancel</button>
            <button className="danger-button" disabled={busy} onClick={() => run(async () => {
              await deleteTicket(id); navigate('/');
            })}>Delete ticket</button>
          </div>
        </div>
      </div>}
      <Link className="back-link" to="/"><ArrowLeft size={15}/> Back to workspace</Link>
    </>
  );
}
