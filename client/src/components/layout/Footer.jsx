import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { site } from '../../config/site.js';
import { Logo } from '../ui/Logo.jsx';

const footerLinks = [
  {
    heading: 'Services',
    links: [
      { to: '/repairs', label: 'Request a Repair' },
      { to: '/sell', label: 'Sell Your Device' },
      { to: '/track', label: 'Track Your Order' },
    ],
  },
  {
    heading: 'Shop',
    links: [
      { to: '/accessories', label: 'Accessories' },
      { to: '/electronics', label: 'Other Electronics' },
      { to: '/cart', label: 'Shopping Cart' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact' },
      { to: '/admin', label: 'Staff Sign In' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-400">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm">Repairs, accessories and more — all in one place.</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-brand-400" aria-hidden="true" />
              {site.contact.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-brand-400" aria-hidden="true" />
              {site.contact.email}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-brand-400" aria-hidden="true" />
              {site.contact.city}
            </li>
          </ul>
        </div>

        {footerLinks.map((group) => (
          <div key={group.heading}>
            <h2 className="text-sm font-semibold text-white">{group.heading}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <p className="container-page py-5 text-xs">
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
