import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const DoctorModal = ({ isOpen, onClose, doctor, onSaved }) => {
  const [form, setForm] = useState({
    name: doctor?.user?.name || '',
    email: doctor?.user?.email || '',
    password: '',
    phone: doctor?.user?.phone || '',
    specialtyId: doctor?.specialtyId || doctor?.specialty?.id || '',
    medicalLicense: doctor?.medicalLicense || '',
  });
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSpecs, setLoadingSpecs] = useState(true);
  const isEdit = !!doctor;

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const { data } = await api.get('/specialties');
        setSpecialties(data);
      } catch {
        toast.error('Erro ao buscar lista de especialidades');
      } finally {
        setLoadingSpecs(false);
      }
    };
    if (isOpen) fetchSpecialties();
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!form.name || !form.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }
    if (!isEdit && !form.password) {
      toast.error('Senha é obrigatória para novo médico');
      return;
    }
    if (!form.specialtyId || !form.medicalLicense) {
      toast.error('Especialidade e licença médica são obrigatórias');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/users/${doctor.user.id}`, {
          name: form.name,
          email: form.email,
          phone: form.phone,
        });
        await api.put(`/doctors/${doctor.id}`, {
          specialtyId: form.specialtyId,
          medicalLicense: form.medicalLicense,
        });
        toast.success('Médico atualizado com sucesso');
      } else {
        await api.post('/users', {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: 'DOCTOR',
          specialtyId: form.specialtyId,
          medicalLicense: form.medicalLicense,
        });
        toast.success('Médico criado com sucesso');
      }
      if (onSaved) onSaved();
      onClose();
    } catch (error) {
    console.error("Erro completo capturado no Axios:", error);

    // TRATAMENTO DO OBJETO DE ERRO (Evita que o React crashe o ecrã)
    let mensagemExibicao = 'Erro ao processar requisição';

    if (error.response?.data) {
      const backendData = error.response.data;

      // Se o erro vier aninhado em errors: { password: "..." }
      if (backendData.errors) {
        if (typeof backendData.errors === 'object' && !Array.isArray(backendData.errors)) {
          // Extrai as mensagens do objeto de erros (Ex: "Password deve ter no mínimo 6 caracteres")
          mensagemExibicao = Object.values(backendData.errors).join(', ');
        } else if (Array.isArray(backendData.errors)) {
          mensagemExibicao = backendData.errors.map(err => err.message || JSON.stringify(err)).join(', ');
        } else {
          mensagemExibicao = String(backendData.errors);
        }
      } else if (backendData.message) {
        mensagemExibicao = backendData.message;
      } else if (backendData.error) {
        mensagemExibicao = backendData.error;
      }
    } else if (error.message) {
      mensagemExibicao = error.message;
    }

    // Exibe apenas texto puro e seguro
    toast.error(mensagemExibicao);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Médico' : 'Novo Médico'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            {!isEdit && (
              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
              </div>
            )}
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="specialtyId">Especialidade *</Label>
              <select
                id="specialtyId"
                name="specialtyId"
                value={form.specialtyId}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                required
                disabled={loadingSpecs}
              >
                <option value="">{loadingSpecs ? 'A carregar...' : 'Selecione uma especialidade...'}</option>
                {specialties.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="medicalLicense">Licença Médica (CRM) *</Label>
              <Input id="medicalLicense" name="medicalLicense" value={form.medicalLicense} onChange={handleChange} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} >Cancelar</Button>
            <Button type="submit" disabled={loading || loadingSpecs} className={`${loading ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
              {loading ? 'A guardar...' : (isEdit ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};