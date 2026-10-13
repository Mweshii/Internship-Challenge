// The "thank you" screen shown after a repair request, sell enquiry or order
// has been saved. `summary` is a list of { label, value } rows.
import { Check, CircleCheck, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function Confirmation({ title, reference, message, summary = [], children }) {
  const [hasCopied, setHasCopied] = useState(false);

  // The form above this screen was long, so jump back to the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(reference);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // Clipboard blocked by the browser: the reference is still on screen to copy by hand.
    }
  }

  return (
    <div className="container-page py-12">
      <div className="card mx-auto max-w-2xl p-6 sm:p-10">
        <div className="text-center">
          <CircleCheck className="mx-auto size-14 text-emerald-500" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>

        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5 text-center">
          <p className="text-xs font-medium tracking-wide text-brand-700 uppercase">Your reference number</p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <span className="font-mono text-2xl font-bold tracking-wider text-slate-900">{reference}</span>
            <button type="button" onClick={copyReference} className="btn btn-secondary min-h-9 px-3 py-1.5 text-xs">
              {hasCopied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
              {hasCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-600">Keep this safe. You will need it, with your phone number or email, to track progress.</p>
        </div>

        {summary.length > 0 && (
          <dl className="mt-6 divide-y divide-slate-100 text-sm">
            {summary.map((row) => (
              <div key={row.label} className="grid gap-1 py-2.5 sm:grid-cols-3">
                <dt className="font-medium text-slate-500">{row.label}</dt>
                <dd className="break-words text-slate-900 sm:col-span-2">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {children}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
          <Link to={`/track?ref=${reference}`} className="btn btn-secondary">
            Track this booking
          </Link>
        </div>
      </div>
    </div>
  );
}
