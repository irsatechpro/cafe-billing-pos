import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// One-time migration to clear legacy mock items and stale sessions if needed
const APP_CLEAN_VERSION = 'v3_single_user_triobean_lock';
if (localStorage.getItem('tb_schema_version') !== APP_CLEAN_VERSION) {
  localStorage.removeItem('tb_categories');
  localStorage.removeItem('tb_menu_items');
  localStorage.removeItem('tb_orders');
  localStorage.removeItem('tb_payments');
  localStorage.removeItem('trio_bean_auth_user');
  localStorage.removeItem('trio_active_cafe_profile');
  localStorage.setItem('tb_schema_version', APP_CLEAN_VERSION);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
