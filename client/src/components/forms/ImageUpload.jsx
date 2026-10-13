// Lets the customer attach photos, with a preview and a remove button for each.
//
// The parent form owns the list of files (`files` / `onChange`), exactly like
// a text input owns its value. This component only checks and displays them.
import { ImagePlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../../config/uploads.js';

const MAX_MEGABYTES = MAX_IMAGE_BYTES / (1024 * 1024);

export function ImageUpload({ name, files, onChange, maxFiles = 1 }) {
  const inputRef = useRef(null);
  const [problem, setProblem] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);

  // Create a temporary browser URL for each file so it can be shown in an
  // <img>, and release those URLs again when the files change.
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function handleSelect(event) {
    const chosen = Array.from(event.target.files);
    event.target.value = ''; // allows choosing the same file again later

    const accepted = [];
    let message = '';
    for (const file of chosen) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        message = `"${file.name}" is not a JPG, PNG or WebP image.`;
      } else if (file.size > MAX_IMAGE_BYTES) {
        message = `"${file.name}" is larger than ${MAX_MEGABYTES} MB.`;
      } else {
        accepted.push(file);
      }
    }

    // With a single-photo field a new choice replaces the old one.
    let next = maxFiles === 1 ? (accepted.length > 0 ? [accepted[0]] : files) : [...files, ...accepted];
    if (next.length > maxFiles) {
      message = `You can attach up to ${maxFiles} photos.`;
      next = next.slice(0, maxFiles);
    }

    setProblem(message);
    onChange(next);
  }

  function removeFile(index) {
    setProblem('');
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  const canAddMore = files.length < maxFiles || maxFiles === 1;

  return (
    <div data-field={name}>
      <div className="flex flex-wrap gap-3">
        {files.map((file, index) => (
          <div key={`${file.name}-${file.lastModified}-${index}`} className="relative size-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {previewUrls[index] && <img src={previewUrls[index]} alt={`Attached photo ${index + 1}`} className="size-full object-cover" />}
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-red-600"
              aria-label={`Remove photo ${index + 1}`}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-brand-400 hover:text-brand-600"
          >
            <ImagePlus className="size-6" aria-hidden="true" />
            {files.length > 0 && maxFiles === 1 ? 'Change' : 'Add photo'}
          </button>
        )}
      </div>

      {/* The real file input is hidden; the dashed button above opens it. */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        multiple={maxFiles > 1}
        onChange={handleSelect}
        className="hidden"
        aria-label="Choose photos"
      />

      <p className="mt-2 text-xs text-slate-500">
        JPG, PNG or WebP, up to {MAX_MEGABYTES} MB each{maxFiles > 1 ? `, maximum ${maxFiles} photos` : ''}.
      </p>
      {problem && (
        <p className="field-error" role="alert">
          {problem}
        </p>
      )}
    </div>
  );
}
