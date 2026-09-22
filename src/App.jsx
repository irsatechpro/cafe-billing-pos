import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CafeProvider } from './context/CafeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PageLoader } from './components/common/LoadingSpinner';

// Customer Pages
import CustomerMenu from './pages/CustomerMenu';
import OrderStatusPage from './pages/OrderStatusPage';
import AuthPage from './pages/AuthPage';

// Admin / Staff Pages
import CafeDashboard from './pages/admin/CafeDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import TableManagement from './pages/admin/TableManagement';
import OrderHistory from './pages/admin/OrderHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import SettingsPage from './pages/admin/SettingsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <PageLoader message="Verifying secure Trio Bean session..." />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CafeProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Landing Page: Set directly to Sign-In Page */}
                <Route path="/" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<Navigate to="/" replace />} />

                {/* Customer Digital QR Menu Routes */}
                <Route path="/menu" element={<CustomerMenu />} />
                <Route path="/order/:orderId" element={<OrderStatusPage />} />

                {/* Protected Staff & POS Admin Routes */}
                <Route path="/cafe" element={<Navigate to="/admin/cafe" replace />} />
                <Route path="/admin" element={<Navigate to="/admin/cafe" replace />} />
                <Route path="/admin/cafe" element={<ProtectedRoute><CafeDashboard /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/menu" element={<ProtectedRoute><MenuManagement /></ProtectedRoute>} />
                <Route path="/admin/tables" element={<ProtectedRoute><TableManagement /></ProtectedRoute>} />
                <Route path="/admin/orders/history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </CartProvider>
        </CafeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
