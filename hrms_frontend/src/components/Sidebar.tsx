import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { LogOut, X } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/posts', label: 'Posts' },
  { path: '/travel', label: 'Travel' },
  { path: '/games', label: 'Games' },
  { path: '/jobs', label: 'Jobs' },
  { path: '/organization', label: 'Organization' },
  { path: '/notifications', label: 'Notifications' },
];

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const sidebarClasses = `fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col h-screen ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggle} />
      )}
      <aside className={sidebarClasses}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700 flex-shrink-0">
          <span className="text-xl font-bold tracking-tight">
            HRMS <span className="text-sm font-normal opacity-50">({role})</span>
          </span>
          <button className="lg:hidden" onClick={toggle}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && toggle()}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-5 border-t border-slate-700 mt-auto flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;