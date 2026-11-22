/** Display helpers shared by the dashboard, activity list, and ticket details. */
export const PRIORITY_RANK = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

export function timeAgo(date) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} h`;
  if (minutes < 2880) return 'Yesterday';
  return `${Math.floor(minutes / 1440)} d`;
}

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Always work on a copy: sorting should not mutate shared React state. */
export function filterAndSortTickets(tickets, { mine, userId, query, status, priority, sort }) {
  const term = query.trim().toLowerCase();
  const filtered = tickets.filter((ticket) => {
    if (mine && ticket.ownerId !== userId) return false;
    if (status && ticket.status !== status) return false;
    if (priority && ticket.priority !== priority) return false;
    if (!term) return true;

    return [ticket.id, ticket.subject, ticket.customer, ticket.category, ticket.description]
      .some((field) => String(field ?? '').toLowerCase().includes(term));
  });

  return filtered.sort((left, right) => {
    if (sort === 'oldest') {
      return new Date(left.updatedAt) - new Date(right.updatedAt);
    }
    if (sort === 'priority') {
      return (PRIORITY_RANK[left.priority] ?? 99) - (PRIORITY_RANK[right.priority] ?? 99);
    }
    return new Date(right.updatedAt) - new Date(left.updatedAt);
  });
}
