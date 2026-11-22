import { Link } from 'react-router-dom';
import Badge from '../components/Badge';
import PageHeading from '../components/PageHeading';
import { useDeskFlow } from '../context';
import { timeAgo } from '../utils/tickets';

export default function Activity() {
  const { tickets } = useDeskFlow();
  const latest = [...tickets].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <>
      <PageHeading
        eyebrow="SUPPORT / ACTIVITY"
        title="Activity"
        description="Your most recently created support tickets."
      />
      <section className="activity-panel glass-panel">
        <div className="section-label">RECENT UPDATES</div>
        {latest.map((ticket) => (
          <Link className="activity-row" key={ticket.id} to={`/tickets/${ticket.id}`}>
            <div><strong>{ticket.id}</strong><span>{ticket.subject}</span></div>
            <Badge value={ticket.status} />
            <time>{timeAgo(ticket.updatedAt)}</time>
          </Link>
        ))}
        {!latest.length && <div className="no-results"><h3>No activity yet</h3></div>}
      </section>
    </>
  );
}
