import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AppLayout = ({ children }) => {
  const location = useLocation();
  // Determinar título da página com base na rota
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/appointments')) return 'Consultas';
    if (path.includes('/patients')) return 'Pacientes';
    if (path.includes('/doctors')) return 'Médicos';
    if (path.includes('/users')) return 'Utilizadores';
    if (path.includes('/specialties')) return 'Especialidades';
    if (path.includes('/profile')) return 'Perfil';
    if (path.includes('/notifications')) return 'Notificações';
    return 'Sistema';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header title={getTitle()} />
        <main className="flex-1 overflow-y-auto bg-content p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export { AppLayout };