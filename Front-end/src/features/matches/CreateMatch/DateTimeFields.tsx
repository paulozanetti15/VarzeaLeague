import React from 'react';
import { MatchFormData } from '../../../../services/matchesFriendlyServices';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface DateTimeFieldsProps {
  formData: MatchFormData;
  fieldErrors: {[key: string]: string};
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onOpenDatePicker: () => void;
  onHiddenDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hiddenDateInputRef: React.RefObject<HTMLInputElement>;
}

export const DateTimeFields: React.FC<DateTimeFieldsProps> = ({
  formData,
  fieldErrors,
  onInputChange,
  onOpenDatePicker,
  onHiddenDateChange,
  hiddenDateInputRef
}) => {
  return (
    <>
      {/* Campos de data em grid 2 colunas */}
      <div className="form-basic-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="date">Data</label>
          <div className="date-input-container">
            <input
              type="text"
              id="date"
              name="date"
              className="form-control date-input"
              value={formData.date}
              onChange={onInputChange}
              placeholder="Selecione a data"
              required
              maxLength={10}
              onFocus={onOpenDatePicker}
              style={fieldErrors.date ? { borderColor: '#e53935' } : undefined}
            />
            <input
              ref={hiddenDateInputRef}
              type="date"
              onChange={onHiddenDateChange}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              aria-hidden="true"
              tabIndex={-1}
            />
            <CalendarMonthIcon className="date-icon" onClick={onOpenDatePicker} />
          </div>
          {fieldErrors.date && <span className="field-error">{fieldErrors.date}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="time">Horário</label>
          <input
            type="time"
            id="time"
            name="time"
            className="form-control"
            value={formData.time}
            onChange={onInputChange}
            required
            style={fieldErrors.time ? { borderColor: '#e53935' } : undefined}
          />
          {fieldErrors.time && <span className="field-error">{fieldErrors.time}</span>}
        </div>
      </div>
    </>
  );
};