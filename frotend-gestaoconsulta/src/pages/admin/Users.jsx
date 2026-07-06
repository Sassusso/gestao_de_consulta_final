import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AppLayout } from '../../components/layout/AppLayout';
import { UserEditModal } from '../../components/admin/UserEditModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const refreshTable = () => {
    setFilters(prev => ({ ...prev }));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters.role) params.role = filters.role;
        if (filters.status) params.status = filters.status;
        const { data } = await api.get('/users', { params });
        setUsers(data);
      } catch {
        toast.error('Erro ao carregar utilizadores');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      toast.success('Utilizador eliminado com sucesso');
      setShowDeleteModal(false);
      refreshTable();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao eliminar utilizador');
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.put(`/users/${user.id}`, { status: newStatus });
      toast.success(`Utilizador ${newStatus === 'ACTIVE' ? 'ativado' : 'desativado'}`);
      refreshTable();
    } catch {
      toast.error('Erro ao alterar status do utilizador');
    }
  };

  if (loading && users.length === 0) {
    return <AppLayout><div className="text-center py-10">A carregar utilizadores...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Utilizadores</h1>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todas as Funções</option>
            <option value="ADMIN">Admin</option>
            <option value="DOCTOR">Médico</option>
            <option value="PATIENT">Paciente</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos os Estados</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>

        {/* Tabela */}
        {users.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Nenhum utilizador encontrado.</p>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}
                          className={user.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}
                        >
                          {user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title={user.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                        >
                          {user.status === 'ACTIVE' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
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

      <UserEditModal
        key={selectedUser?.id}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        onSaved={refreshTable}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Utilizador"
        message={`Tem certeza que deseja eliminar o utilizador ${userToDelete?.name || ''}?`}
      />
    </AppLayout>
  );
};