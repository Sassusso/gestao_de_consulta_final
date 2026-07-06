import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  Tag,
  UserCog,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils'; 

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  // Itens do menu baseados no role
  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ];

    if (user?.role === 'PATIENT') {
      baseItems.push(
        { path: '/appointments', icon: CalendarDays, label: 'Consultas' },
        { path: '/notifications', icon: Bell, label: 'Notificações' },
        { path: '/profile', icon: User, label: 'Perfil' }
      );
    } else if (user?.role === 'DOCTOR') {
      baseItems.push(
        
        { path: '/appointments', icon: CalendarDays, label: 'Agenda' },
        { path: '/doctor/patients', icon: Users, label: 'Pacientes' },
        { path: '/notifications', icon: Bell, label: 'Notificações' },
        { path: '/profile', icon: User, label: 'Perfil' }
      );
    } else if (user?.role === 'ADMIN') {
      baseItems.push(
        { path: '/admin/doctors', icon: Stethoscope, label: 'Médicos' },
        { path: '/admin/users', icon: UserCog, label: 'Utilizadores' },
        { path: '/admin/specialties', icon: Tag, label: 'Especialidades' },
        { path: '/notifications', icon: Bell, label: 'Notificações' },
        { path: '/profile', icon: User, label: 'Perfil' }
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-primary text-white transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-primary-light/30">
            <Link to="/dashboard" className="text-xl font-bold">
              Sassus Medical
            </Link>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-light/20 text-white'
                      : 'text-white/70 hover:bg-primary-light/10 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-primary-light/30">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:bg-primary-light/10 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;