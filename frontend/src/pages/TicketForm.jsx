import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeading from '../components/PageHeading';
import { useDeskFlow } from '../context';
import { categories, priorities, statuses } from '../data/mockTickets';

export default function TicketForm() {
  const { id } = useParams(), editing = Boolean(id); const nav = useNavigate();
  const { tickets, createTicket, updateTicket } = useDeskFlow();
  const ticket = tickets.find(t => t.id === id);
  const [subject, setSubject] = useState(ticket?.subject || '');
  const [category, setCategory] = useState(ticket?.category || 'Account access');
  const [priority, setPriority] = useState(ticket?.priority || 'Medium');
  const [description, setDescription] = useState(ticket?.description || '');
  const [status, setStatus] = useState(ticket?.status || 'Open');
  const [errors, setErrors] = useState({});
  if (editing && !ticket) return <div className="missing"><h1>Ticket not found</h1><Link to="/" className="primary-button">Back to tickets</Link></div>;
  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!subject.trim()) nextErrors.subject = 'Subject is required.';
    if (subject.trim().length > 160) nextErrors.subject = 'Keep the subject under 160 characters.';
    if (!description.trim()) nextErrors.description = 'Please describe the issue.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (editing) { updateTicket(id,{subject:subject.trim(),category,priority,status,description:description.trim()}); nav(`/tickets/${id}`); }
    else { const newId = createTicket({ subject, category, priority, description }); nav(`/tickets/${newId}`); }
  }
  return <>
    <PageHeading eyebrow={<><Link className="breadcrumb-link" to="/">TICKETS</Link> / {editing ? `EDIT ${id}` : 'NEW REQUEST'}</>}
      title={editing ? 'Edit ticket' : 'Create a ticket'}
      description={editing ? 'Update the ticket details and keep the request accurate.' : 'Describe your issue clearly so the right agent can help.'}/>
    <div className="form-layout"><section className="request-panel glass-panel">
      <form onSubmit={submit} noValidate><div className="section-label">REQUEST DETAILS</div>
        <label className="field"><span>SUBJECT</span><input value={subject} maxLength={161} onChange={e=>setSubject(e.target.value)} placeholder="Briefly describe your issue" aria-invalid={Boolean(errors.subject)} />{errors.subject && <small role="alert">{errors.subject}</small>}</label>
        <div className="field-pair"><label className="field"><span>CATEGORY</span><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
          <label className="field"><span>PRIORITY</span><select value={priority} onChange={e=>setPriority(e.target.value)}>{priorities.map(p=><option key={p}>{p}</option>)}</select></label></div>
        {editing && <label className="field status-field"><span>STATUS</span><select value={status} onChange={e=>setStatus(e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label>}
        <label className="field description-field"><span>DESCRIPTION</span><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Explain what happened and any steps you have tried..." rows={4} aria-invalid={Boolean(errors.description)} />{errors.description && <small role="alert">{errors.description}</small>}</label>
        <div className="form-actions"><Link to={editing ? `/tickets/${id}` : '/'} className="secondary-button">Cancel</Link><button type="submit" className="primary-button">{editing ? 'Save changes' : 'Create ticket'}</button></div>
      </form>
    </section><aside className="guidance-panel glass-panel"><div className="section-label">BEFORE YOU SUBMIT</div><h2>Help us resolve the issue<br/>with the right details.</h2>
      <div className="guide-line"><strong>01</strong><span>Choose the category that best matches the issue.</span></div><div className="guide-line"><strong>02</strong><span>Include useful details and any steps you've already tried.</span></div><div className="guide-line"><strong>03</strong><span>Set a priority that reflects the urgency.</span></div>
      <p className="guide-note">Your changes are stored in this browser until the backend is connected.</p></aside></div>
  </>;
}
