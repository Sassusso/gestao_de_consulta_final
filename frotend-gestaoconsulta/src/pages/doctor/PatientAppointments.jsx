import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {  ClockIcon, ArrowLeft } from 'lucide-react';

export const PatientAppointments = () => {
  const { patientId } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/appointments/patient/${patientId}`);
        setAppointments(data);
        if (data.length > 0 && data[0].patient?.user) {
          setPatientName(data[0].patient.user.name);
        }
      } catch {
        toast.error('Erro ao carregar consultas do paciente');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const getStatusBadge = (status) => {
    const map = {
      SCHEDULED: { label: 'Agendada', color: 'bg-blue-100 text-blue-800' },
      CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
      COMPLETED: { label: 'Concluída', color: 'bg-gray-100 text-gray-800' },
    };
    const info = map[status] || { label: status, color: 'bg-gray-100' };
    return <Badge className={info.color}>{info.label}</Badge>;
  };

  if (loading) return <AppLayout><div className="text-center py-10">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/doctor/patients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Consultas de {patientName || 'Paciente'}
          </h1>
        </div>

        {appointments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Este paciente não tem consultas registadas.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {appointments.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {new Date(app.dateTime).toLocaleDateString('pt-PT')}
                        </span>
                        <span className="text-sm text-gray-500">
                          <ClockIcon className="inline h-3 w-3 mr-1" />
                          {new Date(app.dateTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1"><strong>Motivo:</strong> {app.reason}</p>
                      <p className="text-sm text-gray-500">
                        <strong>Médico:</strong> {app.doctor?.user?.name}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {app.type === 'PRIVATE' ? 'Particular' : 'Plano'} • USD$ {app.amount}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};