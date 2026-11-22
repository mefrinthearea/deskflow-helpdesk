export default function Badge({ value, kind = 'status' }) {
  return <span className={`pill pill-${kind} pill-${String(value).toLowerCase().replace(/\s+/g, '-')}`}>{value}</span>;
}
