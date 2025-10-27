import { useEffect, useState } from 'react';
import { format, parse as dfParse, isAfter } from 'date-fns';
import * as matchesService from '../services/matchesFriendlyServices';
import { parseDDMMYYYY, toISODateTime } from '../utils/formUtils';
import { time } from 'console';

type FormShape = {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  duration?: string;
  price?: string;
  category?: string;
  modalidade?: string;
  nomequadra?: string;
};

export default function useMatchForm(matchId?: string) {
  const [formData, setFormData] = useState<FormShape>({
    title: '',
    description: '',
    date: format(new Date(), 'dd/MM/yyyy'),
    time: format(new Date(), 'HH:mm'),
    duration: '',
    price: '',
    category: '',
    modalidade: '',
    nomequadra: ''
  });
  const [initialData, setInitialData] = useState<FormShape>(formData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!matchId) return;
      setLoading(true);
      try {
        const res = await matchesService.getMatch(matchId);
        const d = res.data;
        const formatted = {
          title: d.title || '',
          description: d.description || '',
          date: d.date ? format(new Date(d.date), 'dd/MM/yyyy') : '',
          time: d.date ? format(new Date(d.date), 'HH:mm') : '',
          duration: d.duration || '',
          price: d.price ? String(d.price) : '',
          category: d.category || '',
          modalidade: d.modalidade || '',
          nomequadra: d.nomequadra || ''
        };
        setFormData(formatted);
        setInitialData(formatted);
      } catch (err) {
        setError('Erro ao carregar partida');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [matchId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as any;

    // mascaras simples para date/time/duration
    if (name === 'date' || name === 'time' || name === 'duration') {
      let cleaned = value.replace(/\D/g, '');
      if (name === 'date') {
        if (cleaned.length <= 8) {
          if (cleaned.length > 4) cleaned = cleaned.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
          else if (cleaned.length > 2) cleaned = cleaned.replace(/(\d{2})(\d{0,2})/, '$1/$2');
          setFormData(prev => ({ ...prev, [name]: cleaned }));
        }
        return;
      }
      if (name === 'time' || name === 'duration') {
        if (cleaned.length <= 4) {
          if (cleaned.length > 2) cleaned = cleaned.replace(/(\d{2})(\d{0,2})/, '$1:$2');
          setFormData(prev => ({ ...prev, [name]: cleaned }));
        }
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target as any;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateAndBuildPayload = (): { ok: boolean; payload?: any; message?: string } => {
    if (!formData.title || !formData.title.trim()) return { ok: false, message: 'O título da partida é obrigatório' };
    if (!formData.date || !formData.time) return { ok: false, message: 'Data e hora são obrigatórios' };
    if (!formData.modalidade || !formData.modalidade.trim()) return { ok: false, message: 'Modalidade é obrigatória' };
    if (!formData.nomequadra || !formData.nomequadra.trim()) return { ok: false, message: 'Nome da quadra é obrigatório' };

    const parsedDate = parseDDMMYYYY(formData.date || '');
    if (!parsedDate) return { ok: false, message: 'Data inválida. Use o formato DD/MM/AAAA' };

    const [hours, minutes] = formData.time.split(':').map(Number);
    parsedDate.setHours(hours || 0, minutes || 0);

    if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) return { ok: false, message: 'Hora inválida. Use o formato HH:MM' };

    const matchDateTime = dfParse(`${formData.date} ${formData.time}`, 'dd/MM/yyyy HH:mm', new Date());
    if (!isAfter(matchDateTime, new Date())) return { ok: false, message: 'A data da partida deve ser futura' };

    if (formData.price && parseFloat(formData.price) < 0) return { ok: false, message: 'O preço não pode ser negativo' };

    const payload = {
      title: formData.title.trim(),
      date: parsedDate.toISOString(),
      description: formData.description?.trim(),
      time: formData.time,
      duration: formData.duration,
      price: formData.price ? parseFloat(formData.price) : 0.0,
      nomequadra: (formData.nomequadra ?? '').trim(),
      modalidade: (formData.modalidade ?? '').trim()
    };
    console.log(payload)

    return { ok: true, payload };
  };

  const submitForm = async (id: string | undefined) => {
    setError('');
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
    try {
      const res = await matchesService.updateMatch(id, validated.payload);
      if (res.status === 200) {
        return { success: true };
      }
      setError('Erro ao atualizar partida');
      return { success: false };
    } catch (err) {
      setError('Erro ao atualizar partida. Tente novamente.');
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
}
