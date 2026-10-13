// A pop-up window drawn over the page. Closes with the X button, the Escape
// key or a click on the dark background.
import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    // Stop the page behind the window from scrolling while it is open.
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onMouseDown={onClose}>
      {/* stopPropagation: a click inside the window must not count as a background click */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="mx-auto my-6 w-full max-w-2xl rounded-2xl bg-white shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
