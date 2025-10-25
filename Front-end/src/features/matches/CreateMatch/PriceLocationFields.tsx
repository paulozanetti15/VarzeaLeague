import React from 'react';
import { MatchFormData } from '../../../../services/matchesFriendlyServices';

interface PriceLocationFieldsProps {
  formData: MatchFormData;
  fieldErrors: {[key: string]: string};
  cepErrorMessage: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const PriceLocationFields: React.FC<PriceLocationFieldsProps> = ({
  formData,
  fieldErrors,
  cepErrorMessage,
  onInputChange
}) => {
  return (
    <>
      {/* Campos de preço e localização em grid 2 colunas */}
      <div className="form-basic-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="price">Preço por Jogador (R$)</label>
          <input
            type="number"
            id="price"
            name="price"
            className="form-control"
            value={formData.price}
            onChange={onInputChange}
            placeholder="0,00"
            min="0"
            step="0.01"
            required
            style={fieldErrors.price ? { borderColor: '#e53935' } : undefined}
          />
          {fieldErrors.price && <span className="field-error">{fieldErrors.price}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="cep">CEP</label>
          <input
            type="text"
            id="cep"
            name="cep"
            pattern='[0-9]{5}-?[0-9]{3}'
            maxLength={9}
            value={formData.cep}
            onChange={onInputChange}
            className="form-control"
            placeholder="00000-000"
            required
            style={fieldErrors.cep ? { borderColor: '#e53935' } : undefined}
          />
          {fieldErrors.cep && <span className="field-error">{fieldErrors.cep}</span>}
          {cepErrorMessage && (
            <div className="error-message">
              {cepErrorMessage}
            </div>
          )}
        </div>
      </div>
    </>
  );
};