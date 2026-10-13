// "Track Your Order" - works for repairs (REP-...), shop orders (ORD-...) and
// device sale enquiries (SEL-...).
//
// The visitor must give the reference number AND the phone number or email
// used for the booking. The server only answers when both match, and even then
// it sends progress information only - never names or addresses.
import { CircleX } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackBooking } from '../api/services.js';
import { Alert, SubmitButton } from '../components/ui/Feedback.jsx';
import { TextField } from '../components/ui/Field.jsx';
import { ProgressSteps } from '../components/ui/ProgressSteps.jsx';
import { formatDateTime } from '../utils/format.js';

function TrackingResult({ booking }) {
  const rows = [
    { label: 'Reference Number', value: booking.reference },
    { label: 'Type', value: booking.typeLabel },
    ...booking.details,
    { label: 'Current Status', value: booking.statusLabel, isStatus: true },
    { label: 'Submitted', value: formatDateTime(booking.createdAt) },
    { label: 'Last Updated', value: formatDateTime(booking.updatedAt) },
  ];

  return (
    <div className="card mt-8 p-5 sm:p-8">
      {booking.isCancelled ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          <CircleX className="size-5 shrink-0" aria-hidden="true" />
          This booking has been cancelled. Please contact us if you have any questions.
        </div>
      ) : (
        <ProgressSteps steps={booking.steps} currentStep={booking.currentStep} />
      )}

      <h2 className="mt-8 text-base font-semibold text-slate-900">Order Details</h2>
      <dl className="mt-3 divide-y divide-slate-100 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 py-3 sm:grid-cols-3">
            <dt className="font-medium text-slate-500">{row.label}</dt>
            <dd className={`break-words sm:col-span-2 ${row.isStatus ? 'font-semibold text-brand-600' : 'text-slate-900'}`}>{row.value}</dd>
          </div>
        ))}
      </dl>

      {booking.history.length > 1 && (
        <>
          <h2 className="mt-8 text-base font-semibold text-slate-900">Status History</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {booking.history.map((entry, index) => (
              <li key={`${entry.createdAt}-${index}`} className="flex flex-wrap justify-between gap-x-4 rounded-lg bg-surface px-3 py-2">
                <span className="font-medium text-slate-800">{entry.statusLabel}</span>
                <span className="text-slate-500">{formatDateTime(entry.createdAt)}</span>
              </li>
            ))}
          </ol>
        </>
      )}

      <p className="mt-6 text-xs text-slate-500">We will contact you using your preferred contact method when the status changes.</p>
    </div>
  );
}

export default function TrackPage() {
  // The confirmation screen links here as /track?ref=REP-XXXX to pre-fill the box.
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('ref') || '');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [booking, setBooking] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLookupError('');
    setBooking(null);

    const foundErrors = {};
    // Quick shape check: three letters, a dash, eight characters (e.g. REP-7KQ2M9XA).
    if (!/^(REP|ORD|SEL)-[A-Z0-9]{8}$/i.test(reference.trim())) {
      foundErrors.reference = 'Enter your full reference number, for example REP-7KQ2M9XA.';
    }
    if (!contact.trim()) {
      foundErrors.contact = 'Enter the phone number or email address used for the booking.';
    }
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    setIsLoading(true);
    try {
      setBooking(await trackBooking(reference.trim(), contact.trim()));
    } catch (error) {
      setLookupError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container-page max-w-3xl py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-slate-900">Track Your Order</h1>
      <p className="mt-2 text-slate-600">Enter your reference number to check the status of your repair or order.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid items-start gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <TextField
          label="Reference number"
          name="reference"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          error={errors.reference}
          placeholder="e.g. REP-7KQ2M9XA"
          autoCapitalize="characters"
          autoComplete="off"
        />
        <TextField
          label="Phone or email used"
          name="contact"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          error={errors.contact}
          placeholder="Phone number or email"
        />
        {/* sm:mt-[26px] lines the button up with the inputs (which sit below their labels) */}
        <SubmitButton isSubmitting={isLoading} submittingLabel="Checking..." className="sm:mt-[26px] sm:w-auto sm:px-8">
          Track
        </SubmitButton>
      </form>
      <p className="mt-2 text-xs text-slate-500">For your privacy we ask for the contact detail as well as the reference.</p>

      {lookupError && (
        <Alert type="error" className="mt-6">
          {lookupError}
        </Alert>
      )}
      {booking && <TrackingResult booking={booking} />}
    </div>
  );
}
