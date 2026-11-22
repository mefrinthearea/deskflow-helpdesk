import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, ChevronDown, ArrowRight, RotateCcw } from 'lucide-react';
import { useDeskFlow } from '../context';
import Badge from '../components/Badge';
import PageHeading from '../components/PageHeading';
import { priorities, statuses } from '../data/mockTickets';

export const timeAgo = (date) => {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min`;
  if (diff < 1440) return `${Math.floor(diff / 60)} h`;
  if (diff < 2880) return 'Yesterday';
  return `${Math.floor(diff / 1440)} d`;
};

function FilterSelect({ label, value, onChange, options }) {
  return <label className="filter-select"><span className="sr-only">{label}</span>
    <select value={value} onChange={event => onChange(event.target.value)} aria-label={label}>
      {options.map(o => <option value={o.value} key={o.value}>{o.label}</option>)}
    </select><ChevronDown size={15} aria-hidden="true" /></label>;
}

export default function Dashboard({ mine = false }) {
  const { tickets } = useDeskFlow();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [status, setStatus] = useState(params.get('status') || '');
  const [priority, setPriority] = useState(params.get('priority') || '');
  const [sort, setSort] = useState('recent');
  const [selectedId, setSelectedId] = useState('DF-1042');
  useEffect(() => { const next = {}; if (query) next.q = query; if (status) next.status = status; if (priority) next.priority = priority; setParams(next, { replace: true }); }, [query, status, priority, setParams]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const value = tickets.filter(t => (!mine || t.customer === 'Demo Customer') && (!q || [t.id, t.subject, t.customer, t.category, t.description].some(x => String(x).toLowerCase().includes(q))) && (!status || t.status === status) && (!priority || t.priority === priority));
    return value.sort((a, b) => sort === 'oldest' ? new Date(a.updatedAt) - new Date(b.updatedAt) : sort === 'priority' ? ['Urgent', 'High', 'Medium', 'Low'].indexOf(a.priority) - ['Urgent', 'High', 'Medium', 'Low'].indexOf(b.priority) : new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [tickets, query, status, priority, sort, mine]);
  const selected = visible.find(t => t.id === selectedId) || visible[0];
  function clearFilters() { setQuery(''); setStatus(''); setPriority(''); setSort('recent'); }
  const lastMessage = selected?.comments?.at(-1)?.text || selected?.description || '';
  const hasFilters = Boolean(query.trim() || status || priority);
  return <>
    <PageHeading eyebrow={mine ? 'SUPPORT / MY REQUESTS' : 'SUPPORT / WORKSPACE'} title={mine ? 'My requests' : 'Ticket workspace'}
      description={mine ? 'Your submitted requests in this frontend preview.' : 'Review requests, reply to customers and manage assignments.'}
      action={<Link to="/tickets/new" className="primary-button new-ticket"><Plus size={17}/>New ticket</Link>}/>
    <div className="toolbar">
      <label className="search-field"><Search size={17} aria-hidden="true"/><span className="sr-only">Search tickets</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tickets, customers, or reference numbers" /></label>
      <FilterSelect label="Ticket status" value={status} onChange={setStatus} options={[{ value: '', label: 'All statuses' }, ...statuses.map(x => ({ value: x, label: x }))]}/>
      <FilterSelect label="Priority" value={priority} onChange={setPriority} options={[{ value: '', label: 'Priority' }, ...priorities.map(x => ({ value: x, label: x }))]}/>
      <FilterSelect label="Sort tickets" value={sort} onChange={setSort} options={[{ value: 'recent', label: 'Updated recently' }, { value: 'oldest', label: 'Updated oldest' }, { value: 'priority', label: 'Highest priority' }]}/>
    </div>
    <div className="ticket-layout">
      <div className="ticket-grid-panel">
        <div className="table-scroller">
          <table className="ticket-table"><colgroup><col style={{width:'52%'}}/><col style={{width:'15%'}}/><col style={{width:'16%'}}/><col style={{width:'17%'}}/></colgroup>
            <thead><tr><th>REQUEST</th><th>PRIORITY</th><th>STATUS</th><th>UPDATED</th></tr></thead>
            <tbody>{visible.map(t => <tr key={t.id} className={selected?.id === t.id ? 'selected' : ''} onClick={() => setSelectedId(t.id)} onKeyDown={e => {if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelectedId(t.id)}}} tabIndex={0} aria-selected={selected?.id === t.id}>
              <td><div className="request-cell"><span className="ticket-ref">{t.id}</span><div><Link to={`/tickets/${t.id}`} className="ticket-subject" onClick={e=>e.stopPropagation()}>{t.subject}</Link><div className="ticket-subtitle">{t.category.replace(' access','')} &nbsp;/&nbsp; {t.customerShort}</div></div></div></td>
              <td><Badge value={t.priority} kind="priority" /></td><td><Badge value={t.status}/></td><td className="updated-cell">{timeAgo(t.updatedAt)}</td></tr>)}</tbody>
          </table>
        </div>
        {!visible.length && <div className="no-results"><h3>{mine && !hasFilters ? 'No requests submitted yet' : 'No matching tickets'}</h3><p>{mine && !hasFilters ? 'Create your first support request to see it here.' : 'Try a different query or remove a filter.'}</p>{hasFilters ? <button className="primary-button" onClick={clearFilters}><RotateCcw size={15}/>Clear filters</button> : <Link to="/tickets/new" className="primary-button"><Plus size={15}/>Create a ticket</Link>}</div>}
      </div>
      <aside className="ticket-preview">
        <div className="section-label">SELECTED TICKET</div>
        {selected ? <><div className="preview-ref">{selected.id}</div><div className="preview-subject">{selected.subject}</div>
          <div className="preview-metadata"><div><span>Customer</span><strong>{selected.customerShort}</strong></div><div><span>Assigned</span><strong>{selected.assignee}</strong></div></div>
          <div className="preview-latest"><div className="section-label">LATEST MESSAGE</div><p>{lastMessage}</p></div>
          <Link className="primary-button open-ticket" to={`/tickets/${selected.id}`}>Open ticket <ArrowRight size={16}/></Link></>
          : <div className="preview-blank">No ticket selected. Adjust your filters or create a request.</div>}
      </aside>
    </div>
  </>;
}
