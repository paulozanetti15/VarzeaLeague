import { useState } from 'react';

export const useFilters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [matchDateFilter, setMatchDateFilter] = useState<{start?: string, end?: string}>({});
  const [registrationDateFilter, setRegistrationDateFilter] = useState<{start?: string, end?: string}>({});
  const [tempStatusFilter, setTempStatusFilter] = useState<string[]>([]);
  const [tempPriceFilter, setTempPriceFilter] = useState<string[]>([]);
  const [tempMatchDateFilter, setTempMatchDateFilter] = useState<{start?: string, end?: string}>({});
  const [tempRegistrationDateFilter, setTempRegistrationDateFilter] = useState<{start?: string, end?: string}>({});

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const applyFilters = () => {
    setStatusFilter([...tempStatusFilter]);
    setPriceFilter([...tempPriceFilter]);
    setMatchDateFilter({...tempMatchDateFilter});
    setRegistrationDateFilter({...tempRegistrationDateFilter});
  };

  const cancelFilters = () => {
    // Reset temp filters
    setTempStatusFilter([...statusFilter]);
    setTempPriceFilter([...priceFilter]);
    setTempMatchDateFilter({...matchDateFilter});
    setTempRegistrationDateFilter({...registrationDateFilter});
  };

  const clearTempFilters = () => {
    setTempStatusFilter([]);
    setTempPriceFilter([]);
    setTempMatchDateFilter({});
    setTempRegistrationDateFilter({});
  };

  const openFiltersModal = () => {
    setTempStatusFilter([...statusFilter]);
    setTempPriceFilter([...priceFilter]);
    setTempMatchDateFilter({...matchDateFilter});
    setTempRegistrationDateFilter({...registrationDateFilter});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter.length > 0) count++;
    if (priceFilter.length > 0) count++;
    if (matchDateFilter.start) count++;
    if (registrationDateFilter.start) count++;
    return count;
  };

  const clearAllFilters = () => {
    setStatusFilter([]);
    setPriceFilter([]);
    setMatchDateFilter({});
    setRegistrationDateFilter({});
  };

  return {
    searchQuery,
    statusFilter,
    priceFilter,
    matchDateFilter,
    registrationDateFilter,
    tempStatusFilter,
    tempPriceFilter,
    tempMatchDateFilter,
    tempRegistrationDateFilter,
    setTempStatusFilter,
    setTempPriceFilter,
    setTempMatchDateFilter,
    setTempRegistrationDateFilter,
    handleSearchChange,
    clearSearch,
    applyFilters,
    cancelFilters,
    clearTempFilters,
    openFiltersModal,
    getActiveFiltersCount,
    clearAllFilters
  };
};