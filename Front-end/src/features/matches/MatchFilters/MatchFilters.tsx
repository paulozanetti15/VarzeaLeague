import React from 'react';
import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Divider, TextField, Grid, Chip, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { format, parse, parseISO } from 'date-fns';
import './MatchFilters.css';

type StatusOption = { value: string; label: string };

type Filters = {
  search?: string;
  from?: string;
  to?: string;
  type?: string;
  statuses?: string[];
  sort?: string;
};

interface MatchFiltersProps {
  filters: Filters & { statuses: string[] };
  onChange: (next: any) => void;
  onClear: () => void;
  onApply?: () => void;
  defaultStatuses?: StatusOption[];
}

const MatchFilters: React.FC<MatchFiltersProps> = ({ filters, onChange, onClear, onApply, defaultStatuses = [] }) => {
  const [sortOpen, setSortOpen] = React.useState(false);
  const [fromInput, setFromInput] = useState<string>(filters.from ? format(parseISO(filters.from), 'dd/MM/yyyy') : '');
  const [toInput, setToInput] = useState<string>(filters.to ? format(parseISO(filters.to), 'dd/MM/yyyy') : '');

  useEffect(() => {
    setFromInput(filters.from ? format(parseISO(filters.from), 'dd/MM/yyyy') : '');
  }, [filters.from]);

  useEffect(() => {
    setToInput(filters.to ? format(parseISO(filters.to), 'dd/MM/yyyy') : '');
  }, [filters.to]);
  return (
    <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, bgcolor: '#fff', color: 'text.secondary' }}>
      <Typography variant="h6" mb={1} color="text.secondary">Filtros</Typography>
      <Divider sx={{ mb: 2 }} />
      <TextField
        fullWidth
        label="Buscar"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        sx={{ mb: 2 }}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <DatePicker
              label="De"
              value={fromInput ? parse(fromInput, 'dd/MM/yyyy', new Date()) : null}
              onChange={(newVal: Date | null) => {
                if (!newVal) { setFromInput(''); onChange({ ...filters, from: '' }); return; }
                newVal.setHours(12, 0, 0, 0);
                const iso = format(newVal, "yyyy-MM-dd'T'HH:mm:ss");
                setFromInput(format(newVal, 'dd/MM/yyyy'));
                onChange({ ...filters, from: iso });
              }}
              slotProps={{
                textField: { fullWidth: true },
                popper: { sx: { zIndex: 3000 }, className: 'matchfilters-datepicker-popper' as any }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              label="Até"
              value={toInput ? parse(toInput, 'dd/MM/yyyy', new Date()) : null}
              onChange={(newVal: Date | null) => {
                if (!newVal) { setToInput(''); onChange({ ...filters, to: '' }); return; }
                newVal.setHours(12, 0, 0, 0);
                const iso = format(newVal, "yyyy-MM-dd'T'HH:mm:ss");
                setToInput(format(newVal, 'dd/MM/yyyy'));
                onChange({ ...filters, to: iso });
              }}
              slotProps={{
                textField: { fullWidth: true },
                popper: { sx: { zIndex: 3000 }, className: 'matchfilters-datepicker-popper' as any }
              }}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          color="primary"
          value={filters.type}
          exclusive
          onChange={(_e: React.MouseEvent<HTMLElement>, val: string | null) => { if (val !== null) onChange({ ...filters, type: String(val) }); }}
          aria-label="Tipo de listagem"
        >
          <ToggleButton value="both">Ambos</ToggleButton>
          <ToggleButton value="matches">Partidas</ToggleButton>
          <ToggleButton value="championships">Campeonatos</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>Status</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', rowGap: '10px', alignItems: 'center' }}>
          {defaultStatuses.map(s => (
            <Chip
              key={s.value}
              label={s.label}
              clickable
              size="small"
              color={filters.statuses.includes(s.value) ? 'primary' : 'default'}
              onClick={() => onChange({ ...filters, statuses: filters.statuses.includes(s.value) ? filters.statuses.filter((x: string) => x !== s.value) : [...filters.statuses, s.value] })}
              sx={{ borderRadius: '16px', padding: '6px 10px', textTransform: 'none' }}
            />
          ))}
        </Box>
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="sort-select-label">Ordenar</InputLabel>
        <Select
          labelId="sort-select-label"
          value={filters.sort}
          label="Ordenar"
          onChange={(e) => onChange({ ...filters, sort: String(e.target.value) })}
          MenuProps={{ PaperProps: { sx: { zIndex: 4000, bgcolor: 'background.paper', boxShadow: 3 } } }}
          onOpen={() => setSortOpen(true)}
          onClose={() => setSortOpen(false)}
        >
          <MenuItem value="date_desc">Data (mais recente)</MenuItem>
          <MenuItem value="date_asc">Data (mais antiga)</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" fullWidth onClick={() => onApply?.()} sx={{ mb: 1, display: sortOpen ? 'none' : 'block' }}>
        Aplicar
      </Button>
      <Button variant="text" fullWidth onClick={onClear}>
        Limpar filtros
      </Button>
    </Paper>
  );
};

export default MatchFilters;
