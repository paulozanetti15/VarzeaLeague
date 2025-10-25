import { useState } from 'react';
import { format } from 'date-fns';
import { createMatch, searchCEP, MatchFormData } from '../services/matchesFriendlyServices';
import { formatDateISOToBR, formatCEP } from '../utils/formUtils';

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
    if (!formData.price.trim()) errors.price = 'Preço é obrigatório';
    if (!formData.modalidade.trim()) errors.modalidade = 'Modalidade é obrigatória';
    if (!formData.quadra.trim()) errors.quadra = 'Nome da quadra é obrigatório';
    if (!formData.cep.trim()) errors.cep = 'CEP é obrigatório';

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