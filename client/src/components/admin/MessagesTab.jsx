// Messages sent through the Contact page form, newest first.
import { useEffect, useState } from 'react';
import { getAdminMessages } from '../../api/services.js';
import { formatDateTime } from '../../utils/format.js';
import { Alert, Spinner } from '../ui/Feedback.jsx';

export function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getAdminMessages()
      .then((data) => {
        if (isCurrent) setMessages(data.messages);
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
  }, []);

  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900">Contact Messages</h2>
      <div className="mt-4 space-y-3">
        {error && <Alert type="error">{error}</Alert>}
        {isLoading && <Spinner />}
        {!isLoading && !error && messages.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">No messages yet.</p>
        )}
        {messages.map((message) => (
          <article key={message.id} className="card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-semibold text-slate-900">{message.fullName}</h3>
              <time className="text-xs text-slate-500">{formatDateTime(message.createdAt)}</time>
            </div>
            <p className="mt-0.5 text-sm break-all text-slate-500">
              {message.email}
              {message.phone ? ` - ${message.phone}` : ''}
            </p>
            <p className="mt-3 text-sm whitespace-pre-line text-slate-700">{message.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
