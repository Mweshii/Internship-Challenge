import { Link } from 'react-router-dom';
import { site } from '../../config/site.js';

// The brand mark: the Nexura "NX" symbol (an SVG drawn from straight-edged
// polygons, so it stays sharp at any size) plus the stacked name ("NEXURA"
// over "TECHNOLOGIES") in the logo gradient. The text comes from
// config/site.js, so renaming only needs a change there.
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label={`${site.name} home`}>
      <img src="/images/nexura-mark.svg" alt="" className="h-9 w-auto shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-brand-gradient text-lg font-extrabold tracking-wide uppercase">{site.nameStart}</span>
        <span className="text-brand-gradient mt-1 text-[0.6rem] font-semibold tracking-[0.3em] uppercase">
          {site.nameEnd}
        </span>
      </span>
    </Link>
  );
}
