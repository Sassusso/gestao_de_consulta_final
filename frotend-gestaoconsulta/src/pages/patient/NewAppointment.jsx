import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { CalendarIcon, ClockIcon, UserIcon, StethoscopeIcon, CheckCircleIcon, ArrowLeft, ArrowRight } from 'lucide-react';

// Schema de validação
const appointmentSchema = z.object({
  specialtyId: z.string().min(1, 'Selecione uma especialidade'),
  doctorId: z.string().min(1, 'Selecione um médico'),
  dateTime: z.string().min(1, 'Data e hora são obrigatórias'),
  reason: z.string().min(5, 'Motivo deve ter pelo menos 5 caracteres'),
  notes: z.string().optional(),
  type: z.enum(['PRIVATE', 'PLAN']),
});

const STEPS = [
  { id: 1, label: 'Especialidade', icon: StethoscopeIcon },
  { id: 2, label: 'Médico', icon: UserIcon },
  { id: 3, label: 'Data e Hora', icon: CalendarIcon },
  { id: 4, label: 'Detalhes', icon: ClockIcon },
  { id: 5, label: 'Confirmar', icon: CheckCircleIcon },
];

export const NewAppointment = () => {
  const [specialties, setSpecialties] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      type: 'PRIVATE',
      specialtyId: '',
      doctorId: '',
      dateTime: '',
      reason: '',
      notes: '',
    },
  });

  const watchSpecialtyId = watch('specialtyId');
  const watchType = watch('type');
  const watchDoctorId = watch('doctorId');
  const watchDateTime = watch('dateTime');
  const watchReason = watch('reason');
  const watchNotes = watch('notes');

  // Carregar especialidades e médicos
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [specsRes, docsRes] = await Promise.all([
          api.get('/specialties'),
          api.get('/doctors'),
        ]);
        setSpecialties(specsRes.data);
        setAllDoctors(docsRes.data);
      } catch {
        toast.error('Erro ao carregar dados de agendamento');
      }
    };
    loadInitialData();
  }, []);

  // Filtrar médicos por especialidade e calcular preço
  useEffect(() => {
    if (watchSpecialtyId) {
      const docs = allDoctors.filter(
        (doc) => doc.specialtyId === watchSpecialtyId || doc.specialty?.id === watchSpecialtyId
      );
      setFilteredDoctors(docs);
      setValue('doctorId', '');
      const spec = specialties.find((s) => s.id === watchSpecialtyId);
      if (spec) {
        setSelectedPrice(watchType === 'PRIVATE' ? spec.pricePrivate : spec.pricePlan);
      } else {
        setSelectedPrice(null);
      }
    } else {
      setFilteredDoctors([]);
      setSelectedPrice(null);
    }
  }, [watchSpecialtyId, watchType, allDoctors, specialties, setValue]);

  // Navegação entre passos
  const goToNextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Validação do passo atual (para avançar)
  const validateStep = () => {
    const values = getValues();
    if (currentStep === 1 && !values.specialtyId) {
      toast.error('Selecione uma especialidade');
      return false;
    }
    if (currentStep === 2 && !values.doctorId) {
      toast.error('Selecione um médico');
      return false;
    }
    if (currentStep === 3 && !values.dateTime) {
      toast.error('Selecione data e hora');
      return false;
    }
    if (currentStep === 4 && (!values.reason || values.reason.length < 5)) {
      toast.error('Motivo deve ter pelo menos 5 caracteres');
      return false;
    }
    return true;
  };

  const handleStepClick = (step) => {
    // Permite ir para passos anteriores, mas não para a frente sem validação
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step === currentStep + 1) {
      if (validateStep()) goToNextStep();
    } else {
      toast.error('Complete os passos anteriores primeiro');
    }
  };

  // Submissão final (passo 5)
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const patientRes = await api.get('/patients');
      const patient = patientRes.data[0];
      if (!patient) {
        toast.error('Perfil de paciente não encontrado. Atualize o seu Perfil primeiro.');
        navigate('/perfil');
        return;
      }
      const payload = {
        patientId: patient.id,
        doctorId: data.doctorId,
        dateTime: new Date(data.dateTime).toISOString(),
        type: data.type,
        amount: Number(selectedPrice) || 0,
        reason: data.reason,
        notes: data.notes,
      };
      await api.post('/appointments', payload);
      toast.success(`Consulta ${data.type === 'PRIVATE' ? 'particular' : 'de plano'} agendada com sucesso!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao agendar consulta');
    } finally {
      setLoading(false);
    }
  };

  // Renderiza o conteúdo de cada passo
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Selecione a especialidade</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specialties.map((spec) => (
                <Card
                  key={spec.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    watchSpecialtyId === spec.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setValue('specialtyId', spec.id)}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    <StethoscopeIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">{spec.name}</p>
                      <p className="text-sm text-gray-500">
                        {spec.pricePrivate} USD / {spec.pricePlan} USD (plano)
                      </p>
                    </div>
                    {watchSpecialtyId === spec.id && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-600 ml-auto" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Selecione o médico</h3>
            {filteredDoctors.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {watchSpecialtyId ? 'Nenhum médico disponível para esta especialidade.' : 'Selecione primeiro uma especialidade.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDoctors.map((doc) => (
                  <Card
                    key={doc.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      watchDoctorId === doc.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setValue('doctorId', doc.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-800">{doc.user?.name}</p>
                          <p className="text-sm text-gray-500">Licença: {doc.medicalLicense}</p>
                        </div>
                        {watchDoctorId === doc.id && (
                          <CheckCircleIcon className="h-5 w-5 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Escolha a data e hora</h3>
            <div className="max-w-md">
              <Label htmlFor="dateTime" className="text-sm font-medium text-gray-700">
                Data e Hora *
              </Label>
              <Input
                id="dateTime"
                type="datetime-local"
                className="mt-1"
                {...register('dateTime')}
              />
              {errors.dateTime && (
                <p className="text-sm text-red-500 mt-1">{errors.dateTime.message}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Detalhes da consulta</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Tipo de Consulta
                </Label>
                <select
                  id="type"
                  className="w-full mt-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  {...register('type')}
                >
                  <option value="PRIVATE">Particular</option>
                  <option value="PLAN">Plano de Saúde</option>
                </select>
              </div>

              <div>
                <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                  Motivo principal *
                </Label>
                <textarea
                  id="reason"
                  rows="3"
                  className="w-full mt-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  placeholder="Ex: Dores de cabeça frequentes e tonturas..."
                  {...register('reason')}
                />
                {errors.reason && (
                  <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Observações adicionais (opcional)
                </Label>
                <textarea
                  id="notes"
                  rows="2"
                  className="w-full mt-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  placeholder="Se necessário, adicione observações..."
                  {...register('notes')}
                />
              </div>

              {selectedPrice !== null && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">Valor estimado</p>
                    <p className="text-2xl font-bold text-blue-800">USD$ {selectedPrice.toFixed(2)}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Confirmar agendamento</h3>
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Especialidade</span>
                  <span className="font-medium">{specialties.find(s => s.id === watchSpecialtyId)?.name || '-'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Médico</span>
                  <span className="font-medium">
                    {allDoctors.find(d => d.id === watchDoctorId)?.user?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Data e Hora</span>
                  <span className="font-medium">
                    {watchDateTime ? new Date(watchDateTime).toLocaleString('pt-PT') : '-'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Tipo</span>
                  <span className="font-medium">{watchType === 'PRIVATE' ? 'Particular' : 'Plano'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Motivo</span>
                  <span className="font-medium">{watchReason || '-'}</span>
                </div>
                {watchNotes && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Observações</span>
                    <span className="font-medium">{watchNotes}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-blue-800">USD$ {selectedPrice?.toFixed(2) || '0.00'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Agendar Nova Consulta</CardTitle>
            {/* Barra de progresso */}
            <div className="flex items-center justify-between mt-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center w-full">
                  <div className="flex flex-col items-center flex-1">
                    <button
                      type="button"
                      onClick={() => handleStepClick(step.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        currentStep === step.id
                          ? 'bg-blue-600 text-white'
                          : currentStep > step.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      }`}
                    >
                      {currentStep > step.id ? <CheckCircleIcon className="h-5 w-5" /> : step.id}
                    </button>
                    <span className="text-xs mt-1 text-gray-500 hidden sm:block">{step.label}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`h-1 flex-1 mx-1 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {/* Conteúdo do passo actual */}
            <div className="min-h-[240px]">{renderStep()}</div>

            {/* Navegação entre passos */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <div>
                <span className="text-sm text-gray-500 mr-4">
                  Passo {currentStep} de {STEPS.length}
                </span>
                {currentStep === STEPS.length ? (
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? 'A agendar...' : 'Confirmar Agendamento'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      if (validateStep()) goToNextStep();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};