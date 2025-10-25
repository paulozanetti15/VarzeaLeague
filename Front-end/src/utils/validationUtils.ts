import { isValid, isAfter, startOfDay, isBefore } from 'date-fns';



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

    // Não permitir data limite no passado
    if (isBefore(parsedDataLimite, hoje)) {
      return { isValid: false, error: 'A data limite não pode ser anterior a hoje' };
    }

    // Deve ser estritamente anterior à data da partida
    if (!isAfter(parsedDataPartida, parsedDataLimite)) {
      return { isValid: false, error: 'A data limite deve ser anterior à data da partida' };
    }

    // Também impedir mesma data da partida
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

  
  static formatDateISOToBR(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  static applyDateMask(value: string): string {
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
  }
}


export const VALIDATION_CONSTANTS = {
  MAX_IDADE: 100,
  MIN_IDADE: 0,
  GENEROS_VALIDOS: ['Masculino', 'Feminino', 'Ambos'] as const,
  DATE_FORMAT: 'DD/MM/YYYY'
} as const;