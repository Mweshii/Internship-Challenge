// The frame shared by every page: navbar on top, footer at the bottom and the
// current page in between. <Outlet /> is where React Router draws that page.
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer.jsx';
import { Navbar } from './Navbar.jsx';

export function Layout() {
  const { pathname } = useLocation();

  // React Router swaps pages without reloading, so the scroll position would
  // otherwise carry over from the previous page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
