/**
 * Mapeamento de erros HTTP para mensagens amigáveis
 */
export const ERROR_MESSAGES = {
  // Erros de autenticação
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.',
    ACCOUNT_DISABLED: 'Sua conta está desativada. Entre em contato com o suporte.',
    SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente.',
    UNAUTHORIZED: 'Você não tem permissão para acessar este recurso.',
  },
  
  // Erros de rede
  NETWORK: {
    OFFLINE: 'Você está sem conexão. Verifique sua internet.',
    TIMEOUT: 'A conexão demorou muito para responder. Tente novamente.',
    SERVER_UNREACHABLE: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.',
  },
  
  // Erros de validação
  VALIDATION: {
    INVALID_EMAIL: 'Por favor, digite um email válido.',
    INVALID_PASSWORD: 'A senha deve ter pelo menos 6 caracteres.',
    REQUIRED_FIELD: 'Este campo é obrigatório.',
    EMPTY_EMAIL: 'Por favor, digite seu email.',
    EMPTY_PASSWORD: 'Por favor, digite sua senha.',
  },
  
  
};

export const getErrorMessage = (error: any): string => {
  // Erro de rede (servidor offline, sem internet, etc.)
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return ERROR_MESSAGES.NETWORK.SERVER_UNREACHABLE;
  }

  // Erro de timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ERROR_MESSAGES.NETWORK.TIMEOUT;
  }

  // Erros HTTP com resposta do servidor
  if (error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    switch (status) {
      case 400:
        // Bad Request - dados inválidos
        if (serverMessage && !isErrorTechnical(serverMessage)) {
          return serverMessage;
        }
        return 'Dados inválidos. Verifique as informações fornecidas.';
      
      case 401:
        // Unauthorized - credenciais inválidas
        if (serverMessage?.toLowerCase().includes('email') || 
            serverMessage?.toLowerCase().includes('senha') ||
            serverMessage?.toLowerCase().includes('password') ||
            serverMessage?.toLowerCase().includes('credential')) {
          return ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
        }
        if (serverMessage && !isErrorTechnical(serverMessage)) {
          return serverMessage;
        }
        return ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
      
      case 403:
        // Forbidden - conta desabilitada ou sem permissão
        if (serverMessage && !isErrorTechnical(serverMessage)) {
          return serverMessage;
        }
        return ERROR_MESSAGES.AUTH.ACCOUNT_DISABLED;
      
      case 404:
        // Not Found - endpoint não existe (provavelmente servidor offline)
        return ERROR_MESSAGES.NETWORK.SERVICE_UNAVAILABLE;
      
      case 429:
        // Too Many Requests - rate limit
        if (serverMessage && !isErrorTechnical(serverMessage)) {
          return serverMessage;
        }
        return ERROR_MESSAGES.SERVER.TOO_MANY_REQUESTS;
      
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        return ERROR_MESSAGES.SERVER.INTERNAL_ERROR;
      
      default:
        // Se houver mensagem do servidor e ela for amigável, usa ela
        if (serverMessage && !isErrorTechnical(serverMessage)) {
          return serverMessage;
        }
        return ERROR_MESSAGES.GENERIC;
    }
  }

  // Mensagem genérica do erro (sem response do servidor)
  if (error.message) {
    // Erros de fetch
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK.SERVER_UNREACHABLE;
    }
    
    // Se a mensagem já for amigável, retorna ela
    if (!isErrorTechnical(error.message)) {
      return error.message;
    }
  }

  return ERROR_MESSAGES.GENERIC;
};

/**
 * Verifica se uma mensagem é técnica (contém jargão de programação)
 */
const isErrorTechnical = (message: string): boolean => {
  const technicalKeywords = [
    'Error:',
    'TypeError',
    'undefined',
    'null',
    'SQL',
    'Exception',
    'Stack trace',
    'at Object.',
    'at Function.',
    'ERR_',
  ];

  return technicalKeywords.some(keyword => message.includes(keyword));
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email || !email.trim()) {
    return { valid: false, message: ERROR_MESSAGES.VALIDATION.EMPTY_EMAIL };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_EMAIL };
  }

  return { valid: true };
};

/**
 * Valida senha
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || !password.trim()) {
    return { valid: false, message: ERROR_MESSAGES.VALIDATION.EMPTY_PASSWORD };
  }

  if (password.length < 6) {
    return { valid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD };
  }

  return { valid: true };
};
