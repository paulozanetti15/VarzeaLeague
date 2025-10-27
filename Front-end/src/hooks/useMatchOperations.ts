import { useState, useEffect } from 'react';
import { format, parse as dfParse, isAfter } from 'date-fns';
import { createMatch, searchCEP, fetchMatches, MatchFormData, Match, updateMatch, getMatch } from '../services/matchesFriendlyServices';
import { parseDDMMYYYY, toISODateTime } from '../utils/formUtils';
import { formatDateISOToBR, formatCEP, applyDateMask, applyTimeMask } from '../utils/formUtils';

interface User {
  id: number;
  token: string;
  userTypeId: number;
}

export interface UseCreateMatchReturn {
  formData: MatchFormData;
  loading: boolean;
  error: string;
  fieldErrors: {[key: string]: string};
  cepErrorMessage: string | null;
  enderecoCompleto: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateForm: () => boolean;
  handleOpenDatePicker: () => void;
  handleHiddenDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
}

export const useCreateMatch = (usuario: any): UseCreateMatchReturn => {
  const [formData, setFormData] = useState<MatchFormData>({
    title: '',
    description: '',
    location: '',
    number: '',
    date: '',
    time: '',
    duration: '',
    price: '',
    complement: '',
    city: '',
    cep: '',
    category: '',
    UF: '',
    modalidade: '',
    quadra: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [cepErrorMessage, setCepErrorMessage] = useState<string | null>(null);
  const [enderecoCompleto, setEnderecoCompleto] = useState('');

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const data = await searchCEP(cep);

      if (data.erro) {
        setCepErrorMessage('CEP não encontrado');
        return;
      }

      setFormData(prev => ({
        ...prev,
        UF: data.uf,
        city: data.localidade,
        location: data.logradouro
      }));

      const endereco = `${data.logradouro}, ${data.localidade} - ${data.uf}`;
      setEnderecoCompleto(endereco);
      setCepErrorMessage(null);
    } catch (error) {
      setCepErrorMessage('Erro ao buscar CEP');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'cep') {
      const cepFormatado = formatCEP(value);
      setFormData(prev => ({ ...prev, [name]: cepFormatado }));

      if (cepFormatado.length === 9) {
        buscarCep(cepFormatado);
      } else {
        setCepErrorMessage(null);
      }
    } else if (name === 'date') {
      const formattedDate = applyDateMask(value);
      setFormData(prev => ({ ...prev, [name]: formattedDate }));
    } else if (name === 'time' || name === 'duration') {
      const formattedTime = applyTimeMask(value);
      setFormData(prev => ({ ...prev, [name]: formattedTime }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      modalidade: value
    }));
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.title.trim()) errors.title = 'Título é obrigatório';
    if (!formData.date.trim()) errors.date = 'Data é obrigatória';
    if (!formData.time.trim()) errors.time = 'Horário é obrigatório';
    if (!(formData.duration ?? '').trim()) errors.duration = 'Duração é obrigatória';
    if (!(formData.price ?? '').trim()) errors.price = 'Preço é obrigatório';
    if (!(formData.modalidade ?? '').trim()) errors.modalidade = 'Modalidade é obrigatória';
    if (!(formData.quadra ?? '').trim()) errors.quadra = 'Nome da quadra é obrigatório';
    if (!(formData.cep ?? '').trim()) errors.cep = 'CEP é obrigatório';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const matchData = {
        ...formData,
        date: formatDateISOToBR(formData.date),
        organizerId: usuario?.id
      };

      await createMatch(matchData);
    } catch (error: any) {
      console.error('Erro ao criar partida:', error);
      setError(error.response?.data?.message || 'Erro ao criar partida');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDatePicker = () => {
    const el = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (!el) return;

    if (typeof el.showPicker === 'function') {
      el.showPicker();
    } else {
      el.click();
    }
  };

  const handleHiddenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    const br = formatDateISOToBR(iso);
    setFormData(prev => ({ ...prev, date: br }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      number: '',
      date: '',
      time: '',
      duration: '',
      price: '',
      complement: '',
      city: '',
      cep: '',
      category: '',
      UF: '',
      modalidade: '',
      quadra: ''
    });
    setError('');
    setFieldErrors({});
    setCepErrorMessage(null);
    setEnderecoCompleto('');
  };

  return {
    formData,
    loading,
    error,
    fieldErrors,
    cepErrorMessage,
    enderecoCompleto,
    handleInputChange,
    handleSelect,
    handleSubmit,
    validateForm,
    handleOpenDatePicker,
    handleHiddenDateChange,
    resetForm
  };
};

export const useMatches = (currentUser: User) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMatchesData = async () => {
    try {
      const token = currentUser.token || localStorage.getItem('token');
      if (!token) {
        setError('Usuário não autenticado');
        return;
      }

      const data = await fetchMatches();
      const onlyMine = currentUser?.id
        ? data.filter((m: Match) => m.organizerId === currentUser.id)
        : [];
      setMatches(onlyMine);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar partidas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchesData();
  }, []);

  return { matches, loading, error, refetch: fetchMatchesData };
};

