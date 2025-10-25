import { useState, useRef } from 'react';
import { format, parse, isValid, isAfter, startOfDay, isBefore } from 'date-fns';

export interface RegrasFormData {
  dataLimite: string;
  idadeMinima: string;
  idadeMaxima: string;
  genero: string;
}

export interface RegrasFormErrors {
  dataLimite?: string;
  idadeMinima?: string;
  idadeMaxima?: string;
  genero?: string;
  general?: string;
}

export const useRegrasForm = (initialData?: Partial<RegrasFormData>) => {
  const [formData, setFormData] = useState<RegrasFormData>({
    dataLimite: initialData?.dataLimite || format(new Date(), 'dd/MM/yyyy'),
    idadeMinima: initialData?.idadeMinima || '',
    idadeMaxima: initialData?.idadeMaxima || '',
    genero: initialData?.genero || '',
  });

  const [errors, setErrors] = useState<RegrasFormErrors>({});
  const [loading, setLoading] = useState(false);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  // Funções de formatação de data
  const formatDateISOToBR = (iso: string): string => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const handleDataLimiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const dateRegex = /^(\d{0,2})\/(\d{0,2})\/(\d{0,4})$/;
    let formattedDate = value.replace(/\D/g, '');

    if (formattedDate.length <= 8) {
      if (formattedDate.length > 4) {
        formattedDate = formattedDate.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
      } else if (formattedDate.length > 2) {
        formattedDate = formattedDate.replace(/(\d{2})(\d{0,2})/, '$1/$2');
      }

      if (dateRegex.test(formattedDate) || formattedDate.length < 10) {
        setFormData(prev => ({ ...prev, dataLimite: formattedDate }));
        // Limpar erro quando usuário começa a digitar
        if (errors.dataLimite) {
          setErrors(prev => ({ ...prev, dataLimite: undefined }));
        }
      }
    }
  };

  const handleOpenDatePicker = () => {
    const el = hiddenDateInputRef.current;
    if (!el) return;
    if (formData.dataLimite && formData.dataLimite.length === 10) {
      const [d, m, y] = formData.dataLimite.split('/');
      el.value = `${y}-${m}-${d}`;
    }
    const anyEl = el as any;
    if (typeof anyEl.showPicker === 'function') {
      anyEl.showPicker();
    } else {
      el.click();
    }
  };

  const handleHiddenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    const br = formatDateISOToBR(iso);
    setFormData(prev => ({ ...prev, dataLimite: br }));
  };

  // Funções de validação
  const verificarDataLimite = (dataLimite: string, dataPartida: string): boolean => {
    const parsedDataLimite = parse(dataLimite, 'dd/MM/yyyy', new Date());
    const parsedDataPartida = new Date(dataPartida);
    const hoje = startOfDay(new Date());

    if (!isValid(parsedDataLimite)) {
      setErrors(prev => ({ ...prev, dataLimite: 'Data limite inválida. Use o formato DD/MM/AAAA' }));
      return false;
    }

    // Não permitir data limite no passado
    if (isBefore(parsedDataLimite, hoje)) {
      setErrors(prev => ({ ...prev, dataLimite: 'A data limite não pode ser anterior a hoje' }));
      return false;
    }

    // Deve ser estritamente anterior à data da partida
    if (!isAfter(parsedDataPartida, parsedDataLimite)) {
      setErrors(prev => ({ ...prev, dataLimite: 'A data limite deve ser anterior à data da partida' }));
      return false;
    }

    // Também impedir mesma data da partida (caso lógica futura mude o isAfter)
    const mesmaDataDaPartida =
      parsedDataLimite.getFullYear() === parsedDataPartida.getFullYear() &&
      parsedDataLimite.getMonth() === parsedDataPartida.getMonth() &&
      parsedDataLimite.getDate() === parsedDataPartida.getDate();
    if (mesmaDataDaPartida) {
      setErrors(prev => ({ ...prev, dataLimite: 'A data limite não pode ser no mesmo dia da partida' }));
      return false;
    }

    return true;
  };

  const validarIdades = (): boolean => {
    const minima = parseInt(formData.idadeMinima);
    const maxima = parseInt(formData.idadeMaxima);

    if (isNaN(minima) || minima < 0) {
      setErrors(prev => ({ ...prev, idadeMinima: 'A idade mínima deve ser um número positivo' }));
      return false;
    }

    if (isNaN(maxima) || maxima < 0) {
      setErrors(prev => ({ ...prev, idadeMaxima: 'A idade máxima deve ser um número positivo' }));
      return false;
    }

    if (minima > maxima) {
      setErrors(prev => ({
        ...prev,
        idadeMinima: 'A idade mínima não pode ser maior que a idade máxima',
        idadeMaxima: 'A idade máxima não pode ser menor que a idade mínima'
      }));
      return false;
    }

    if (maxima > 100) {
      setErrors(prev => ({ ...prev, idadeMaxima: 'A idade máxima não pode ser maior que 100 anos' }));
      return false;
    }

    return true;
  };

  const validarFormulario = (dataPartida: string): boolean => {
    setErrors({});

    // Validar data limite
    if (!formData.dataLimite || !verificarDataLimite(formData.dataLimite, dataPartida)) {
      return false;
    }

    // Validar idades
    if (!formData.idadeMinima || !formData.idadeMaxima || !validarIdades()) {
      return false;
    }

    // Validar gênero
    if (!formData.genero) {
      setErrors(prev => ({ ...prev, genero: 'Por favor, selecione o gênero da partida' }));
      return false;
    }

    return true;
  };

  // Funções de atualização do formulário
  const updateFormData = (field: keyof RegrasFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começa a editar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setError = (field: keyof RegrasFormErrors, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const resetForm = () => {
    setFormData({
      dataLimite: format(new Date(), 'dd/MM/yyyy'),
      idadeMinima: '',
      idadeMaxima: '',
      genero: '',
    });
    setErrors({});
    setLoading(false);
  };

  return {
    // Estado
    formData,
    errors,
    loading,
    hiddenDateInputRef,

    // Handlers
    handleDataLimiteChange,
    handleOpenDatePicker,
    handleHiddenDateChange,
    updateFormData,

    // Validação
    validarFormulario,
    setError,
    clearErrors,

    // Utilitários
    setLoading,
    resetForm,
  };
};