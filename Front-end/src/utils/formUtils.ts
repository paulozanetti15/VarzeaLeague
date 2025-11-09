import { format, parse, isValid, isAfter, startOfDay, isBefore } from 'date-fns';

export const formatDateISOToBR = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export const applyDateMask = (value: string): string => {
  const dateRegex = /^(\d{0,2})\/(\d{0,2})\/(\d{0,4})$/;
  let formattedDate = value.replace(/\D/g, '');

  if (formattedDate.length <= 8) {
    if (formattedDate.length > 4) {
      formattedDate = formattedDate.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    } else if (formattedDate.length > 2) {
      formattedDate = formattedDate.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    }

    if (dateRegex.test(formattedDate) || formattedDate.length < 10) {
      return formattedDate;
    }
  }

  return value;
};

export const applyTimeMask = (value: string): string => {
  // Remove all non-numeric characters
  let cleaned = value.replace(/\D/g, '');

  // Limit to 4 digits (HHMM)
  if (cleaned.length > 4) {
    cleaned = cleaned.slice(0, 4);
  }

  // Apply HH:MM format
  if (cleaned.length >= 3) {
    // If we have 4 digits, format as HH:MM
    if (cleaned.length === 4) {
      const hours = cleaned.slice(0, 2);
      const minutes = cleaned.slice(2, 4);
      // Validate hours (00-23) and minutes (00-59)
      const hoursNum = parseInt(hours, 10);
      const minutesNum = parseInt(minutes, 10);
      if (hoursNum >= 0 && hoursNum <= 23 && minutesNum >= 0 && minutesNum <= 59) {
        return `${hours}:${minutes}`;
      } else {
        // If invalid, keep only valid parts
        return hoursNum >= 0 && hoursNum <= 23 ? `${hours}:${minutes.slice(0, 2)}` : cleaned.slice(0, 2);
      }
    }
    // If we have 3 digits, format as H:MM
    return `${cleaned.slice(0, 1)}:${cleaned.slice(1, 3)}`;
  } else if (cleaned.length >= 1) {
    // If we have 1-2 digits, just return them (will be formatted as HH when more digits are added)
    return cleaned;
  }

  return '';
};

