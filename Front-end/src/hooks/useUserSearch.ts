import { useState, useMemo } from 'react';
import { User } from '../services/users.service';

export interface UseUserSearchReturn {
  searchQuery: string;
  filteredUsers: User[];
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
}

export const useUserSearch = (users: User[]): UseUserSearchReturn => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.cpf.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    filteredUsers,
    handleSearchChange,
    clearSearch,
  };
};