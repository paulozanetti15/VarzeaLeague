import React, { useState } from 'react';
import { FaFilter, FaMoneyBillWave, FaTags, FaCalendarAlt, FaClock, FaCheckCircle, FaPlayCircle, FaUsers, FaTimesCircle } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import ClearIcon from '@mui/icons-material/Clear';

interface AdvancedFiltersModalProps {
  show: boolean;
  tempStatusFilter: string[];
  tempPriceFilter: string[];
  tempMatchDateFilter: {start?: string, end?: string};
  tempRegistrationDateFilter: {start?: string, end?: string};
  setTempStatusFilter: (filters: string[]) => void;
  setTempPriceFilter: (filters: string[]) => void;
  setTempMatchDateFilter: (filters: {start?: string, end?: string}) => void;
  setTempRegistrationDateFilter: (filters: {start?: string, end?: string}) => void;
  applyFilters: () => void;
  cancelFilters: () => void;
  clearTempFilters: () => void;
}

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  show,
  tempStatusFilter,
  tempPriceFilter,
  tempMatchDateFilter,
  tempRegistrationDateFilter,
  setTempStatusFilter,
  setTempPriceFilter,
  setTempMatchDateFilter,
  setTempRegistrationDateFilter,
  applyFilters,
  cancelFilters,
  clearTempFilters
}) => {
  if (!show) return null;

  return (
    <div className="filters-modal-overlay">
      <div className="filters-modal-content">
        <div className="filters-modal-header">
          <h3><FaFilter /> Filtros Avançados</h3>
          <button className="close-modal" onClick={cancelFilters}>
            <IoMdClose />
          </button>
        </div>

        <div className="filters-modal-body">
          {/* Filtro de Status */}
          <div className="filter-group">
            <h4><FaTags /> Status da Partida</h4>
            <div className="status-filter-options">
              <div className="filter-option">
                <input
                  type="checkbox"
                  id="status-aberta"
                  checked={tempStatusFilter.includes('aberta')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempStatusFilter([...tempStatusFilter, 'aberta']);
                    } else {
                      setTempStatusFilter(tempStatusFilter.filter(s => s !== 'aberta'));
                    }
                  }}
                />
                <label htmlFor="status-aberta">
                  <FaClock className="status-icon open" />
                  Aberta
                </label>
              </div>

              <div className="filter-option">
                <input
                  type="checkbox"
                  id="status-confirmada"
                  checked={tempStatusFilter.includes('confirmada')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempStatusFilter([...tempStatusFilter, 'confirmada']);
                    } else {
                      setTempStatusFilter(tempStatusFilter.filter(s => s !== 'confirmada'));
                    }
                  }}
                />
                <label htmlFor="status-confirmada">
                  <FaCheckCircle className="status-icon confirmed" />
                  Confirmada
                </label>
              </div>

              <div className="filter-option">
                <input
                  type="checkbox"
                  id="status-em_andamento"
                  checked={tempStatusFilter.includes('em_andamento')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempStatusFilter([...tempStatusFilter, 'em_andamento']);
                    } else {
                      setTempStatusFilter(tempStatusFilter.filter(s => s !== 'em_andamento'));
                    }
                  }}
                />
                <label htmlFor="status-em_andamento">
                  <FaPlayCircle className="status-icon in-progress" />
                  Em Andamento
                </label>
              </div>

              <div className="filter-option">
                <input
                  type="checkbox"
                  id="status-sem_vagas"
                  checked={tempStatusFilter.includes('sem_vagas')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempStatusFilter([...tempStatusFilter, 'sem_vagas']);
                    } else {
                      setTempStatusFilter(tempStatusFilter.filter(s => s !== 'sem_vagas'));
                    }
                  }}
                />
                <label htmlFor="status-sem_vagas">
                  <FaUsers className="status-icon full" />
                  Sem Vagas
                </label>
              </div>

              <div className="filter-option">
                <input
                  type="checkbox"
                  id="status-finalizada"
                  checked={tempStatusFilter.includes('finalizada')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempStatusFilter([...tempStatusFilter, 'finalizada']);
                    } else {
                      setTempStatusFilter(tempStatusFilter.filter(s => s !== 'finalizada'));
                    }
                  }}
                />
                <label htmlFor="status-finalizada">
                  <FaCheckCircle className="status-icon finished" />
                  Finalizada
                </label>
              </div>

              <div className="filter-option">
                <input
                  type="checkbox"
                  id="status-cancelada"
                  checked={tempStatusFilter.includes('cancelada')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempStatusFilter([...tempStatusFilter, 'cancelada']);
                    } else {
                      setTempStatusFilter(tempStatusFilter.filter(s => s !== 'cancelada'));
                    }
                  }}
                />
                <label htmlFor="status-cancelada">
                  <FaTimesCircle className="status-icon cancelled" />
                  Cancelada
                </label>
              </div>
            </div>
          </div>

          {/* Filtro de Preço */}
          <div className="filter-group">
            <h4><FaMoneyBillWave /> Valor da quadra</h4>
            <div className="price-filter-options">
              <div className="filter-option">
                <input
                  type="checkbox"
                  id="price-free"
                  checked={tempPriceFilter.includes('free')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempPriceFilter([...tempPriceFilter, 'free']);
                    } else {
                      setTempPriceFilter(tempPriceFilter.filter(p => p !== 'free'));
                    }
                  }}
                />
                <label htmlFor="price-free">
                  <span className="price-indicator free">R$0</span>
                  Gratuito
                </label>
              </div>

              <div className="filter-option">
                <input
                  type="checkbox"
                  id="price-paid"
                  checked={tempPriceFilter.includes('paid')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempPriceFilter([...tempPriceFilter, 'paid']);
                    } else {
                      setTempPriceFilter(tempPriceFilter.filter(p => p !== 'paid'));
                    }
                  }}
                />
                <label htmlFor="price-paid">
                  <span className="price-indicator paid">R$</span>
                  Pago
                </label>
              </div>
            </div>
          </div>

          {/* Filtro de Data da Partida */}
          <div className="filter-group">
            <h4><FaCalendarAlt /> Data da partida</h4>
            <div className="date-filter-options">
              <div className="date-input-group">
                <label htmlFor="match-date">Selecionar data</label>
                <input
                  type="date"
                  id="match-date"
                  className="date-input"
                  lang="pt-BR"
                  value={tempMatchDateFilter.start || ''}
                  onChange={(e) => setTempMatchDateFilter({start: e.target.value, end: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Filtro de Data de Inscrição */}
          <div className="filter-group">
            <h4><FaCalendarAlt /> Data de inscrição</h4>
            <div className="date-filter-options">
              <div className="date-input-group">
                <label htmlFor="registration-date">Selecionar data</label>
                <input
                  type="date"
                  id="registration-date"
                  className="date-input"
                  lang="pt-BR"
                  value={tempRegistrationDateFilter.start || ''}
                  onChange={(e) => setTempRegistrationDateFilter({start: e.target.value, end: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="filters-modal-footer">
          <button className="clear-filters-btn" onClick={clearTempFilters}>
            <ClearIcon fontSize="small" />
            Limpar filtros
          </button>
          <button className="apply-button" onClick={applyFilters}>
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};