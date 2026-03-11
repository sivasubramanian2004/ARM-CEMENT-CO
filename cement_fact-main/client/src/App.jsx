import React, { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './state/AuthContext';
import { attachToken } from './api/client';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import AdminUsersPage from './pages/AdminUsersPage';
import MobileMenu from './components/MobileMenu';

export default function App() {
  const { isAuthenticated, user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    attachToken(token);
  }, [token]);

  return (
    <div className="app-shell">
      <nav className="navbar">
        <button className="hamburger" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="brand">A.R.M & CO Retails of Cement & Steel</div>

        <div className="nav-links">
          <Link className="btn" to="/">
            Products
          </Link>
          <Link className="btn" to="/about">
            About us
          </Link>
          {isAuthenticated && (
            <>
              <Link className="btn" to="/orders">
                Orders
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link className="btn" to="/admin/products">
                    Add Product
                  </Link>
                  <Link className="btn" to="/admin/users">
                    Manage User
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <div className="nav-actions">
          <Link className="user-icon" to={isAuthenticated ? '/profile' : '/login'} aria-label="user">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zM3 20c0-3.866 3.582-7 9-7s9 3.134 9 7v1H3v-1z" fill="currentColor" />
            </svg>
          </Link>
        </div>
        {/* Logout is moved into the Profile page */}
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProductsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requireAdmin>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
}
