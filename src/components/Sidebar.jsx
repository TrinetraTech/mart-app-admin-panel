import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  BarChart3, LogOut, Image as ImageIcon, MapPin
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/banners', icon: ImageIcon, label: 'Banners' },
  { to: '/shop-settings', icon: MapPin, label: 'Shop Settings' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛒</div>
        <div>
          <div className="sidebar-logo-text">Supermart</div>
          <div className="sidebar-logo-sub">Admin Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="nav-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={logout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
