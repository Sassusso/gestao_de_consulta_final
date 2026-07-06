import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AppLayout } from '../../components/layout/AppLayout';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Edit, Trash2, Plus } from 'lucide-react';

export const Specialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', pricePrivate: '', pricePlan: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSpecialties = async () => {
      try {
        const { data } = await api.get('/specialties');
        if (isMounted) setSpecialties(data);
      } catch {
        if (isMounted) toast.error('Erro ao carregar especialidades');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSpecialties();
    return () => { isMounted = false; };
  }, []);

  const refreshSpecialties = async () => {
    try {
      const { data } = await api.get('/specialties');
      setSpecialties(data);
    } catch {
      toast.error('Erro ao carregar especialidades');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', pricePrivate: '', pricePlan: '' });
    setShowForm(true);
  };

  const openEdit = (spec) => {
    setEditing(spec);
    setForm({
      name: spec.name,
      pricePrivate: spec.pricePrivate,
      pricePlan: spec.pricePlan,
    });
    setShowForm(true);
  };

  const openDelete = (spec) => {
    setToDelete(spec);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.pricePrivate || !form.pricePlan) {
      toast.error('Preencha todos os campos');
      return;
    }
    const payload = {
      name: form.name,
      pricePrivate: parseFloat(form.pricePrivate),
      pricePlan: parseFloat(form.pricePlan),
    };
    try {
      if (editing) {
        await api.put(`/specialties/${editing.id}`, payload);
        toast.success('Especialidade actualizada');
      } else {
        await api.post('/specialties', payload);
        toast.success('Especialidade criada');
      }
      setShowForm(false);
      refreshSpecialties();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao guardar');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/specialties/${toDelete.id}`);
      toast.success('Especialidade removida');
      refreshSpecialties();
    } catch {
      toast.error('Erro ao remover (pode ter médicos associados)');
    } finally {
      setShowDeleteModal(false);
      setToDelete(null);
    }
  };

  if (loading) return <AppLayout><div className="text-center py-10">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Especialidades Médicas</h1>
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-1" />
            Nova Especialidade
          </Button>
        </div>

        {specialties.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Nenhuma especialidade cadastrada.</p>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Particular (USD)</TableHead>
                    <TableHead>Plano (USD)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specialties.map((spec) => (
                    <TableRow key={spec.id}>
                      <TableCell className="font-medium">{spec.name}</TableCell>
                      <TableCell>USD$ {spec.pricePrivate}</TableCell>
                      <TableCell>USD$ {spec.pricePlan}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(spec)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDelete(spec)}
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

      {/* Modal de criação/edição com shadcn/ui Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Especialidade' : 'Nova Especialidade'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pricePrivate">Preço Particular (USD) *</Label>
                <Input
                  id="pricePrivate"
                  type="number"
                  step="0.01"
                  value={form.pricePrivate}
                  onChange={(e) => setForm({ ...form, pricePrivate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pricePlan">Preço Plano (USD) *</Label>
                <Input
                  id="pricePlan"
                  type="number"
                  step="0.01"
                  value={form.pricePlan}
                  onChange={(e) => setForm({ ...form, pricePlan: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                {editing ? 'Actualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Especialidade"
        message={`Tem certeza que deseja eliminar a especialidade "${toDelete?.name}"? Esta acção não pode ser desfeita.`}
      />
    </AppLayout>
  );
};