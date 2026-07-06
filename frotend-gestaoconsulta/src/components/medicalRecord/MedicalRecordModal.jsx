import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const MedicalRecordModal = ({ isOpen, onClose, appointmentId, existingRecord, onSaved }) => {
  const [form, setForm] = useState({
    diagnosis: existingRecord?.diagnosis || '',
    prescription: existingRecord?.prescription || '',
    requestedExams: existingRecord?.requestedExams || '',
    medicalNotes: existingRecord?.medicalNotes || '',
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!existingRecord?.id;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis.trim()) {
      toast.error('Diagnóstico é obrigatório');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/medical-records/${existingRecord.id}`, form);
        toast.success('Prontuário actualizado');
      } else {
        await api.post('/medical-records', { appointmentId, ...form });
        toast.success('Prontuário criado');
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Prontuário' : 'Novo Prontuário'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="diagnosis">Diagnóstico *</Label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                rows="3"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={form.diagnosis}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="prescription">Receita / Prescrição</Label>
              <textarea
                id="prescription"
                name="prescription"
                rows="3"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={form.prescription}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="requestedExams">Exames solicitados</Label>
              <textarea
                id="requestedExams"
                name="requestedExams"
                rows="2"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={form.requestedExams}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="medicalNotes">Observações médicas</Label>
              <textarea
                id="medicalNotes"
                name="medicalNotes"
                rows="2"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={form.medicalNotes}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'A guardar...' : (isEdit ? 'Actualizar' : 'Guardar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};