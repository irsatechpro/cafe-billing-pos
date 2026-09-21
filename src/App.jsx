import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CafeProvider } from './context/CafeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg,#FAF6F0)] font-serif text-sm">
        Verifying secure session...
      </div>
    );
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
                {/* Customer Routes */}
                <Route path="/" element={<CustomerMenu />} />
                <Route path="/menu" element={<CustomerMenu />} />
                <Route path="/order/:orderId" element={<OrderStatusPage />} />

                {/* Authentication Route */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<Navigate to="/login" replace />} />

                {/* Protected Staff & Admin Routes */}
                <Route path="/cafe" element={<Navigate to="/admin/cafe" replace />} />
                <Route path="/admin" element={<Navigate to="/admin/cafe" replace />} />
                <Route path="/admin/cafe" element={<ProtectedRoute><CafeDashboard /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/menu" element={<ProtectedRoute><MenuManagement /></ProtectedRoute>} />
                <Route path="/admin/tables" element={<ProtectedRoute><TableManagement /></ProtectedRoute>} />
                <Route path="/admin/orders/history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/menu" replace />} />
              </Routes>
            </Router>
          </CartProvider>
        </CafeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
