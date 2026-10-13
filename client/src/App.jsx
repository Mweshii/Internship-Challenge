// The route table: which page component is shown for which URL.
// To add a page: create it in src/pages/, import it here and add a <Route>.
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout.jsx';
import AboutPage from './pages/AboutPage.jsx';
import AccessoriesPage from './pages/AccessoriesPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import ElectronicsPage from './pages/ElectronicsPage.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RepairsPage from './pages/RepairsPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import SellPage from './pages/SellPage.jsx';
import TrackPage from './pages/TrackPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* Every route inside <Layout> gets the navbar and footer. */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/repairs" element={<RepairsPage />} />
        <Route path="/accessories" element={<AccessoriesPage />} />
        <Route path="/electronics" element={<ElectronicsPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/track" element={<TrackPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
