import { useEffect, useState } from 'react';
import api from '../services/api';
import { AppLayout } from '../components/layout/AppLayout';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '' });

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        const params = {};
        if (filter.type) params.type = filter.type;
        if (filter.status) params.status = filter.status;
        const { data } = await api.get('/notifications/me', { params });
        if (isMounted) setNotifications(data);
      } catch {
        if (isMounted) toast.error('Erro ao carregar notificações');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchNotifications();
    return () => { isMounted = false; };
  }, [filter]);

  useEffect(() => {
    const markAllAsRead = async () => {
      try {
        await api.put('/notifications/read-all');
        
      } catch (error) {
        console.error('Erro ao marcar notificações como lidas', error);
      }
    };
    if (user) {
      markAllAsRead();
    }
  }, [user]);

  const resendNotification = async (id) => {
    try {
      await api.post(`/notifications/${id}/resend`);
      toast.success('Notificação reenviada');
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, status: 'PENDING' } : n)
      );
    } catch {
      toast.error('Erro ao reenviar');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      SENT: { label: 'Enviado', color: 'bg-green-100 text-green-800' },
      FAILED: { label: 'Falhou', color: 'bg-red-100 text-red-800' },
    };
    return map[status] || { label: status, color: 'bg-gray-100' };
  };

  const getTypeLabel = (type) => {
    const map = {
      CONSULTA_CRIADA: 'Consulta Criada',
      CONSULTA_CANCELADA: 'Consulta Cancelada',
      CONSULTA_REMARCADA: 'Consulta Remarcada',
      LEMBRETE_CONSULTA: 'Lembrete',
      PAGAMENTO_CONFIRMADO: 'Pagamento Confirmado',
    };
    return map[type] || type;
  };

  if (loading) return <AppLayout><div className="text-center py-10">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notificações</h1>
            <p className="text-gray-500 text-sm">Mantenha‑se informado sobre as suas consultas</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos os tipos</option>
            <option value="CONSULTA_CRIADA">Consulta Criada</option>
            <option value="CONSULTA_CANCELADA">Consulta Cancelada</option>
            <option value="CONSULTA_REMARCADA">Consulta Remarcada</option>
            <option value="LEMBRETE_CONSULTA">Lembrete</option>
            <option value="PAGAMENTO_CONFIRMADO">Pagamento Confirmado</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos os estados</option>
            <option value="PENDING">Pendente</option>
            <option value="SENT">Enviado</option>
            <option value="FAILED">Falhou</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter({ type: '', status: '' })}
            className="text-gray-500"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        </div>

        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Nenhuma notificação encontrada.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const statusInfo = getStatusBadge(notif.status);
              return (
                <Card key={notif.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                          <Badge variant="outline" className="text-xs text-gray-500">
                            {getTypeLabel(notif.type)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>
                            <CalendarIcon className="inline h-3 w-3 mr-1" />
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {notif.status === 'FAILED' && (
                        <Button
                          onClick={() => resendNotification(notif.id)}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 whitespace-nowrap"
                        >
                          Reenviar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};