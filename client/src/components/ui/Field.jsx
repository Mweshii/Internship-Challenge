// Form building blocks. Each one draws the label, the control and - when
// there is one - the error message, so every form field on the site looks and
// behaves the same.

// The wrapper. `name` is written to data-field so a failed submit can scroll
// to the first field with an error (see utils/validation.js).
export function Field({ label, name, error, hint, required = false, optional = false, className = '', children }) {
  return (
    <div data-field={name} className={className}>
      {label && (
        <label htmlFor={name} className="label">
          {label}
          {required && <span className="text-red-500"> *</span>}
          {optional && <span className="font-normal text-slate-400"> (optional)</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(error) {
  return `input ${error ? 'input-invalid' : ''}`;
}

// Any extra props (placeholder, type, min, autoComplete...) are passed straight
// to the <input>.
export function TextField({ label, name, error, hint, required, optional, className, ...inputProps }) {
  return (
    <Field label={label} name={name} error={error} hint={hint} required={required} optional={optional} className={className}>
      <input id={name} name={name} className={inputClass(error)} aria-invalid={Boolean(error)} {...inputProps} />
    </Field>
  );
}

export function TextAreaField({ label, name, error, hint, required, optional, className, rows = 4, ...textareaProps }) {
  return (
    <Field label={label} name={name} error={error} hint={hint} required={required} optional={optional} className={className}>
      <textarea id={name} name={name} rows={rows} className={inputClass(error)} aria-invalid={Boolean(error)} {...textareaProps} />
    </Field>
  );
}

// `options` may be plain text (['64GB', '128GB']) or { value, label } objects.
export function SelectField({ label, name, error, hint, required, optional, className, options, placeholder, ...selectProps }) {
  return (
    <Field label={label} name={name} error={error} hint={hint} required={required} optional={optional} className={className}>
      <select id={name} name={name} className={inputClass(error)} aria-invalid={Boolean(error)} {...selectProps}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const text = typeof option === 'string' ? option : option.label;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </Field>
  );
}
