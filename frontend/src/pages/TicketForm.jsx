import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeading from '../components/PageHeading';
import { useDeskFlow } from '../context';
import { categories, priorities } from '../data/options';

function validateTicket({ subject, description }) {
  const errors = {};
  if (!subject.trim()) {
    errors.subject = 'Subject is required.';
  } else if (subject.trim().length > 100) {
    errors.subject = 'Keep the subject under 100 characters.';
  }
  if (!description.trim()) {
    errors.description = 'Please describe the issue.';
  }
  return errors;
}

export default function TicketForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { tickets, user, loadTicketDetail, createTicket, updateTicket } = useDeskFlow();
  const ticket = tickets.find((item) => item.id === id);

  const [subject, setSubject] = useState(ticket?.subject || '');
  const [category, setCategory] = useState(ticket?.category || 'Account access');
  const [priority, setPriority] = useState(ticket?.priority || 'Medium');
  const [description, setDescription] = useState(ticket?.description || '');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!editing) return;
    let active = true;
    loadTicketDetail(id).catch((err) => { if (active) setServerError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [editing, id, loadTicketDetail]);

  useEffect(() => {
    if (!ticket || !editing) return;
    setSubject(ticket.subject);
    setCategory(ticket.category);
    setPriority(ticket.priority);
    setDescription(ticket.description);
  }, [ticket?.id, editing, loading]);
  const [errors, setErrors] = useState({});

  if (user?.role !== 'customer') {
    return <div className="missing"><h1>Customer access only</h1><Link to="/" className="primary-button">Back to tickets</Link></div>;
  }

  if (editing && loading && !ticket) return <div className="missing">Loading ticket…</div>;
  if (editing && (!ticket || ticket.ownerId !== user.id || ticket.status !== 'Open')) {
    return (
      <div className="missing">
        <h1>Ticket not found</h1>
        <Link to="/" className="primary-button">Back to tickets</Link>
      </div>
    );
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateTicket({ subject, description });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input = {
      subject: subject.trim(),
      category,
      priority,
      description: description.trim(),
    };

    setBusy(true);
    setServerError('');
    try {
      if (editing) {
        await updateTicket(id, input);
        navigate(`/tickets/${id}`);
      } else {
        const newId = await createTicket(input);
        navigate(`/tickets/${newId}`);
      }
    } catch (error) { setServerError(error.message); }
    finally { setBusy(false); }
  }

  return (
    <>
      <PageHeading
        eyebrow={(
          <>
            <Link className="breadcrumb-link" to="/">TICKETS</Link>
            {' / '}{editing ? `EDIT ${id}` : 'NEW REQUEST'}
          </>
        )}
        title={editing ? 'Edit ticket' : 'Create a ticket'}
        description={editing
          ? 'Update the ticket details and keep the request accurate.'
          : 'Describe your issue clearly so the right agent can help.'}
      />

      <div className="form-layout">
        <section className="request-panel glass-panel">
          <form onSubmit={submit} noValidate>
            {serverError && <p role="alert" className="auth-error">{serverError}</p>}
            <div className="section-label">REQUEST DETAILS</div>

            <label className="field">
              <span>SUBJECT</span>
              <input
                value={subject}
                maxLength={100}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Briefly describe your issue"
                aria-invalid={Boolean(errors.subject)}
              />
              {errors.subject && <small role="alert">{errors.subject}</small>}
            </label>

            <div className="field-pair">
              <label className="field">
                <span>CATEGORY</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="field">
                <span>PRIORITY</span>
                <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                  {priorities.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>


            <label className="field description-field">
              <span>DESCRIPTION</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Explain what happened and any steps you have tried..."
                rows={4}
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description && <small role="alert">{errors.description}</small>}
            </label>

            <div className="form-actions">
              <Link to={editing ? `/tickets/${id}` : '/'} className="secondary-button">Cancel</Link>
              <button type="submit" className="primary-button" disabled={busy}>
                {editing ? 'Save changes' : 'Create ticket'}
              </button>
            </div>
          </form>
        </section>

        <aside className="guidance-panel glass-panel">
          <div className="section-label">BEFORE YOU SUBMIT</div>
          <h2>Help us resolve the issue<br />with the right details.</h2>
          <div className="guide-line">
            <strong>01</strong><span>Choose the category that best matches the issue.</span>
          </div>
          <div className="guide-line">
            <strong>02</strong><span>Include useful details and any steps you've already tried.</span>
          </div>
          <div className="guide-line">
            <strong>03</strong><span>Set a priority that reflects the urgency.</span>
          </div>
          <p className="guide-note">
            Your requests are securely saved to the DeskFlow database.
          </p>
        </aside>
      </div>
    </>
  );
}
