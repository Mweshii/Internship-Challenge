// The admin dashboard: summary cards plus one tab per kind of record.
//
// Security note: this page only DISPLAYS data. What actually protects customer
// information is the server, which refuses every /api/admin request that does
// not carry a valid admin cookie (see server/src/middleware/auth.js). Someone
// who opens /admin without signing in gets an empty page and a redirect.
import { Boxes, ClipboardList, HandCoins, Inbox, LogOut, Wrench } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminOverview, getCurrentUser, logout } from '../../api/services.js';
import { MessagesTab } from '../../components/admin/MessagesTab.jsx';
import { ProductsTab } from '../../components/admin/ProductsTab.jsx';
import { RecordsTab } from '../../components/admin/RecordsTab.jsx';
import { Alert, Spinner } from '../../components/ui/Feedback.jsx';

// `count` names the matching number in the overview's `counts` object.
const TABS = [
  { id: 'repairs', label: 'Repairs', icon: Wrench, count: 'openRepairs', countLabel: 'Open repairs' },
  { id: 'orders', label: 'Orders', icon: ClipboardList, count: 'openOrders', countLabel: 'Open orders' },
  { id: 'sell-enquiries', label: 'Sell Enquiries', icon: HandCoins, count: 'openEnquiries', countLabel: 'Open sell enquiries' },
  { id: 'products', label: 'Products', icon: Boxes },
  { id: 'messages', label: 'Messages', icon: Inbox, count: 'messages', countLabel: 'Messages' },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [overview, setOverview] = useState(null); // { counts, statuses }
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('repairs');

  const loadOverview = useCallback(() => {
    getAdminOverview()
      .then(setOverview)
      .catch((requestError) => setError(requestError.message));
  }, []);

  // Ask the server who is signed in. 401 means nobody: go to the login page.
  useEffect(() => {
    let isCurrent = true;
    getCurrentUser()
      .then((data) => {
        if (!isCurrent) return;
        setUser(data.user);
        loadOverview();
      })
      .catch((requestError) => {
        if (!isCurrent) return;
        if (requestError.status === 401 || requestError.status === 403) navigate('/admin/login', { replace: true });
        else setError(requestError.message);
      });
    return () => {
      isCurrent = false;
    };
  }, [navigate, loadOverview]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate('/admin/login', { replace: true });
    }
  }

  if (error && !overview) {
    return (
      <div className="container-page py-12">
        <Alert type="error">{error}</Alert>
      </div>
    );
  }
  if (!user || !overview) {
    return (
      <div className="container-page py-12">
        <Spinner label="Loading dashboard..." />
      </div>
    );
  }

  const { counts, statuses } = overview;

  return (
    <div className="min-h-full bg-surface">
      <div className="container-page py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Signed in as {user.name || user.email}</p>
          </div>
          <button type="button" onClick={handleLogout} className="btn btn-secondary">
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>

        {/* Summary cards - clicking one opens its tab */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TABS.filter((tab) => tab.count).map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className="card p-4 text-left transition hover:border-brand-200 hover:shadow-md">
              <tab.icon className="size-5 text-brand-500" aria-hidden="true" />
              <p className="mt-2 text-2xl font-bold text-slate-900">{counts[tab.count]}</p>
              <p className="text-xs text-slate-500">{tab.countLabel}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon className="size-4" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* key={activeTab}: switching tab builds a fresh component, so one
            tab's search text and filters do not leak into the next. */}
        <div className="mt-6">
          {activeTab === 'repairs' && <RecordsTab key="repairs" resource="repairs" statuses={statuses.repair} onChanged={loadOverview} />}
          {activeTab === 'orders' && <RecordsTab key="orders" resource="orders" statuses={statuses.order} onChanged={loadOverview} />}
          {activeTab === 'sell-enquiries' && (
            <RecordsTab key="sell-enquiries" resource="sell-enquiries" statuses={statuses.sell} onChanged={loadOverview} />
          )}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'messages' && <MessagesTab />}
        </div>
      </div>
    </div>
  );
}