export const formatDuration = (duration?: string | number): string => {
  if (!duration) return '';
  const minutes = typeof duration === 'string' ? parseInt(duration, 10) : duration;
  if (isNaN(minutes) || minutes <= 0) return '';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins}min`;
};

export const formatCEP = (cep: string): string => {
  cep = cep.replace(/\D/g, '');
  if (cep.length > 8) cep = cep.slice(0, 8);
  if (cep.length > 5) {
    return `${cep.slice(0, 5)}-${cep.slice(5)}`;
  }
  return cep;
};

export const formatCPF = (cpf: string): string => {
  cpf = cpf.replace(/\D/g, '').slice(0, 11);
  if (cpf.length > 9) cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  else if (cpf.length > 6) cpf = cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  else if (cpf.length > 3) cpf = cpf.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  return cpf;
};

export const formatPhone = (phone: string): string => {
  phone = phone.replace(/\D/g, '').slice(0, 11);
  if (phone.length > 10) phone = phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  else if (phone.length > 6) phone = phone.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  else if (phone.length > 2) phone = phone.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  return phone;
};

export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
};

export const checkPasswordStrength = (password: string) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const score = Object.values(requirements).filter(Boolean).length;

  let strength = 'weak';
  if (score >= 5) strength = 'very-strong';
  else if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return {
    isStrong: score >= 4,
    strength,
    requirements,
    score
  };
};

export const validateDataLimite = (dataLimite: string, dataPartida: string): { isValid: boolean; error?: string } => {
  const parsedDataLimite = parse(dataLimite, 'dd/MM/yyyy', new Date());
  const parsedDataPartida = new Date(dataPartida);
  const hoje = startOfDay(new Date());

  if (!isValid(parsedDataLimite)) {
    return { isValid: false, error: 'Data limite inválida. Use o formato DD/MM/AAAA' };
  }

  if (isBefore(parsedDataLimite, hoje)) {
    return { isValid: false, error: 'A data limite não pode ser anterior a hoje' };
  }

  if (!isAfter(parsedDataPartida, parsedDataLimite)) {
    return { isValid: false, error: 'A data limite deve ser anterior à data da partida' };
  }

  const mesmaDataDaPartida =
    parsedDataLimite.getFullYear() === parsedDataPartida.getFullYear() &&
    parsedDataLimite.getMonth() === parsedDataPartida.getMonth() &&
    parsedDataLimite.getDate() === parsedDataPartida.getDate();

  if (mesmaDataDaPartida) {
    return { isValid: false, error: 'A data limite não pode ser no mesmo dia da partida' };
  }

  return { isValid: true };
};

export const validateIdadeRange = (minima: string, maxima: string): { isValid: boolean; errors: { minima?: string; maxima?: string } } => {
  const errors: { minima?: string; maxima?: string } = {};
  const min = parseInt(minima);
  const max = parseInt(maxima);

  if (isNaN(min) || min < 0) {
    errors.minima = 'A idade mínima deve ser um número positivo';
  }

  if (isNaN(max) || max < 0) {
    errors.maxima = 'A idade máxima deve ser um número positivo';
  }

  if (Object.keys(errors).length === 0) {
    if (min > max) {
      errors.minima = 'A idade mínima não pode ser maior que a idade máxima';
      errors.maxima = 'A idade máxima não pode ser menor que a idade mínima';
    }

    if (max > 100) {
      errors.maxima = 'A idade máxima não pode ser maior que 100 anos';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateGenero = (genero: string): { isValid: boolean; error?: string } => {
  const generosValidos = ['Masculino', 'Feminino', 'Ambos'];

  if (!genero || !generosValidos.includes(genero)) {
    return { isValid: false, error: 'Por favor, selecione um gênero válido' };
  }

  return { isValid: true };
};

export const openDatePicker = (inputRef: React.RefObject<HTMLInputElement>, currentValue?: string) => {
  const el = inputRef.current;
  if (!el) return;

  if (currentValue && currentValue.length === 10) {
    const [d, m, y] = currentValue.split('/');
    el.value = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const anyEl = el as any;
  if (typeof anyEl.showPicker === 'function') {
    anyEl.showPicker();
  } else {
    el.click();
  }
};

export function parseDDMMYYYY(value: string): Date | null {
  if (!value) return null;
  try {
    const [day, month, year] = value.split('/').map(Number);
    if (!day || !month || !year) return null;
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export function toISODateTime(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

export function formatToDDMMYYYY(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}

// Classe de validação
export class ValidationUtils {
  static isValidDateFormat(dateString: string): boolean {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    return dateRegex.test(dateString);
  }

  static parseDateBR(dateString: string): Date | null {
    if (!this.isValidDateFormat(dateString)) return null;

    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return isValid(date) ? date : null;
  }

  static validateDataLimite(dataLimite: string, dataPartida: string): { isValid: boolean; error?: string } {
    const parsedDataLimite = this.parseDateBR(dataLimite);
    const parsedDataPartida = new Date(dataPartida);
    const hoje = startOfDay(new Date());

    if (!parsedDataLimite) {
      return { isValid: false, error: 'Data limite inválida. Use o formato DD/MM/AAAA' };
    }

    if (isBefore(parsedDataLimite, hoje)) {
      return { isValid: false, error: 'A data limite não pode ser anterior a hoje' };
    }

    if (!isAfter(parsedDataPartida, parsedDataLimite)) {
      return { isValid: false, error: 'A data limite deve ser anterior à data da partida' };
    }

    const mesmaDataDaPartida =
      parsedDataLimite.getFullYear() === parsedDataPartida.getFullYear() &&
      parsedDataLimite.getMonth() === parsedDataPartida.getMonth() &&
      parsedDataLimite.getDate() === parsedDataPartida.getDate();

    if (mesmaDataDaPartida) {
      return { isValid: false, error: 'A data limite não pode ser no mesmo dia da partida' };
    }

    return { isValid: true };
  }

  static validateIdadeRange(minima: string, maxima: string): { isValid: boolean; errors: { minima?: string; maxima?: string } } {
    const errors: { minima?: string; maxima?: string } = {};
    const min = parseInt(minima);
    const max = parseInt(maxima);

    if (isNaN(min) || min < 0) {
      errors.minima = 'A idade mínima deve ser um número positivo';
    }

    if (isNaN(max) || max < 0) {
      errors.maxima = 'A idade máxima deve ser um número positivo';
    }

    if (Object.keys(errors).length === 0) {
      if (min > max) {
        errors.minima = 'A idade mínima não pode ser maior que a idade máxima';
        errors.maxima = 'A idade máxima não pode ser menor que a idade mínima';
      }

      if (max > 100) {
        errors.maxima = 'A idade máxima não pode ser maior que 100 anos';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateGenero(genero: string): { isValid: boolean; error?: string } {
    const generosValidos = ['Masculino', 'Feminino', 'Ambos'];

    if (!genero || !generosValidos.includes(genero)) {
      return { isValid: false, error: 'Por favor, selecione um gênero válido' };
    }

    return { isValid: true };
  }

  static formatDateBR(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

// Constantes de validação
export const VALIDATION_CONSTANTS = {
  MAX_IDADE: 100,
  MIN_IDADE: 0,
  GENEROS_VALIDOS: ['Masculino', 'Feminino', 'Ambos'] as const,
  DATE_FORMAT: 'DD/MM/YYYY'
} as const;