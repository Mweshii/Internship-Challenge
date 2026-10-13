// The dark bar at the top of every page.
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { navLinks } from '../../config/site.js';
import { useCart } from '../../context/CartContext.jsx';
import { Logo } from '../ui/Logo.jsx';

// NavLink tells us whether its link matches the current page (isActive).
// The active link is white with a blue underline; the rest are grey.
function desktopLinkClass({ isActive }) {
  const base = 'relative py-5 text-sm font-medium transition-colors';
  const underline = 'after:absolute after:inset-x-0 after:bottom-3 after:h-0.5 after:rounded-full after:bg-brand-500';
  return isActive ? `${base} ${underline} text-white` : `${base} text-slate-300 hover:text-white`;
}

function mobileLinkClass({ isActive }) {
  const base = 'block rounded-lg px-3 py-3 text-base font-medium';
  return isActive ? `${base} bg-brand-500/15 text-white` : `${base} text-slate-300 hover:bg-white/5 hover:text-white`;
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu and search bar whenever the page changes.
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.search]);

  function handleSearch(event) {
    event.preventDefault();
    const query = searchText.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearchText('');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* Desktop links - hidden below the md breakpoint (768px) */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsSearchOpen((open) => !open)}
            className="flex size-11 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 hover:text-white"
            aria-label="Search products"
            aria-expanded={isSearchOpen}
          >
            <Search className="size-5" aria-hidden="true" />
          </button>

          <Link
            to="/cart"
            className="relative flex size-11 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 hover:text-white"
            aria-label={`Shopping cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
          >
            <ShoppingCart className="size-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-0.5 flex min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] leading-5 font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Hamburger button - only shown on small screens */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex size-11 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 hover:text-white md:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-white/10 bg-navy-900">
          <form onSubmit={handleSearch} className="container-page flex gap-2 py-3" role="search">
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search accessories and electronics..."
              aria-label="Search products"
              className="input"
              autoFocus
            />
            <button type="submit" className="btn btn-primary shrink-0">
              Search
            </button>
          </form>
        </div>
      )}

      {isMenuOpen && (
        <nav className="border-t border-white/10 bg-navy-900 md:hidden" aria-label="Mobile">
          <div className="container-page space-y-1 py-3">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={mobileLinkClass}>
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/sell" className={mobileLinkClass}>
              Sell Your Device
            </NavLink>
            <NavLink to="/track" className={mobileLinkClass}>
              Track Your Order
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}
