// Small pieces for telling the user what is going on.
import { ArrowLeft, CircleAlert, CircleCheck, Info, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ALERT_STYLES = {
  error: { box: 'border-red-200 bg-red-50 text-red-800', icon: CircleAlert },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: CircleCheck },
  info: { box: 'border-brand-200 bg-brand-50 text-brand-700', icon: Info },
};

// A coloured message box. role="alert" makes screen readers announce errors.
export function Alert({ type = 'info', children, className = '' }) {
  const style = ALERT_STYLES[type];
  const Icon = style.icon;
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${style.box} ${className}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500" role="status">
      <LoaderCircle className="size-5 animate-spin text-brand-500" aria-hidden="true" />
      {label}
    </div>
  );
}

// A submit button that disables itself and shows a spinner while saving, which
// also prevents the form being sent twice by a double click.
export function SubmitButton({ isSubmitting, children, submittingLabel = 'Sending...', className = '' }) {
  return (
    <button type="submit" disabled={isSubmitting} className={`btn btn-primary w-full ${className}`}>
      {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {isSubmitting ? submittingLabel : children}
    </button>
  );
}

export function BackLink({ to = '/', children = 'Back to Home', light = false }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-1.5 text-sm font-medium ${light ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-brand-600'}`}>
      <ArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Link>
  );
}
