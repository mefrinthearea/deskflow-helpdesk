import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeading from '../components/PageHeading';
import { useDeskFlow } from '../context';
import { categories, priorities, statuses } from '../data/mockTickets';

function validateTicket({ subject, description }) {
  const errors = {};
  if (!subject.trim()) {
    errors.subject = 'Subject is required.';
  } else if (subject.trim().length > 160) {
    errors.subject = 'Keep the subject under 160 characters.';
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
  const { tickets, createTicket, updateTicket } = useDeskFlow();
  const ticket = tickets.find((item) => item.id === id);

  const [subject, setSubject] = useState(ticket?.subject || '');
  const [category, setCategory] = useState(ticket?.category || 'Account access');
  const [priority, setPriority] = useState(ticket?.priority || 'Medium');
  const [description, setDescription] = useState(ticket?.description || '');
  const [status, setStatus] = useState(ticket?.status || 'Open');
  const [errors, setErrors] = useState({});

  if (editing && !ticket) {
    return (
      <div className="missing">
        <h1>Ticket not found</h1>
        <Link to="/" className="primary-button">Back to tickets</Link>
      </div>
    );
  }

  function submit(event) {
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

    if (editing) {
      updateTicket(id, { ...input, status });
      navigate(`/tickets/${id}`);
    } else {
      const newId = createTicket(input);
      navigate(`/tickets/${newId}`);
    }
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
            <div className="section-label">REQUEST DETAILS</div>

            <label className="field">
              <span>SUBJECT</span>
              <input
                value={subject}
                maxLength={161}
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

            {editing && (
              <label className="field status-field">
                <span>STATUS</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  {statuses.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            )}

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
              <button type="submit" className="primary-button">
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
            Your changes are stored in this browser until the backend is connected.
          </p>
        </aside>
      </div>
    </>
  );
}
