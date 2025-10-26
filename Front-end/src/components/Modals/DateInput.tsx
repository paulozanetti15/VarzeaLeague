import React, { useRef } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface DateInputProps {
  value: string; // dd/MM/yyyy
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, className, placeholder = 'DD/MM/AAAA' }) => {
  const hiddenRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    const el = hiddenRef.current;
    if (!el) return;
    if (value && value.length === 10) {
      const [d, m, y] = value.split('/');
      el.value = `${y}-${m}-${d}`;
    }
    const anyEl: any = el;
    if (typeof anyEl.showPicker === 'function') anyEl.showPicker(); else el.click();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className={className}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={10}
        />
        <input
          ref={hiddenRef}
          type="date"
          onChange={(e) => {
            const iso = e.target.value; if (!iso) return; const [y, m, d] = iso.split('-');
            onChange(`${d}/${m}/${y}`);
          }}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      <button
        type="button"
        aria-label="Abrir calendário"
        onClick={openPicker}
        style={{
          border: 'none',
          background: '#0d47a1',
          padding: '6px 10px',
          cursor: 'pointer',
          color: '#fff',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 40
        }}
      >
        <CalendarMonthIcon fontSize="small" />
      </button>
    </div>
  );
};

export default DateInput;
