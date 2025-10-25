import { useState } from 'react';

export const useFilters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string[]>([]);
  const [tempStatusFilter, setTempStatusFilter] = useState<string[]>([]);
  const [tempPriceFilter, setTempPriceFilter] = useState<string[]>([]);
  const [tempDateFilter, setTempDateFilter] = useState<string[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const applyFilters = () => {
    setStatusFilter([...tempStatusFilter]);
    setPriceFilter([...tempPriceFilter]);
    setDateFilter([...tempDateFilter]);
  };

  const cancelFilters = () => {
    // Reset temp filters
    setTempStatusFilter([...statusFilter]);
    setTempPriceFilter([...priceFilter]);
    setTempDateFilter([...dateFilter]);
  };

  const clearTempFilters = () => {
    setTempStatusFilter([]);
    setTempPriceFilter([]);
    setTempDateFilter([]);
  };

  const openFiltersModal = () => {
    setTempStatusFilter([...statusFilter]);
    setTempPriceFilter([...priceFilter]);
    setTempDateFilter([...dateFilter]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter.length > 0) count++;
    if (priceFilter.length > 0) count++;
    if (dateFilter.length > 0) count++;
    return count;
  };

  const clearAllFilters = () => {
    setStatusFilter([]);
    setPriceFilter([]);
    setDateFilter([]);
  };

  return {
    searchQuery,
    statusFilter,
    priceFilter,
    dateFilter,
    tempStatusFilter,
    tempPriceFilter,
    tempDateFilter,
    setTempStatusFilter,
    setTempPriceFilter,
    setTempDateFilter,
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