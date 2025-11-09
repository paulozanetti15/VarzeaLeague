import { useState } from 'react';
import { getUsers, deleteUser, User } from '../services/users.service';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error?.message || 'Erro ao buscar usuários');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const deleteUserById = async (userId: number) => {
    setLoading(true);
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Erro ao excluir usuário';
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    initialLoading,
    fetchUsers,
    deleteUserById,
    setUsers,
  };
};