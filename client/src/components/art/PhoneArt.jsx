// Smartphone illustrations drawn with SVG, so the site needs no stock photos.
// To use real product photography instead, replace <HeroPhones /> (or any
// <Phone />) with an <img src="/images/your-photo.png" alt="..." />.
import { useId } from 'react';

// Wallpaper colour sets: [dark, mid, light].
const WALLPAPERS = {
  blue: ['#071a5c', '#1668ff', '#8fd0ff'],
  violet: ['#170f4a', '#5a3df0', '#c9a2ff'],
  aqua: ['#04324d', '#0ea5e9', '#a5f3fc'],
};

// One phone. `back` shows the rear (camera side) instead of the screen.
export function Phone({ variant = 'blue', back = false, className = '' }) {
  // useId gives each phone its own gradient ids, so several can share a page.
  const id = useId();
  const [dark, mid, light] = WALLPAPERS[variant];

  return (
    <svg viewBox="0 0 200 400" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-frame`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b6480" />
          <stop offset="0.5" stopColor="#1b2135" />
          <stop offset="1" stopColor="#3c4560" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={dark} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="1" stopColor={light} />
        </linearGradient>
        <linearGradient id={`${id}-back`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a3350" />
          <stop offset="1" stopColor="#0d1326" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x="9" y="9" width="182" height="382" rx="27" />
        </clipPath>
      </defs>

      <rect x="2" y="2" width="196" height="396" rx="34" fill={`url(#${id}-frame)`} />

      {back ? (
        <>
          <rect x="7" y="7" width="186" height="386" rx="29" fill={`url(#${id}-back)`} />
          <rect x="20" y="20" width="92" height="92" rx="24" fill="#060a18" opacity="0.75" />
          {[
            [46, 46],
            [86, 46],
            [46, 86],
          ].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r="17" fill="#05070f" stroke="#59627d" strokeWidth="3" />
              <circle cx={cx} cy={cy} r="7" fill="#1b2a5e" />
              <circle cx={cx - 3} cy={cy - 3} r="2" fill="#9db8ff" opacity="0.8" />
            </g>
          ))}
          <circle cx="88" cy="88" r="6" fill="#e9eefc" opacity="0.85" />
          <circle cx="100" cy="215" r="13" fill="none" stroke="#4a5472" strokeWidth="3" />
        </>
      ) : (
        <g clipPath={`url(#${id}-clip)`}>
          <rect x="9" y="9" width="182" height="382" fill={`url(#${id}-wall)`} />
          {/* soft overlapping waves, like a default phone wallpaper */}
          <path d="M9 250 C70 170 120 330 191 210 V391 H9z" fill={light} opacity="0.28" />
          <path d="M9 300 C80 240 130 380 191 280 V391 H9z" fill={dark} opacity="0.45" />
          <path d="M9 120 C60 60 140 150 191 70 V9 H9z" fill="#ffffff" opacity="0.1" />
          <rect x="72" y="20" width="56" height="16" rx="8" fill="#03050c" />
        </g>
      )}
    </svg>
  );
}

// The three overlapping phones on the right of the homepage hero.
export function HeroPhones() {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-md lg:max-w-none">
      <Phone back className="absolute top-[12%] left-[4%] w-[33%] -rotate-12 drop-shadow-2xl" />
      <Phone variant="violet" className="absolute top-[2%] left-[31%] w-[35%] -rotate-3 drop-shadow-2xl" />
      <Phone variant="blue" className="absolute top-[8%] left-[60%] w-[36%] rotate-9 drop-shadow-2xl" />
    </div>
  );
}

// A smaller group used in page banners and sidebars.
export function PhoneGroup({ className = '' }) {
  return (
    <div className={`relative aspect-[4/3] ${className}`}>
      <Phone back className="absolute top-[14%] left-[6%] w-[30%] -rotate-6 drop-shadow-xl" />
      <Phone variant="aqua" className="absolute top-[4%] left-[34%] w-[32%] drop-shadow-xl" />
      <Phone variant="violet" className="absolute top-[12%] left-[63%] w-[30%] rotate-6 drop-shadow-xl" />
    </div>
  );
}
