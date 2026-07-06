import { useAuth } from '../../hooks/useAuth';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';

const Header = ({ title }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
  
    if (!user) return;

    let isMounted = true;

    const getCount = async () => {
      try {
        const { data } = await api.get('/notifications/unread-count');
        if (isMounted) {
          setUnreadCount(data.unread);
        }
      } catch {
        if (isMounted) {
          setUnreadCount(0);
        }
      }
    };

    getCount();

    const interval = setInterval(getCount, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleOpenChange = async (open) => {
    setIsOpen(open);
    
    if (open && unreadCount > 0) {
      try {
        await api.put('/notifications/read-all');
        setUnreadCount(0); 
      } catch (error) {
        console.error("Erro ao marcar notificações como lidas", error);
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

        <div className="flex items-center gap-4">
          {/* Notificações */}
          <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative"
                >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs p-0 border-2 border-white hover:bg-red-500"                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-60 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                  <span className="font-medium text-sm">Consulta agendada</span>
                  <p>
                    {unreadCount === 0 ? "Não tem notificações novas." : `Tinha ${unreadCount} notificações por ler.`}                
                  </p>
                </DropdownMenuItem>
                {/* Mais itens... */}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/notifications" className="text-center text-primary text-sm">
                  Ver todas
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Avatar do Utilizador */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-primary text-white uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{user?.name}</span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;