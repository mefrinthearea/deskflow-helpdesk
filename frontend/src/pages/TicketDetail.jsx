import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Send, Trash2 } from 'lucide-react';
import Badge from '../components/Badge';
import PageHeading from '../components/PageHeading';
import { useDeskFlow } from '../context';
import { timeAgo } from './Dashboard';

function initials(name) { return name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase(); }
const formatDate = (stamp) => new Date(stamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
export default function TicketDetail() {
  const { id } = useParams(); const nav = useNavigate();
  const { tickets, addReply, deleteTicket, updateTicket } = useDeskFlow();
  const [reply, setReply] = useState(''); const [confirmDelete, setConfirmDelete] = useState(false);
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return <div className="missing"><h1>Ticket not found</h1><p>This ticket may have been deleted.</p><Link className="primary-button" to="/">Back to tickets</Link></div>;
  function submitReply(event) { event.preventDefault(); if (!reply.trim()) return; addReply(id, reply); setReply(''); }
  function confirmRemoval() { deleteTicket(id); nav('/'); }
  return <>
    <PageHeading eyebrow={<><Link className="breadcrumb-link" to="/">TICKETS</Link> / {ticket.id}</>}
      title={ticket.subject} description={`Opened by ${ticket.customerShort}   /   ${ticket.category}   /   ${formatDate(ticket.createdAt)}`}
      action={<Link to={`/tickets/${id}/edit`} className="primary-button"><Pencil size={16}/>Edit ticket</Link>}/>
    <div className="detail-layout">
      <section className="conversation-panel glass-panel"><div className="section-label conversation-heading">CONVERSATION</div>
        <div className="conversation-list">
          {(ticket.comments.length ? ticket.comments : [{id:'initial',author:ticket.customer,text:ticket.description,createdAt:ticket.createdAt}]).map(comment =>
            <article className="message" key={comment.id}><div className="message-avatar">{initials(comment.author)}</div><div className="message-body"><h3>{comment.author}</h3><time>{formatDate(comment.createdAt)}</time><p>{comment.text}</p></div></article>)}
        </div>
        <form className="reply-form" onSubmit={submitReply}>
          <label className="sr-only" htmlFor="ticket-reply">Reply message</label><textarea id="ticket-reply" value={reply} onChange={e=>setReply(e.target.value)} placeholder={`Write a reply to ${ticket.customerShort}...`} required rows={3}/>
          <div className="composer-bottom"><span>Public reply</span><button type="submit" className="primary-button" disabled={!reply.trim()}><Send size={15}/>Send reply</button></div>
        </form>
      </section>
      <aside className="detail-metadata glass-panel"><div className="section-label">TICKET DETAILS</div>
        <dl><div><dt>Status</dt><dd><select aria-label="Update ticket status" value={ticket.status} onChange={e=>updateTicket(id,{status:e.target.value})}>{['Open','In progress','Resolved','Closed'].map(v=><option key={v}>{v}</option>)}</select></dd></div>
          <div><dt>Priority</dt><dd><Badge value={ticket.priority} kind="priority"/></dd></div>
          <div><dt>Category</dt><dd>{ticket.category}</dd></div>
          <div><dt>Assigned to</dt><dd>{ticket.assignee}</dd></div>
          <div><dt>Created</dt><dd>{formatDate(ticket.createdAt)}</dd></div>
          <div><dt>Updated</dt><dd>{timeAgo(ticket.updatedAt)} ago</dd></div>
        </dl>
        <button className="delete-text-button" type="button" onClick={()=>setConfirmDelete(true)}><Trash2 size={15}/>Delete ticket</button>
      </aside>
    </div>
    {confirmDelete && <div className="dialog-backdrop" onClick={()=>setConfirmDelete(false)}><div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onClick={e=>e.stopPropagation()}><div className="section-label">CONFIRM DELETE</div><h2 id="confirm-title">Delete ticket {id}?</h2><p>This action cannot be undone.</p><div className="dialog-actions"><button className="secondary-button" onClick={()=>setConfirmDelete(false)}>Cancel</button><button className="danger-button" onClick={confirmRemoval}>Delete ticket</button></div></div></div>}
    <Link className="back-link" to="/"><ArrowLeft size={15}/>Back to workspace</Link>
  </>;
}
