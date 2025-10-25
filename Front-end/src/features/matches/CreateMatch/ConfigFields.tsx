import React from 'react';
import { MatchFormData } from '../../../../services/createMatchService';

interface ConfigFieldsProps {
  formData: MatchFormData;
  fieldErrors: {[key: string]: string};
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ConfigFields: React.FC<ConfigFieldsProps> = ({
  formData,
  fieldErrors,
  onInputChange
}) => {
  return (
    <>
      {/* Campos de configuração em grid 2 colunas */}
      <div className="form-basic-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="duration">Duração (min)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            className="form-control"
            value={formData.duration}
            onChange={onInputChange}
            placeholder="90"
            min="30"
            max="180"
            required
            style={fieldErrors.duration ? { borderColor: '#e53935' } : undefined}
          />
          {fieldErrors.duration && <span className="field-error">{fieldErrors.duration}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="quadra">Nome da Quadra</label>
          <input
            type="text"
            id="quadra"
            name="quadra"
            className="form-control"
            value={formData.quadra}
            onChange={onInputChange}
            placeholder="Nome da quadra/campo"
            required
            style={fieldErrors.quadra ? { borderColor: '#e53935' } : undefined}
          />
          {fieldErrors.quadra && <span className="field-error">{fieldErrors.quadra}</span>}
        </div>
      </div>
    </>
  );
};