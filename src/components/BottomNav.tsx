
import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdOutlineHome, MdOutlineEvent, MdOutlineAccountCircle, MdOutlineShoppingBag } from 'react-icons/md';
import './BottomNav.css';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', icon: MdOutlineHome, label: 'Home', end: true },
  { to: '/event', icon: MdOutlineEvent, label: 'Event' },
  { to: '/product', icon: MdOutlineShoppingBag, label: 'Product' },
  { to: '/profile', icon: MdOutlineAccountCircle, label: 'Profile' },
];

const BottomNav: React.FC = React.memo(() => (
  <nav className="bottom-nav">
    {navItems.map(({ to, icon: Icon, label, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <Icon className="nav-icon" />
        <span className="nav-label">{label}</span>
      </NavLink>
    ))}
  </nav>
));

export default BottomNav;
