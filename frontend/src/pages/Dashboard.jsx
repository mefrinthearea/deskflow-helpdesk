import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Plus, RotateCcw, Search } from 'lucide-react';
import { useDeskFlow } from '../context';
import Badge from '../components/Badge';
import FilterSelect from '../components/FilterSelect';
import PageHeading from '../components/PageHeading';
import { priorities, statuses } from '../data/options';
import { filterAndSortTickets, timeAgo } from '../utils/tickets';

function EmptyResults({ mine, hasFilters, clearFilters, canCreate }) {
  const noRequests = mine && !hasFilters;

  return (
    <div className="no-results">
      <h3>{noRequests ? 'No requests submitted yet' : 'No matching tickets'}</h3>
      <p>
        {noRequests
          ? 'Create your first support request to see it here.'
          : 'Try a different query or remove a filter.'}
      </p>
      {hasFilters ? (
        <button type="button" className="primary-button" onClick={clearFilters}>
          <RotateCcw size={15} /> Clear filters
        </button>
      ) : canCreate ? (
        <Link to="/tickets/new" className="primary-button">
          <Plus size={15} /> Create a ticket
        </Link>
      ) : null}
    </div>
  );
}

function TicketTable({ tickets, selectedId, selectTicket }) {
  return (
    <div className="table-scroller">
      <table className="ticket-table">
        <colgroup>
          <col style={{ width: '52%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '17%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>REQUEST</th>
            <th>PRIORITY</th>
            <th>STATUS</th>
            <th>UPDATED</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className={selectedId === ticket.id ? 'selected' : ''}
              onClick={() => selectTicket(ticket.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectTicket(ticket.id);
                }
              }}
              tabIndex={0}
              aria-selected={selectedId === ticket.id}
            >
              <td>
                <div className="request-cell">
                  <span className="ticket-ref">{ticket.id}</span>
                  <div>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="ticket-subject"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {ticket.subject}
                    </Link>
                    <div className="ticket-subtitle">
                      {ticket.category.replace(' access', '')} &nbsp;/&nbsp; {ticket.customerShort}
                    </div>
                  </div>
                </div>
              </td>
              <td><Badge value={ticket.priority} kind="priority" /></td>
              <td><Badge value={ticket.status} /></td>
              <td className="updated-cell">{timeAgo(ticket.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TicketPreview({ ticket }) {
  const lastMessage = ticket?.comments?.at(-1)?.text || ticket?.description || '';

  return (
    <aside className="ticket-preview">
      <div className="section-label">SELECTED TICKET</div>
      {ticket ? (
        <>
          <div className="preview-ref">{ticket.id}</div>
          <div className="preview-subject">{ticket.subject}</div>
          <div className="preview-metadata">
            <div><span>Customer</span><strong>{ticket.customerShort}</strong></div>
            <div><span>Assigned</span><strong>{ticket.assignee}</strong></div>
          </div>
          <div className="preview-latest">
            <div className="section-label">LATEST MESSAGE</div>
            <p>{lastMessage}</p>
          </div>
          <Link className="primary-button open-ticket" to={`/tickets/${ticket.id}`}>
            Open ticket <ArrowRight size={16} />
          </Link>
        </>
      ) : (
        <div className="preview-blank">
          No ticket selected. Adjust your filters or create a request.
        </div>
      )}
    </aside>
  );
}

export default function Dashboard({ mine = false }) {
  const { tickets, user, error } = useDeskFlow();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [status, setStatus] = useState(params.get('status') || '');
  const [priority, setPriority] = useState(params.get('priority') || '');
  const [sort, setSort] = useState('recent');
  const [selectedId, setSelectedId] = useState(null);

  // Reflect filters in the address bar so filtered views can be refreshed/shared.
  useEffect(() => {
    const next = {};
    if (query) next.q = query;
    if (status) next.status = status;
    if (priority) next.priority = priority;
    setParams(next, { replace: true });
  }, [query, status, priority, setParams]);

  const visible = useMemo(() => filterAndSortTickets(tickets, {
    mine,
    userId: user?.id,
    query,
    status,
    priority,
    sort,
  }), [tickets, mine, user?.id, query, status, priority, sort]);

  // The previously selected ticket may be filtered out or deleted.
  const selected = visible.find((ticket) => ticket.id === selectedId) || visible[0];
  const hasFilters = Boolean(query.trim() || status || priority);

  function clearFilters() {
    setQuery('');
    setStatus('');
    setPriority('');
    setSort('recent');
  }

  return (
    <>
      {error && <p role="alert" className="auth-error">{error}</p>}
      <PageHeading
        eyebrow={mine ? 'SUPPORT / MY REQUESTS' : 'SUPPORT / WORKSPACE'}
        title={mine ? 'My requests' : 'Ticket workspace'}
        description={mine
          ? 'Your submitted support requests.'
          : 'Review requests, reply to customers and manage assignments.'}
        action={user?.role === 'customer' ? (
          <Link to="/tickets/new" className="primary-button new-ticket">
            <Plus size={17} /> New ticket
          </Link>
        ) : null}
      />

      <div className="toolbar">
        <label className="search-field">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search tickets</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tickets, customers, or reference numbers"
          />
        </label>
        <FilterSelect
          label="Ticket status"
          value={status}
          onChange={setStatus}
          options={[{ value: '', label: 'All statuses' }, ...statuses.map((item) => ({ value: item, label: item }))]}
        />
        <FilterSelect
          label="Priority"
          value={priority}
          onChange={setPriority}
          options={[{ value: '', label: 'Priority' }, ...priorities.map((item) => ({ value: item, label: item }))]}
        />
        <FilterSelect
          label="Sort tickets"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'recent', label: 'Updated recently' },
            { value: 'oldest', label: 'Updated oldest' },
            { value: 'priority', label: 'Highest priority' },
          ]}
        />
      </div>

      <div className="ticket-layout">
        <div className="ticket-grid-panel">
          <TicketTable tickets={visible} selectedId={selected?.id} selectTicket={setSelectedId} />
          {!visible.length && (
            <EmptyResults mine={mine} hasFilters={hasFilters} clearFilters={clearFilters} canCreate={user?.role === 'customer'} />
          )}
        </div>
        <TicketPreview ticket={selected} />
      </div>
    </>
  );
}
