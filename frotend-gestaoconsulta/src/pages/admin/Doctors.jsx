import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AppLayout } from '../../components/layout/AppLayout';
import { DoctorModal } from '../../components/admin/DoctorModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  const refreshDoctors = async () => {
    try {
      const { data } = await api.get('/doctors');
      setDoctors(data);
    } catch {
      toast.error('Erro ao carregar médicos');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await refreshDoctors();
      setLoading(false);
    };
    loadData();
  }, []);

  const openCreateModal = () => {
    setSelectedDoctor(null);
    setShowFormModal(true);
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowFormModal(true);
  };

  const openDeleteModal = (doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!doctorToDelete) return;
    try {
      await api.delete(`/doctors/${doctorToDelete.id}`);
      toast.success('Médico removido com sucesso');
      await refreshDoctors();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao remover');
    } finally {
      setShowDeleteModal(false);
      setDoctorToDelete(null);
    }
  };

  if (loading) return <AppLayout><div className="text-center py-10">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestão de Médicos</h1>
            <p className="text-gray-500 text-sm">Gerir os profissionais de saúde do sistema</p>
          </div>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-1" />
            Novo Médico
          </Button>
        </div>

        {doctors.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Nenhum médico cadastrado.</p>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Licença</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.user?.name}</TableCell>
                      <TableCell>{doc.user?.email}</TableCell>
                      <TableCell>{doc.user?.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {doc.specialty?.name || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.medicalLicense}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(doc)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(doc)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <DoctorModal
        key={selectedDoctor?.id || 'new'}
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        doctor={selectedDoctor}
        onSaved={refreshDoctors}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Médico"
        message={`Tem certeza que deseja eliminar o médico ${doctorToDelete?.user?.name}?`}
      />
    </AppLayout>
  );
};