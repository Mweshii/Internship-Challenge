// The pop-up for one repair, order or sell enquiry: full details, customer
// photos, the status history and the forms to update it.
import { useEffect, useState } from 'react';
import { getAdminRecord, saveSellReview, updateAdminStatus, uploadUrl } from '../../api/services.js';
import { formatDateTime } from '../../utils/format.js';
import { Alert, Spinner } from '../ui/Feedback.jsx';
import { SelectField, TextAreaField, TextField } from '../ui/Field.jsx';
import { Modal } from './Modal.jsx';
import { RECORD_CONFIG } from './recordConfig.js';
import { StatusBadge } from './StatusBadge.jsx';

// Changes the status and logs an optional note in the history.
function StatusForm({ resource, record, statuses, onSaved }) {
  const [status, setStatus] = useState(record.status);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      onSaved(await updateAdminStatus(resource, record.id, status, note.trim()));
      setNote('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-surface p-4">
      <h3 className="text-sm font-semibold text-slate-900">Update status</h3>
      {error && (
        <Alert type="error" className="mt-3">
          {error}
        </Alert>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SelectField
          label="Status"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={statuses.map((option) => ({ value: option.code, label: option.label }))}
        />
        <TextField
          label="Internal note"
          name="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Not shown to the customer"
          maxLength={500}
          optional
        />
      </div>
      <button type="submit" disabled={isSaving || (status === record.status && !note.trim())} className="btn btn-primary mt-3">
        {isSaving ? 'Saving...' : 'Save status'}
      </button>
    </form>
  );
}

// Sell enquiries only: the business's own offer and private notes.
function SellReviewForm({ record, onSaved }) {
  const [proposedOffer, setProposedOffer] = useState(record.proposedOffer ?? '');
  const [adminNotes, setAdminNotes] = useState(record.adminNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);
    setIsSaving(true);
    try {
      onSaved(await saveSellReview(record.id, { proposedOffer: proposedOffer === '' ? null : Number(proposedOffer), adminNotes }));
      setMessage({ type: 'success', text: 'Offer and notes saved.' });
    } catch (requestError) {
      setMessage({ type: 'error', text: requestError.fieldErrors?.proposedOffer || requestError.message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-surface p-4">
      <h3 className="text-sm font-semibold text-slate-900">Our review</h3>
      <p className="mt-1 text-xs text-slate-500">
        Recording an offer here does not notify the customer. Contact them, then set the status to &ldquo;Offer Made&rdquo;.
      </p>
      {message && (
        <Alert type={message.type} className="mt-3">
          {message.text}
        </Alert>
      )}
      <div className="mt-3 grid gap-3">
        <TextField
          label="Proposed offer (N$)"
          name="proposedOffer"
          type="number"
          min="0"
          step="any"
          value={proposedOffer}
          onChange={(event) => setProposedOffer(event.target.value)}
          optional
          className="max-w-xs"
        />
        <TextAreaField
          label="Private notes"
          name="adminNotes"
          value={adminNotes}
          onChange={(event) => setAdminNotes(event.target.value)}
          rows={2}
          maxLength={1000}
          optional
        />
      </div>
      <button type="submit" disabled={isSaving} className="btn btn-primary mt-3">
        {isSaving ? 'Saving...' : 'Save offer & notes'}
      </button>
    </form>
  );
}

export function RecordDetail({ resource, recordId, statuses, onClose, onChanged }) {
  const config = RECORD_CONFIG[resource];
  const [data, setData] = useState(null); // { record, history }
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getAdminRecord(resource, recordId)
      .then((result) => {
        if (isCurrent) setData(result);
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message);
      });
    return () => {
      isCurrent = false;
    };
  }, [resource, recordId]);

  // After a save the API returns the fresh record + history: show it here and
  // tell the list behind this window to reload.
  function handleSaved(result) {
    setData(result);
    onChanged();
  }

  const record = data?.record;
  const photos = record ? config.photos(record) : [];
  // Rows with nothing to show (an empty optional answer) are left out.
  const rows = record ? config.details(record).filter(([, value]) => value) : [];

  return (
    <Modal title={record ? record.reference : 'Loading...'} onClose={onClose}>
      {error && <Alert type="error">{error}</Alert>}
      {!data && !error && <Spinner />}

      {record && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <StatusBadge status={record.status} label={record.statusLabel} />
            <span>Received {formatDateTime(record.createdAt)}</span>
          </div>

          <dl className="divide-y divide-slate-100 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-2 sm:grid-cols-3">
                <dt className="font-medium text-slate-500">{label}</dt>
                <dd className="break-words whitespace-pre-line text-slate-900 sm:col-span-2">{value}</dd>
              </div>
            ))}
          </dl>

          {photos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Customer photos</h3>
              <div className="mt-2 flex flex-wrap gap-3">
                {photos.map((fileName, index) => (
                  <a key={fileName} href={uploadUrl(fileName)} target="_blank" rel="noreferrer" className="block size-24 overflow-hidden rounded-xl border border-slate-200">
                    <img src={uploadUrl(fileName)} alt={`Customer photo ${index + 1}`} className="size-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* key: rebuild the forms when the saved values change, so they show the latest data */}
          <StatusForm key={`status-${record.status}`} resource={resource} record={record} statuses={statuses} onSaved={handleSaved} />
          {config.type === 'sell' && <SellReviewForm record={record} onSaved={handleSaved} />}

          <div>
            <h3 className="text-sm font-semibold text-slate-900">History</h3>
            <ol className="mt-2 space-y-2 text-sm">
              {data.history.map((entry, index) => (
                <li key={`${entry.createdAt}-${index}`} className="rounded-lg bg-surface px-3 py-2">
                  <div className="flex flex-wrap justify-between gap-x-4">
                    <span className="font-medium text-slate-800">{entry.statusLabel}</span>
                    <span className="text-slate-500">
                      {formatDateTime(entry.createdAt)}
                      {entry.changedBy ? ` - ${entry.changedBy}` : ''}
                    </span>
                  </div>
                  {entry.note && <p className="mt-1 text-slate-600">{entry.note}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Modal>
  );
}
