import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { EditAppointmentModal } from '../../components/appointments/EditAppointmentModal';
import { PaymentModal } from '../../components/payment/PaymentModal';
import toast from 'react-hot-toast';

// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CalendarIcon, ClockIcon, UserIcon, CreditCardIcon, Plus } from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState({ id: null, amount: null });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openPaymentModal = (paymentId, amount) => {
    setCurrentPayment({ id: paymentId, amount });
    setShowPaymentModal(true);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const patientRes = await api.get('/patients');
        const patient = patientRes.data.find(p => p.userId === user?.id) || patientRes.data[0];

        if (patient) {
          const { data } = await api.get(`/appointments/patient/${patient.id}`);
          setAppointments(data);
        }
      } catch {
        toast.error('Erro ao carregar as suas consultas');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user, refreshTrigger]);

  const cancelAppointment = async (id) => {
    if (!window.confirm('Tem a certeza que deseja cancelar esta consulta?')) return;
    try {
      await api.put(`/appointments/${id}`, { status: 'CANCELLED' });
      toast.success('Consulta cancelada com sucesso');
      handleRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao cancelar consulta');
    }
  };

  const openEditModal = (app) => {
    setSelectedAppointment(app);
    setShowEditModal(true);
  };

  // Função auxiliar para status
  const getStatusInfo = (status) => {
    const map = {
      SCHEDULED: { label: 'Agendada', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-800 border-green-200' },
      CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800 border-red-200' },
      COMPLETED: { label: 'Concluída', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  // Encontra a próxima consulta (a mais próxima com status SCHEDULED ou CONFIRMED)
  const nextAppointment = appointments
    .filter(app => app.status === 'SCHEDULED' || app.status === 'CONFIRMED')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))[0];

  // Consultas futuras
  const futureAppointments = appointments
    .filter(app => (app.status === 'SCHEDULED' || app.status === 'CONFIRMED') && app.id !== nextAppointment?.id)
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  // Consultas passadas (COMPLETED ou CANCELLED)
  const pastAppointments = appointments
    .filter(app => app.status === 'COMPLETED' || app.status === 'CANCELLED')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">A carregar consultas...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cabeçalho com título e botão */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Olá, {user?.name}</h1>
            <p className="text-gray-500 mt-1">Aqui está o resumo das suas consultas</p>
          </div>
          <Link to="/nova-consulta">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-3 sm:mt-0">
              <Plus className="h-4 w-4 mr-1" />
              Nova Consulta
            </Button>
          </Link>
        </div>

        {/* Próxima Consulta*/}
        {nextAppointment && (
          <Card className="mb-6 border-l-4 border-l-blue-600 bg-blue-50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">PRÓXIMA CONSULTA</p>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {nextAppointment.doctor?.user?.name || 'Médico'}
                    </h3>
                    <p className="text-gray-600">
                      {nextAppointment.doctor?.specialty?.name || 'Especialidade'} •{' '}
                      {new Date(nextAppointment.dateTime).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500">
                        <ClockIcon className="inline h-4 w-4 mr-1" />
                        {new Date(nextAppointment.dateTime).toLocaleTimeString('pt-PT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <Badge variant="custom" className={getStatusInfo(nextAppointment.status).color}>
                        {getStatusInfo(nextAppointment.status).label}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  {nextAppointment.type === 'PRIVATE' && nextAppointment.payment?.status === 'PENDING' && (
                    <Button
                      onClick={() => openPaymentModal(nextAppointment.payment.id, nextAppointment.amount)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <CreditCardIcon className="h-4 w-4 mr-1" />
                      Pagar
                    </Button>
                  )}
                  {nextAppointment.payment?.status === 'PAID' && (
                    <Badge variant="custom" className="bg-green-100 text-green-800 border-green-200">Pago</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Consultas Futuras */}
        {futureAppointments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Próximas Consultas</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {futureAppointments.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-semibold text-gray-800">
                        {app.doctor?.user?.name || 'Médico'}
                      </CardTitle>
                      <Badge variant="custom" className={getStatusInfo(app.status).color}>
                        {getStatusInfo(app.status).label}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 tracking-wide">
                      {app.doctor?.specialty?.name || 'Especialidade'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(app.dateTime).toLocaleDateString('pt-PT')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(app.dateTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {app.type === 'PRIVATE' ? 'Particular' : 'Plano'} • USD$ {app.amount}
                      </div>
                      {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button
                            onClick={() => openEditModal(app)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            Remarcar
                          </Button>
                          <Button
                            onClick={() => cancelAppointment(app.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Cancelar
                          </Button>
                          {app.type === 'PRIVATE' && app.payment?.status === 'PENDING' && (
                            <Button
                              onClick={() => openPaymentModal(app.payment.id, app.amount)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              <CreditCardIcon className="h-3 w-3 mr-1" />
                              Pagar
                            </Button>
                          )}
                        </div>
                      )}
                      {app.payment?.status === 'PAID' && (
                        <Badge variant="custom" className="bg-green-100 text-green-800 border-green-200 mt-2">Pago</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Consultas Passadas */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Histórico</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastAppointments.map((app) => (
                <Card key={app.id} className="transition-all hover:shadow-md border border-muted bg-white dark:bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                        {app.doctor?.user?.name || 'Médico'}
                      </CardTitle>
                      <Badge variant="custom" className={`${getStatusInfo(app.status).color} shadow-xs`}>
                        {getStatusInfo(app.status).label}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 tracking-wide">
                      {app.doctor?.specialty?.name || 'Especialidade'}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 border-t border-muted/60 pt-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400 shrink-0" />
                        <span>
                          {new Date(app.dateTime).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400 shrink-0" />
                        <span >
                          {new Date(app.dateTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm pt-1 mt-1 border-t border-dashed border-muted">
                        <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-sm">
                          {app.type === 'PRIVATE' ? 'Particular' : 'Plano'}
                        </span>
                        <div className="flex items-center gap-1 font-semibold text-primary">
                          <CreditCardIcon className="h-3.5 w-3.5 opacity-80" />
                          <span>USD$ {app.amount}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {appointments.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <CalendarIcon className="h-16 w-16 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700">Nenhuma consulta agendada</h3>
                <p className="text-gray-500">Comece por marcar a sua primeira consulta.</p>
                <Link to="/nova-consulta">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-2">
                    Nova Consulta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modais */}
      <EditAppointmentModal
        key={selectedAppointment?.id}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        appointment={selectedAppointment}
        onUpdated={handleRefresh}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentId={currentPayment.id}
        amount={currentPayment.amount}
        onPaymentSuccess={handleRefresh}
      />
    </AppLayout>
  );
};