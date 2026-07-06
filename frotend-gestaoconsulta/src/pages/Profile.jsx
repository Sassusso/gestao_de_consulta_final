import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { User, Mail, Phone, Calendar, MapPin, PhoneCall } from 'lucide-react';

export const Profile = () => {
  const { user, updateUserData } = useAuth();

  const [form, setForm] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }));

  const [isPatient] = useState(() => user?.role === 'PATIENT');
  const [loading, setLoading] = useState(false);
  const [additionalData, setAdditionalData] = useState({
    id: '',
    dateOfBirth: '',
    sex: '',
    address: '',
    emergencyPhone: '',
  });

  useEffect(() => {
    if (user && user.role === 'PATIENT') {
      api.get('/patients')
        .then(res => {
          const patient = res.data && res.data.length > 0 ? res.data[0] : null;
          if (patient) {
            setAdditionalData({
              id: patient.id,
              dateOfBirth: patient.dateOfBirth?.split('T')[0] || '',
              sex: patient.sex || '',
              address: patient.address || '',
              emergencyPhone: patient.emergencyPhone || '',
            });
          }
        })
        .catch(() => toast.error('Erro ao carregar dados de paciente'));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/users/${user.id}`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
      });
      const updatedUser = { ...user, name: form.name, email: form.email, phone: form.phone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (updateUserData) updateUserData(updatedUser);
      toast.success('Perfil actualizado');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    try {
      if (additionalData.id) {
        const { id, ...payload } = additionalData;
        await api.put(`/patients/${id}`, payload);
        toast.success('Dados adicionais actualizados');
      } else {
        toast.error('Paciente não encontrado para atualização');
      }
    } catch {
      toast.error('Erro ao actualizar dados');
    }
  };

  if (!user) {
    return <div className="text-center p-6">A carregar dados do utilizador...</div>;
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar e informações rápidas */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="bg-blue-600 text-white text-2xl uppercase">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold text-gray-800">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                  {user.role}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Formulários */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Dados Básicos</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? 'A guardar...' : 'Actualizar Perfil'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {isPatient && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Dados Pessoais</h3>
                  <form onSubmit={handlePatientSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={additionalData.dateOfBirth}
                          onChange={(e) => setAdditionalData({ ...additionalData, dateOfBirth: e.target.value })}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="sex">Sexo</Label>
                      <select
                        id="sex"
                        value={additionalData.sex}
                        onChange={(e) => setAdditionalData({ ...additionalData, sex: e.target.value })}
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Seleccione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          value={additionalData.address}
                          onChange={(e) => setAdditionalData({ ...additionalData, address: e.target.value })}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Contacto de Emergência</Label>
                      <div className="relative">
                        <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="emergencyPhone"
                          value={additionalData.emergencyPhone}
                          onChange={(e) => setAdditionalData({ ...additionalData, emergencyPhone: e.target.value })}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Actualizar Dados Adicionais
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};