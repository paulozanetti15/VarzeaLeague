export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
// Front-end/src/config/api.ts
// Configuração centralizada da API

const getApiBase = (): string => {
  // Em produção, usar variável de ambiente
  // Em desenvolvimento, usar localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

const getApiUploads = (): string => {
  // URL base para uploads (sem /api)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  return apiUrl.replace('/api', '');
};

export const API_BASE = getApiBase();
export const API_UPLOADS = getApiUploads();

// Helper para construir URLs de imagens
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // Se já é uma URL completa, retornar como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Se começa com /uploads, adicionar base URL
  if (path.startsWith('/uploads')) {
    return `${API_UPLOADS}${path}`;
  }
  
  // Se não começa com /, assumir que é relativo a /uploads
  return `${API_UPLOADS}/uploads/${path}`;
};

// Helper para banner de times
export const getTeamBannerUrl = (banner: string | null | undefined): string => {
  if (!banner) return '';
  return getImageUrl(banner.startsWith('/uploads/teams/') ? banner : `/uploads/teams/${banner}`);
};

// Helper para logo de campeonatos
export const getChampionshipLogoUrl = (logo: string | null | undefined): string => {
  if (!logo) return '';
  return getImageUrl(logo.startsWith('/uploads/championships/') ? logo : `/uploads/championships/${logo}`);
};

