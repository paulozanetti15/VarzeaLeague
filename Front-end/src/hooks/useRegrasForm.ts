import { useState, useRef } from 'react';
import { format } from 'date-fns';
import {
  formatDateISOToBR,
  applyDateMask,
  validateDataLimite,
  validateIdadeRange,
  validateGenero,
  openDatePicker
} from '../utils/formUtils';

export interface RegrasFormData {
  dataLimite: string;
  horaLimite: string;
  idadeMinima: string;
  idadeMaxima: string;
  genero: string;
}

export interface RegrasFormErrors {
  dataLimite?: string;
  horaLimite?: string;
  idadeMinima?: string;
  idadeMaxima?: string;
  genero?: string;
  general?: string;
}

export const useRegrasForm = (initialData?: Partial<RegrasFormData>) => {
  const [formData, setFormData] = useState<RegrasFormData>({
    dataLimite: initialData?.dataLimite || format(new Date(), 'dd/MM/yyyy'),
    horaLimite: initialData?.horaLimite || '23:59',
    idadeMinima: initialData?.idadeMinima || '',
    idadeMaxima: initialData?.idadeMaxima || '',
    genero: initialData?.genero || '',
  });

  const [errors, setErrors] = useState<RegrasFormErrors>({});
  const [loading, setLoading] = useState(false);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  const handleDataLimiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedDate = applyDateMask(value);

    setFormData(prev => ({ ...prev, dataLimite: formattedDate }));

    if (errors.dataLimite) {
      setErrors(prev => ({ ...prev, dataLimite: undefined }));
    }
  };

  const handleOpenDatePicker = () => {
    openDatePicker(hiddenDateInputRef, formData.dataLimite);
  };

  const handleHiddenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    const br = formatDateISOToBR(iso);
    setFormData(prev => ({ ...prev, dataLimite: br }));
  };

  // Funções de validação
  const verificarDataLimite = (dataLimite: string, dataPartida: string): boolean => {
    const validation = validateDataLimite(dataLimite, dataPartida);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, dataLimite: validation.error }));
      return false;
    }
    return true;
  };

  const validarIdades = (): boolean => {
    const validation = validateIdadeRange(formData.idadeMinima, formData.idadeMaxima);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, ...validation.errors }));
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

    const generoValidation = validateGenero(formData.genero);
    if (!generoValidation.isValid) {
      setErrors(prev => ({ ...prev, genero: generoValidation.error }));
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
      horaLimite: '23:59',
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
    setLoading,
    resetForm,
  };
};