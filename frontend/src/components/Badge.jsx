/** Shared status/priority pill; styling lives in the Figma-derived CSS. */
export default function Badge({ value, kind = 'status' }) {
  const slug = String(value).toLowerCase().replace(/\s+/g, '-');
  return <span className={`pill pill-${kind} pill-${slug}`}>{value}</span>;
}
