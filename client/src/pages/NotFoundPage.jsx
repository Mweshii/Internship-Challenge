// Shown for any URL that does not match a route in App.jsx.
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container-page py-20 text-center">
      <p className="text-6xl font-bold text-brand-500">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn-primary mt-8">
        Back to Home
      </Link>
    </div>
  );
}
