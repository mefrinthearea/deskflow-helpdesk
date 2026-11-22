/** Keep database IDs numeric in requests while formatting them for the UI. */
export const displayTicketId = (id) => `DF-${String(id).padStart(4, '0')}`;
export const parseTicketId = (display) => {
  const raw = String(display).replace(/^DF-/i, '');
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('Invalid ticket ID');
  return id;
};

// SQLite CURRENT_TIMESTAMP is UTC, but it arrives without a time-zone suffix.
export const parseSqlDate = (value) => value
  ? (/^\d{4}-\d{2}-\d{2} /.test(value)
      ? value.replace(' ', 'T') + 'Z'
      : value)
  : new Date().toISOString();

export function fromApiTicket(ticket) {
  const name = ticket.created_by_name || 'Customer';
  return {
    id: displayTicketId(ticket.id),
    dbId: ticket.id,
    ownerId: ticket.created_by,
    subject: ticket.title,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority[0].toUpperCase() + ticket.priority.slice(1),
    status: ({ open: 'Open', in_progress: 'In progress', resolved: 'Resolved', closed: 'Closed' })[ticket.status] || ticket.status,
    customer: name,
    customerShort: name.split(' ').map((x, i) => i === 0 ? x : `${x[0]}.`).join(' '),
    assignee: ticket.status === 'open' ? 'Unassigned' : 'Support Team',
    createdAt: parseSqlDate(ticket.created_at),
    updatedAt: parseSqlDate(ticket.updated_at || ticket.created_at),
    comments: (ticket.comments || []).map(fromApiComment),
  };
}

export function fromApiComment(comment) {
  return {
    id: comment.id,
    userId: comment.user_id,
    author: comment.author_name,
    authorRole: comment.author_role,
    text: comment.body,
    createdAt: parseSqlDate(comment.created_at),
  };
}

export function toApiTicket(input) {
  return {
    title: input.subject.trim(),
    description: input.description.trim(),
    category: input.category,
    priority: input.priority.toLowerCase(),
  };
}

export const toApiStatus = (status) => status.toLowerCase().replace(' ', '_');
