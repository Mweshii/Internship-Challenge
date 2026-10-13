// =============================================================================
// PAGE TEXT - the wording for the Home and About pages lives here so it can be
// edited without touching any layout code.
// =============================================================================
import { Award, ShieldCheck, ShoppingBag, Smartphone, Tablet, Timer, UserRound, Wrench } from 'lucide-react';

// The four items in the strip under the homepage hero.
export const benefits = [
  { icon: UserRound, title: 'Expert Technicians', text: 'Skilled & experienced' },
  { icon: Award, title: 'Quality Parts', text: 'Genuine & reliable' },
  { icon: Timer, title: 'Fast Turnaround', text: 'Get your device back sooner' },
  { icon: ShieldCheck, title: 'Trusted Service', text: 'Your satisfaction matters' },
];

// The four cards under "What do you need today?".
export const services = [
  { icon: Wrench, title: 'Repairs', text: "Fix your phone's problems", to: '/repairs' },
  { icon: ShoppingBag, title: 'Accessories', text: 'Covers, chargers, protectors & more', to: '/accessories' },
  { icon: Smartphone, title: 'Sell Your Device', text: 'Get a quote for your phone', to: '/sell' },
  { icon: Tablet, title: 'Other Electronics', text: 'Tablets, keys, gadgets & more', to: '/electronics' },
];

// About page. PLACEHOLDER wording - rewrite it in the business's own voice.
export const about = {
  intro: [
    'TechFix is a phone repair and technology shop. We fix phones and tablets, sell the accessories that protect them, and stock a range of everyday electronics.',
    'This introduction is placeholder text. Replace it with the real story of the business: who runs it, when it started and what makes it different.',
  ],
  services: [
    { title: 'Phone & tablet repairs', text: 'Screens, batteries, charging ports, cameras, software problems and more.' },
    { title: 'Accessories', text: 'Cases, screen protectors, chargers, cables, earphones and power banks.' },
    { title: 'Other electronics', text: 'Tablets, smartwatches, laptops, computer and gaming accessories.' },
    { title: 'Device buy-back', text: 'Tell us about a device you want to sell and we will get back to you.' },
  ],
  reasons: [
    { title: 'Honest assessments', text: 'We look at your device first and explain what we find before any work starts.' },
    { title: 'Drop-off or pickup', text: 'Bring your device to the shop or ask us to collect it from you.' },
    { title: 'Track your booking', text: 'Follow the progress of a repair or order online with your reference number.' },
  ],
  commitments: [
    'We contact you before doing any work that costs money.',
    'We never bypass passcodes, activation locks or other ownership protection.',
    'We keep your contact details private and only use them for your booking.',
  ],
};
