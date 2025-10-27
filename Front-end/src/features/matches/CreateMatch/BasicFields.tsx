import React from 'react';
import { MatchFormData } from '../../../../services/matchesFriendlyServices';

interface BasicFieldsProps {
  formData: MatchFormData;
  fieldErrors: {[key: string]: string};
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const BasicFields: React.FC<BasicFieldsProps> = ({
  formData,
  fieldErrors,
  onInputChange,
  onSelectChange
}) => {
  return (
    <>
      {/* Campos básicos em grid 2 colunas */}
      <div className="form-basic-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="title">Título da Partida</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={onInputChange}
            placeholder="Digite o título da partida"
            required
            style={fieldErrors.title ? { borderColor: '#e53935' } : undefined}
          />
          {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="modalidade">Modalidade</label>
          <select
            id="modalidade"
            name="modalidade"
            className="form-control"
            value={formData.modalidade}
            onChange={onSelectChange}
            required
            style={fieldErrors.modalidade ? { borderColor: '#e53935' } : undefined}
          >
            <option value="">Selecione a modalidade</option>
            <option value="Fut7">Fut7</option>
            <option value="Futsal">Futsal</option>
            <option value="Futebol campo">Futebol campo</option>
          </select>
          {fieldErrors.modalidade && <span className="field-error">{fieldErrors.modalidade}</span>}
        </div>
      </div>
    </>
  );
};