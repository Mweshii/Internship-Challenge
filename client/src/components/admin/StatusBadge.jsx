// A small coloured label for a record's status.
const FINISHED = ['completed', 'delivered', 'accepted'];
const STOPPED = ['cancelled', 'declined'];
const WAITING_ON_US = ['request_received', 'order_received', 'enquiry_received'];

export function StatusBadge({ status, label }) {
  let colours = 'bg-brand-50 text-brand-700'; // in progress
  if (FINISHED.includes(status)) colours = 'bg-emerald-50 text-emerald-700';
  if (STOPPED.includes(status)) colours = 'bg-slate-100 text-slate-600';
  if (WAITING_ON_US.includes(status)) colours = 'bg-amber-50 text-amber-700';

  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${colours}`}>{label}</span>;
}
