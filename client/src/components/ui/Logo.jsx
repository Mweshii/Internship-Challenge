import { Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { site } from '../../config/site.js';

// The brand mark: a phone icon plus the two-colour name. The text comes from
// config/site.js, so renaming the business only needs a change there.
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white" aria-label={`${site.name} home`}>
      <Smartphone className="size-7 text-brand-500" strokeWidth={2.2} aria-hidden="true" />
      <span>
        {site.nameStart}
        <span className="text-brand-500">{site.nameEnd}</span>
      </span>
    </Link>
  );
}
