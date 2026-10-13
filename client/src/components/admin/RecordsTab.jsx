// A searchable, filterable table of records. One component serves repairs,
// orders and sell enquiries: `resource` picks the settings from recordConfig.js.
import { useCallback, useEffect, useState } from 'react';
import { getAdminRecords } from '../../api/services.js';
import { formatDateTime } from '../../utils/format.js';
import { Alert, Spinner } from '../ui/Feedback.jsx';
import { RecordDetail } from './RecordDetail.jsx';
import { RECORD_CONFIG } from './recordConfig.js';
import { StatusBadge } from './StatusBadge.jsx';

export function RecordsTab({ resource, statuses, onChanged }) {
  const config = RECORD_CONFIG[resource];
  const [searchText, setSearchText] = useState(''); // what is in the box
  const [search, setSearch] = useState(''); // what was last submitted
  const [status, setStatus] = useState('');
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError('');

    getAdminRecords(resource, { search, status })
      .then((data) => {
        if (isCurrent) setRecords(data.records);
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [resource, search, status, reloadCount]);

  // Called after a status change: reload this list and the dashboard counts.
  const handleChanged = useCallback(() => {
    setReloadCount((count) => count + 1);
    onChanged();
  }, [onChanged]);

  const closeDetail = useCallback(() => setSelectedId(null), []);

  function handleSearch(event) {
    event.preventDefault();
    setSearch(searchText.trim());
  }

  function clearFilters() {
    setSearchText('');
    setSearch('');
    setStatus('');
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900">{config.title}</h2>

      <form onSubmit={handleSearch} className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px_auto_auto]" role="search">
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder={config.searchPlaceholder}
          aria-label="Search records"
          className="input"
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status" className="input">
          <option value="">All statuses</option>
          {statuses.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        <button type="button" onClick={clearFilters} disabled={!search && !status && !searchText} className="btn btn-secondary">
          Clear
        </button>
      </form>

      <div className="mt-4">
        {error && <Alert type="error">{error}</Alert>}
        {isLoading && <Spinner />}

        {!isLoading && !error && records.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            {search || status ? 'No records match these filters.' : 'Nothing here yet.'}
          </p>
        )}

        {!isLoading && !error && records.length > 0 && (
          // overflow-x-auto: on a narrow screen the table scrolls sideways
          // inside its box instead of stretching the whole page.
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-surface text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  {config.columns.map((column) => (
                    <th key={column.header} className="px-4 py-3 font-semibold">
                      {column.header}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Received</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">{record.reference}</td>
                    {config.columns.map((column) => (
                      <td key={column.header} className="px-4 py-3 text-slate-700">
                        {column.value(record)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <StatusBadge status={record.status} label={record.statusLabel} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDateTime(record.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => setSelectedId(record.id)} className="font-semibold text-brand-600 hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedId !== null && (
        <RecordDetail resource={resource} recordId={selectedId} statuses={statuses} onClose={closeDetail} onChanged={handleChanged} />
      )}
    </section>
  );
}
