import { useEffect, useState } from 'react';
import api from '../../services/api';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Stethoscope, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    doctors: 0,
    specialties: 0,
    users: 0,
    appointmentsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get('/stats/admin');
        setStats({
          doctors: data.totalDoctors,
          specialties: data.totalSpecialties,
          users: data.totalUsers,
          appointmentsToday: data.todayAppointments,
        });
      } catch {
        // não mostra erro para não sobrecarregar
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">A carregar estatísticas...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-500 mt-1">Visão geral do sistema</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Médicos</CardTitle>
              <Stethoscope className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.doctors}</div>
              <p className="text-xs text-gray-500">Cadastrados no sistema</p>
              <Link to="/admin/doctors">
                <Button variant="link" className="p-0 h-auto text-blue-600 mt-2">
                  Gerir médicos →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Especialidades</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.specialties}</div>
              <p className="text-xs text-gray-500">Áreas médicas disponíveis</p>
              <Link to="/admin/specialties">
                <Button variant="link" className="p-0 h-auto text-blue-600 mt-2">
                  Gerir especialidades →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Utilizadores</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
              <p className="text-xs text-gray-500">Contas activas</p>
              <Link to="/admin/users">
                <Button variant="link" className="p-0 h-auto text-blue-600 mt-2">
                  Gerir utilizadores →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Consultas Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appointmentsToday}</div>
              <p className="text-xs text-gray-500">Agendadas para hoje</p>
              <Link to="/appointments">
                <Button variant="link" className="p-0 h-auto text-blue-600 mt-2">
                  Ver todas →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Mensagem adicional (opcional) */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Utilize os links acima para aceder à gestão detalhada de cada área.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};