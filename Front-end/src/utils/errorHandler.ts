/*
 * Centralized error handler and friendly messages
 */
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.',
    ACCOUNT_DISABLED: 'Sua conta está desativada. Entre em contato com o suporte.',
    SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente.',
    UNAUTHORIZED: 'Você não tem permissão para acessar este recurso.'
  },
  NETWORK: {
    OFFLINE: 'Você está sem conexão. Verifique sua internet.',
    TIMEOUT: 'A conexão demorou muito para responder. Tente novamente.',
    SERVER_UNREACHABLE: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.',
    SERVICE_UNAVAILABLE: 'Serviço indisponível. Tente novamente mais tarde.'
  },
  VALIDATION: {
    INVALID_EMAIL: 'Por favor, digite um email válido.',
    REQUIRED_FIELD: 'Este campo é obrigatório.',
    INVALID_FORMAT: 'Formato inválido.',
    MIN_LENGTH: (min: number) => `Deve ter pelo menos ${min} caracteres.`,
    MAX_LENGTH: (max: number) => `Não pode ter mais que ${max} caracteres.`
  },
  GENERAL: {
    UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
    NOT_FOUND: 'Recurso não encontrado.',
    FORBIDDEN: 'Acesso negado.'
  }
};

const isErrorTechnical = (msg?: string) => {
  if (!msg) return false;
  const technical = ['sql', 'exception', 'stack', 'trace', 'syntax', 'unexpected', 'typeerror'];
  const lower = msg.toLowerCase();
  return technical.some(t => lower.includes(t));
};

export const getErrorMessage = (error: any): string => {
  if (!error) return ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;

  // Network-level problems
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return ERROR_MESSAGES.NETWORK.SERVER_UNREACHABLE;
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ERROR_MESSAGES.NETWORK.TIMEOUT;
  }

  if (error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message || error.response.data?.error;

    switch (status) {
      case 400:
        if (serverMessage && !isErrorTechnical(serverMessage)) return serverMessage;
        return ERROR_MESSAGES.VALIDATION.INVALID_FORMAT;
      case 401:
        // Verificar se é erro de credenciais incorretas
        if (serverMessage && serverMessage.includes('Email ou senha incorretos')) {
          return ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
        }
        return ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.AUTH.ACCOUNT_DISABLED;
      case 404:
        return ERROR_MESSAGES.NETWORK.SERVICE_UNAVAILABLE;
      case 429:
        return 'Muitas requisições. Tente novamente mais tarde.';
      case 500:
      default:
        if (serverMessage && !isErrorTechnical(serverMessage)) return serverMessage;
        return ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
    }
  }

  if (error.message && !isErrorTechnical(error.message)) return error.message;

  return ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
};

// Validation functions
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email || email.trim() === '') {
    return { valid: false, message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_EMAIL };
  }

  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password === '') {
    return { valid: false, message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD };
  }

  if (password.length < 6) {
    return { valid: false, message: ERROR_MESSAGES.VALIDATION.MIN_LENGTH(6) };
  }

  return { valid: true };
};
