import { ChevronDown } from 'lucide-react';

/** Native select controls are keyboard accessible without a custom popup. */
export default function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="filter-select">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown size={15} aria-hidden="true" />
    </label>
  );
}
