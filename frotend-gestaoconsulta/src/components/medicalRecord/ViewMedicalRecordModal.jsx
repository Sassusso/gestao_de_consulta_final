import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ViewMedicalRecordModal = ({ isOpen, onClose, appointmentId }) => {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && appointmentId) {
      const fetchRecord = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/medical-records/appointment/${appointmentId}`);
          setRecord(data);
        } catch {
          toast.error('Erro ao carregar prontuário');
        } finally {
          setLoading(false);
        }
      };
      fetchRecord();
    }
  }, [isOpen, appointmentId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Prontuário Médico</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : record ? (
          <div className="space-y-3 py-2">
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Diagnóstico</h4>
              <p className="bg-gray-50 p-2 rounded text-sm">{record.diagnosis || '-'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Receita / Prescrição</h4>
              <p className="bg-gray-50 p-2 rounded text-sm">{record.prescription || '-'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Exames solicitados</h4>
              <p className="bg-gray-50 p-2 rounded text-sm">{record.requestedExams || '-'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Observações médicas</h4>
              <p className="bg-gray-50 p-2 rounded text-sm">{record.medicalNotes || '-'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Data do registo</h4>
              <p className="bg-gray-50 p-2 rounded text-sm">
                {record.recordedAt ? new Date(record.recordedAt).toLocaleString() : '-'}
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-red-500">Prontuário não encontrado.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};