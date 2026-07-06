import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AppLayout } from '../../components/layout/AppLayout';
import { MedicalRecordModal } from '../../components/medicalRecord/MedicalRecordModal';
import { ViewMedicalRecordModal } from '../../components/medicalRecord/ViewMedicalRecordModal';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CalendarIcon, CheckCircleIcon, ClockIcon, UsersIcon, StethoscopeIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewAppointmentId, setViewAppointmentId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const [stats, setStats] = useState({ todayAppointments: 0, todayCompleted: 0, upcomingAppointments: 0 });

  // Navegação por data
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Verifica se a data selecionada é hoje
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const doctorRes = await api.get('/doctors/me');
        const doctor = doctorRes.data;

        const [statsRes, appointmentsRes] = await Promise.all([
          api.get('/stats/doctor'),
          api.get(`/appointments/doctor/${doctor.id}`)
        ]);

        setStats(statsRes.data);
        const data = appointmentsRes.data;
        
        const selectedDayStart = new Date(selectedDate);
        selectedDayStart.setHours(0, 0, 0, 0);
        const selectedDayEnd = new Date(selectedDate);
        selectedDayEnd.setHours(23, 59, 59, 999);

        const todayList = data.filter(app => {
          const appTime = new Date(app.dateTime);
          return appTime >= selectedDayStart && appTime <= selectedDayEnd && app.status !== 'CANCELLED';
        });

        const futureList = data.filter(app => {
          const appTime = new Date(app.dateTime);
          return appTime > selectedDayEnd && app.status !== 'CANCELLED';
        });

        const sortByDate = (a, b) => new Date(a.dateTime) - new Date(b.dateTime);
        setTodayAppointments(todayList.sort(sortByDate));
        setUpcomingAppointments(futureList.sort(sortByDate));
      } catch {
        toast.error('Erro ao carregar as suas consultas');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, refreshTrigger, selectedDate]);

  const completeAppointment = async (id) => {
    try {
      await api.put(`/appointments/${id}`, { status: 'COMPLETED' });
      toast.success('Consulta concluída com sucesso!');
      handleRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao concluir consulta');
    }
  };

  const handleMedicalRecord = async (appointment) => {
    if (appointment.medicalRecord) {
      try {
        const { data } = await api.get(`/medical-records/appointment/${appointment.id}`);
        setEditingRecord(data);
        setSelectedAppointment(appointment);
        setShowFormModal(true);
      } catch {
        toast.error('Erro ao carregar o prontuário para edição');
      }
    } else {
      setEditingRecord(null);
      setSelectedAppointment(appointment);
      setShowFormModal(true);
    }
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setSelectedAppointment(null);
    setEditingRecord(null);
  };

  const onMedicalRecordSaved = () => {
    closeFormModal();
    handleRefresh();
  };

  const openViewModal = (appointmentId) => {
    setViewAppointmentId(appointmentId);
    setShowViewModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
      CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
      COMPLETED: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    const labels = {
      SCHEDULED: 'Agendada',
      CONFIRMED: 'Confirmada',
      COMPLETED: 'Concluída',
    };
    return (
      <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">A carregar agenda...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Painel Clínico</h1>
          <p className="text-gray-500 mt-1">
            Bem‑vindo, Dr(a). <span className="font-semibold text-gray-800">{user?.name}</span>
          </p>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {isToday ? 'Consultas hoje' : `Consultas em ${selectedDate.toLocaleDateString('pt-PT')}`}
                </p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <StethoscopeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Concluídas hoje</p>
                <p className="text-2xl font-bold">{stats.todayCompleted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Próximas consultas</p>
                <p className="text-2xl font-bold">{stats.upcomingAppointments}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navegação por data */}
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center">
            <span className="text-lg font-medium">
              {selectedDate.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {isToday && (
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500 align-middle" />
            )}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            <CalendarIcon className="h-4 w-4 mr-1" />
            Hoje
          </Button>
        </div>

        {/* Consultas do dia */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Consultas de {selectedDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}
          </h2>
          {todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Não tem consultas para este dia.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-800">{app.patient?.user?.name}</h3>
                          {getStatusBadge(app.status)}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <ClockIcon className="h-4 w-4" />
                          <strong>Horário:</strong> {new Date(app.dateTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Motivo:</strong> {app.reason}
                        </p>
                        {app.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            <strong>Notas:</strong> {app.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                        {app.status === 'SCHEDULED' && new Date(app.dateTime) <= new Date() && (
                          <Button
                            onClick={() => completeAppointment(app.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                        {app.status === 'COMPLETED' && (
                          <>
                            <Button
                              onClick={() => handleMedicalRecord(app)}
                              className={app.medicalRecord ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                              size="sm"
                            >
                              {app.medicalRecord ? '📝 Editar Prontuário' : '➕ Adicionar Prontuário'}
                            </Button>
                            <Button
                              onClick={() => openViewModal(app.id)}
                              variant="outline"
                              size="sm"
                            >
                              👁 Ver Prontuário
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Próximas Consultas */}
        {upcomingAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-3">Próximos Dias</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingAppointments.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <p className="font-semibold text-gray-800">{app.patient?.user?.name}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>
                        {new Date(app.dateTime).toLocaleDateString('pt-PT')} -{' '}
                        {new Date(app.dateTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      <strong>Motivo:</strong> {app.reason}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <MedicalRecordModal
        key={editingRecord?.id || 'new'}
        isOpen={showFormModal}
        onClose={closeFormModal}
        appointmentId={selectedAppointment?.id}
        existingRecord={editingRecord}
        onSaved={onMedicalRecordSaved}
      />

      <ViewMedicalRecordModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        appointmentId={viewAppointmentId}
      />
    </AppLayout>
  );
};