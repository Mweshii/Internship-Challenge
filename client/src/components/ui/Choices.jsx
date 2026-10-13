// Selectable chips and cards. They are real checkboxes / radio buttons
// underneath, so they work with a keyboard and with screen readers.

// A tick-box chip - choose as many as you like (repair issues, accessories).
export function ChoiceChip({ label, checked, onChange }) {
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
        checked ? 'border-brand-500 bg-brand-50 font-medium text-brand-700' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'
      }`}
    >
      <input type="checkbox" className="size-4 shrink-0 accent-brand-500" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

// A larger card - choose exactly one (drop-off / pickup, delivery / collection).
export function OptionCard({ name, value, checked, onChange, title, description, icon: Icon }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
        checked ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-200 bg-white hover:border-brand-200'
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="mt-1 size-4 shrink-0 accent-brand-500" />
      {Icon && <Icon className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />}
      <span>
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}

// A square tile with an icon on top - choose exactly one (device type).
export function IconTile({ name, value, checked, onChange, label, icon: Icon }) {
  return (
    <label
      className={`flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-500 ${
        checked ? 'border-brand-500 bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-500' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'
      }`}
    >
      {/* sr-only hides the radio dot visually but keeps it for keyboards and screen readers */}
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" />
      <Icon className="size-6 text-brand-500" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

// A compact row of options - choose exactly one (Yes / No / Not sure).
// `options` is a list of { value, label }.
export function RadioPills({ name, options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
              checked ? 'border-brand-500 bg-brand-50 font-medium text-brand-700' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'
            }`}
          >
            <input type="radio" name={name} value={option.value} checked={checked} onChange={onChange} className="size-4 accent-brand-500" />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