// Função auxiliar para converter minutos para formato HH:MM
const convertMinutesToHHMM = (minutes: string | number): string => {
  const totalMinutes = typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;
  if (isNaN(totalMinutes) || totalMinutes < 0) return '';

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Função auxiliar para converter HH:MM para minutos
const convertHHMMToMinutes = (time: string): number => {
  if (!time || !time.includes(':')) return 0;

  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;

  return hours * 60 + minutes;
};

export const useMatchForm = (matchId?: string) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'dd/MM/yyyy'),
    time: format(new Date(), 'HH:mm'),
    duration: '',
    price: '',
    modalidade: '',
    nomequadra: ''
  });

  const [initialData, setInitialData] = useState(formData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!matchId) return;
      setLoading(true);
      try {
        const response = await getMatch(matchId);
        const match = response.data;
        console.log('Loaded match from getMatch:', match);
        if (match) {
          const formatted = {
            title: match.title || '',
            description: match.description || '',
            date: match.date ? format(new Date(match.date), 'dd/MM/yyyy') : '',
            time: match.date ? format(new Date(match.date), 'HH:mm') : '',
            duration: match.duration ? convertMinutesToHHMM(match.duration) : '',
            price: match.price ? String(match.price) : '',
            modalidade: match.modalidade || '',
            nomequadra: match.nomequadra || ''
          };
          console.log('Initial formatted data:', formatted);
          setFormData(formatted);
          setInitialData(formatted);
        }
      } catch (err) {
        setError('Erro ao carregar partida');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [matchId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'date') {
      const formattedDate = applyDateMask(value);
      setFormData(prev => ({ ...prev, [name]: formattedDate }));
    } else if (name === 'time' || name === 'duration') {
      const formattedTime = applyTimeMask(value);
      setFormData(prev => ({ ...prev, [name]: formattedTime }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateAndBuildPayload = () => {
    if (!formData.title?.trim()) return { ok: false, message: 'Título é obrigatório' };
    if (!formData.date || !formData.time) return { ok: false, message: 'Data e hora são obrigatórios' };
    if (!formData.modalidade?.trim()) return { ok: false, message: 'Modalidade é obrigatória' };
    if (!formData.nomequadra?.trim()) return { ok: false, message: 'Nome da quadra é obrigatório' };

    const parsedDate = parseDDMMYYYY(formData.date);
    if (!parsedDate) return { ok: false, message: 'Data inválida' };

    const [hours, minutes] = formData.time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
      return { ok: false, message: 'Hora inválida' };
    }

    const matchDateTime = dfParse(`${formData.date} ${formData.time}`, 'dd/MM/yyyy HH:mm', new Date());
    if (!isAfter(matchDateTime, new Date())) {
      return { ok: false, message: 'Data deve ser futura' };
    }

    if (formData.price && parseFloat(formData.price) < 0) {
      return { ok: false, message: 'Preço não pode ser negativo' };
    }

    const payload = {
      title: formData.title.trim(),
      date: toISODateTime(matchDateTime),
      description: formData.description?.trim(),
      duration: formData.duration ? convertHHMMToMinutes(formData.duration) : null,
      price: formData.price ? parseFloat(formData.price) : 0,
      nomequadra: formData.nomequadra.trim(),
      modalidade: formData.modalidade.trim()
    };

    return { ok: true, payload };
  };

  const submitForm = async (id?: string) => {
    if (!id) {
      setError('ID da partida inválido');
      return { success: false };
    }

    const validated = validateAndBuildPayload();
    if (!validated.ok) {
      setError(validated.message || 'Validação falhou');
      return { success: false };
    }

    setLoading(true);
    setError('');

    try {
      console.log('Updating match:', id, validated.payload);
      const resp = await updateMatch(id, validated.payload);
      console.log('Update response:', resp);
      console.log('Update response data:', resp?.data);
      // Reload initial data to reflect changes
      const updated = resp?.data || resp;
      console.log('Updated match data:', updated);
      if (updated) {
        const formatted = {
          title: updated.title || '',
          description: updated.description || '',
          date: updated.date ? format(new Date(updated.date), 'dd/MM/yyyy') : '',
          time: updated.date ? format(new Date(updated.date), 'HH:mm') : '',
          duration: updated.duration ? convertMinutesToHHMM(updated.duration) : '',
          price: updated.price ? String(updated.price) : '',
          modalidade: updated.modalidade || '',
          nomequadra: updated.nomequadra || ''
        };
        console.log('Formatted data:', formatted);
        setFormData(formatted);
        setInitialData(formatted);
      }

      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar partida:', err);
      const axiosErr = err as any;
      setError(axiosErr?.response?.data?.message || 'Erro ao atualizar partida');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const changed = JSON.stringify(initialData) !== JSON.stringify(formData);

  return {
    formData,
    setFormData,
    handleInputChange,
    handleSelectChange,
    loading,
    error,
    changed,
    submitForm
  };
};