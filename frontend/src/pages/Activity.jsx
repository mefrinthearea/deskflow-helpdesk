import { Link } from 'react-router-dom';
import PageHeading from '../components/PageHeading';
import { useDeskFlow } from '../context';
import Badge from '../components/Badge';
import { timeAgo } from './Dashboard';
export default function Activity() {
  const { tickets } = useDeskFlow();
  return <><PageHeading eyebrow="SUPPORT / ACTIVITY" title="Activity" description="Recent ticket updates in this frontend preview."/>
    <section className="activity-panel glass-panel"><div className="section-label">RECENT UPDATES</div>
      {[...tickets].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).map(ticket=><Link className="activity-row" key={ticket.id} to={`/tickets/${ticket.id}`}>
        <div><strong>{ticket.id}</strong><span>{ticket.subject}</span></div><Badge value={ticket.status}/><time>{timeAgo(ticket.updatedAt)}</time>
      </Link>)}
      {!tickets.length && <div className="no-results"><h3>No activity yet</h3></div>}
    </section></>;
}
