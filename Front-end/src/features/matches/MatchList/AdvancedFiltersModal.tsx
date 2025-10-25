import React from 'react';
import { FaFilter, FaCalendarAlt, FaMoneyBillWave, FaTags } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import ClearIcon from '@mui/icons-material/Clear';

interface AdvancedFiltersModalProps {
  show: boolean;
  tempStatusFilter: string[];
  tempPriceFilter: string[];
  tempDateFilter: string[];
  setTempStatusFilter: (filters: string[]) => void;
  setTempPriceFilter: (filters: string[]) => void;
  setTempDateFilter: (filters: string[]) => void;
  applyFilters: () => void;
  cancelFilters: () => void;
  clearTempFilters: () => void;
}

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  show,
  tempStatusFilter,
  tempPriceFilter,
  tempDateFilter,
  setTempStatusFilter,
  setTempPriceFilter,
  setTempDateFilter,
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
                  <span className="status-indicator open"></span>
                  Abertas
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
                  <span className="status-indicator full"></span>
                  Finalizadas
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

          {/* Filtro de Data */}
          <div className="filter-group">
            <h4><FaCalendarAlt /> Data</h4>
            <div className="date-filter-options">
              <div className="filter-option">
                <input
                  type="checkbox"
                  id="date-today"
                  checked={tempDateFilter.includes('today')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempDateFilter([...tempDateFilter, 'today']);
                    } else {
                      setTempDateFilter(tempDateFilter.filter(d => d !== 'today'));
                    }
                  }}
                />
                <label htmlFor="date-today">
                  Hoje
                </label>
              </div>

              <div className="filter-option">
                <input
                  type="checkbox"
                  id="date-tomorrow"
                  checked={tempDateFilter.includes('tomorrow')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempDateFilter([...tempDateFilter, 'tomorrow']);
                    } else {
                      setTempDateFilter(tempDateFilter.filter(d => d !== 'tomorrow'));
                    }
                  }}
                />
                <label htmlFor="date-tomorrow">
                  Amanhã
                </label>
              </div>

              <div className="filter-option">
                <input
                  type="checkbox"
                  id="date-week"
                  checked={tempDateFilter.includes('week')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempDateFilter([...tempDateFilter, 'week']);
                    } else {
                      setTempDateFilter(tempDateFilter.filter(d => d !== 'week'));
                    }
                  }}
                />
                <label htmlFor="date-week">
                  Esta semana
                </label>
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