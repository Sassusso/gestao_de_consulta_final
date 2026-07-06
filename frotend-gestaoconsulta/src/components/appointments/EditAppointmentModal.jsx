import { useState } from 'react';
import {
  Dialog, DialogContent,
  DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const EditAppointmentModal = ({ isOpen, onClose, appointment, onUpdated }) => {
  const initialDateTime = appointment ? new Date(appointment.dateTime).toISOString().slice(0, 16) : '';
  const [form, setForm] = useState({
    dateTime: initialDateTime,
    reason: appointment?.reason || '',
    notes: appointment?.notes || '',
    type: appointment?.type || 'PRIVATE',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dateTime || !form.reason) {
      toast.error('Data/hora e motivo são obrigatórios');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        dateTime: new Date(form.dateTime).toISOString(),
        reason: form.reason,
        notes: form.notes,
        type: form.type,
      };
      await api.put(`/appointments/${appointment.id}`, payload);
      toast.success('Consulta actualizada com sucesso');
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remarcar Consulta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="dateTime">Data e Hora *</Label>
              <Input
                id="dateTime"
                name="dateTime"
                type="datetime-local"
                value={form.dateTime}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="reason">Motivo *</Label>
              <textarea
                id="reason"
                name="reason"
                rows="2"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={form.reason}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                name="notes"
                rows="2"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={form.notes}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo (não editável)</Label>
              <Input
                id="type"
                value={form.type === 'PRIVATE' ? 'Particular' : 'Plano de saúde'}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'A guardar...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};