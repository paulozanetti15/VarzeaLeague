import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import WcIcon from '@mui/icons-material/Wc';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaletteIcon from '@mui/icons-material/Palette';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import './EditTeam.css';
import { toast } from 'react-hot-toast';

interface TeamFormData {
  name: string;
  description: string;
  playerEmails: string[];
  idademaxima: number | null;
  idademinima: number | null;
  maxparticipantes: number | null;
  sexo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  banner: string | null;
  bannerFile: File | null;
  bannerPreview: string | null;
}

interface Team {
  id: string;
  name: string;
  description: string;
  banner: string | null;
  idademinima: number | null;
  idademaxima: number | null;
  maxparticipantes: number | null;
  sexo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  players: {
    id: string;
    email: string;
  }[];
}

const EditTeam: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    playerEmails: [''],
    idademaxima: null,
    idademinima: null,
    maxparticipantes: null,
    sexo: null,
    primaryColor: null,
    secondaryColor: null,
    banner: null,
    bannerFile: null,
    bannerPreview: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isWarning, setIsWarning] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Movida para dentro do componente e corrigido o problema de atribuição dupla
 

  useEffect(() => {
    if (!id) {
      setError('ID do time não especificado. Redirecionando para a lista de times...');
      setTimeout(() => navigate('/teams'), 2000);
      return;
    }
    
    fetchTeam();
  }, [id, navigate]);

  const fetchTeam = async () => {
    // Código existente mantido como está
    // ...
    setLoadingInitial(true);
    setError('');
    setIsWarning(false);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/teams/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const teamData = response.data;
      console.log('Dados do time recebidos da API:', teamData);
      if (teamData.players) {
        console.log(`Recebidos ${teamData.players.length} jogadores do back-end:`, 
          teamData.players.map((p: any) => `${p.email} (${p.id})`).join(', '));
      }
      
      setTeam(teamData);
      
      // Garante que todos os emails dos jogadores sejam carregados
      let playerEmails: string[] = [];
      
      // Verifica se players existe e é um array
      if (teamData.players && Array.isArray(teamData.players) && teamData.players.length > 0) {
        // Extrai os emails dos jogadores
        playerEmails = teamData.players
          .filter((player: any) => player && player.email) // Garante que o jogador e o email existem
          .map((player: { email: string }) => player.email || '');
        
        console.log('Emails extraídos dos jogadores existentes:', playerEmails);
      }
      
      // Se não houver emails válidos, inicializa com um campo vazio
      if (playerEmails.length === 0) {
        playerEmails = [''];
        console.log('Nenhum jogador encontrado, inicializando com campo vazio');
      }
      
      console.log('Lista final de emails dos jogadores a serem exibidos:', playerEmails);
      
      setFormData({
        name: teamData.name || '',
        description: teamData.description || '',
        playerEmails: playerEmails,
        idademaxima: teamData.idademaxima || null,
        idademinima: teamData.idademinima || null,
        maxparticipantes: teamData.maxparticipantes || null,
        sexo: teamData.sexo || null,
        primaryColor: teamData.primaryColor || null,
        secondaryColor: teamData.secondaryColor || null,
        banner: teamData.banner || null,
        bannerFile: null,
        bannerPreview: null
      });
    } catch (err: any) {
      console.error('Erro ao buscar time:', err);
      
      // Mensagem específica para erro de permissão
      if (err.response?.status === 403) {
        setError('Você não tem permissão para visualizar este time. Apenas o capitão e jogadores do time podem acessá-lo.');
        setTimeout(() => navigate('/teams'), 4000);
      } else {
        setError('Erro ao carregar o time. Tente novamente.');
      }
    } finally {
      setLoadingInitial(false);
    }
  };
  // Adicione esta função de validação ao componente EditTeam
  const validateFields = (): boolean => {
  // Verificar campos obrigatórios
    if (!formData.name || formData.name.trim() === '') {
      setError('Nome do time é obrigatório.');
      return false;
    }

    if (!formData.description || formData.description.trim() === '') {
      setError('Descrição do time é obrigatória.');
      return false;
    }

    if (formData.idademinima === null || formData.idademinima <= 0) {
      setError('Idade mínima deve ser um número válido maior que zero.');
      return false;
    }

    if (formData.idademaxima === null || formData.idademaxima <= 0) {
      setError('Idade máxima deve ser um número válido maior que zero.');
      return false;
    }

    if (formData.idademinima > formData.idademaxima) {
      setError('Idade mínima não pode ser maior que a idade máxima.');
      return false;
    }

    if (formData.maxparticipantes === null || formData.maxparticipantes <= 0) {
      setError('Máximo de participantes deve ser um número válido maior que zero.');
      return false;
    }

    if (!formData.sexo || formData.sexo.trim() === '') {
      setError('Sexo do time é obrigatório.');
      return false;
    }

    if (!formData.primaryColor || formData.primaryColor.trim() === '') {
      setError('Cor primária é obrigatória.');
      return false;
    }

    if (!formData.secondaryColor || formData.secondaryColor.trim() === '') {
      setError('Cor secundária é obrigatória.');
      return false;
    }

    // Validação dos emails
    const emailsPreenchidos = formData.playerEmails.filter(email => email && email.trim() !== '');
    
    if (emailsPreenchidos.length === 0) {
      setError('É necessário adicionar pelo menos um jogador ao time.');
      return false;
    }

    // Verificar se há emails inválidos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailsInvalidos = emailsPreenchidos.filter(email => !emailRegex.test(email));
    
    if (emailsInvalidos.length > 0) {
      setError(`Os seguintes emails são inválidos: ${emailsInvalidos.join(', ')}`);
      return false;
    }

    // Verificar se há emails duplicados
    const emailsUnicos = new Set(emailsPreenchidos.map(email => email.toLowerCase()));
    if (emailsUnicos.size < emailsPreenchidos.length) {
      setError('Existem emails duplicados na lista de jogadores.');
      return false;
    }

    // Verificar se o número máximo de jogadores não é excedido
    if (emailsPreenchidos.length > formData.maxparticipantes) {
      setError(`Você adicionou ${emailsPreenchidos.length} jogadores, mas o máximo permitido é ${formData.maxparticipantes}.`);
      return false;
    }

    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsWarning(false);
    if(!validateFields()) {
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Filtra os emails vazios antes de enviar
      const filteredEmails = formData.playerEmails
        .filter(email => email && email.trim() !== '')
        .map(email => email.trim());
      
      // Verifica se os dados obrigatórios estão preenchidos
      if (!formData.name || !formData.description) {
        setError('Nome e descrição são obrigatórios.');
        setLoading(false);
        return;
      }

      // Usando FormData para enviar o arquivo junto com os outros dados
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('playerEmails', JSON.stringify(filteredEmails));
      console.log('Emails filtrados para envio:', formData.name);

      if (formData.idademinima !== null) {
        formDataToSend.append('idademinima', formData.idademinima.toString());
      }
      
      if (formData.idademaxima !== null) {
        formDataToSend.append('idademaxima', formData.idademaxima.toString());
      }
      
      if (formData.maxparticipantes !== null) {
        formDataToSend.append('maxparticipantes', formData.maxparticipantes.toString());
      }
      
      if (formData.sexo) {
        formDataToSend.append('sexo', formData.sexo);
      }
      
      if (formData.primaryColor) {
        formDataToSend.append('primaryColor', formData.primaryColor);
      }
      
      if (formData.secondaryColor) {
        formDataToSend.append('secondaryColor', formData.secondaryColor);
      }
     
      
      const response = await axios.put(`http://localhost:3001/api/teams/${id}`,
        {
          name: formData.name,         
          description: formData.description,
          idademinima: formData.idademinima,
          idademaxima: formData.idademaxima,
          maxparticipantes: formData.maxparticipantes,
          sexo: formData.sexo,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          playerEmails: filteredEmails,
          bannerFile: formData.bannerFile // Envia o arquivo do banner, se houver
        },

        {
        headers: {
          Authorization: `Bearer ${token}`
          // Importante para envio de arquivos
        }
      });
      
      console.log('Resposta da API:', response.data);
      
      // Verifica se todos os emails foram associados
      if (response.data.players && Array.isArray(response.data.players)) {
        const emailsEnviados = filteredEmails.map(email => email.toLowerCase());
        const emailsRecebidos = response.data.players.map((p: any) => p.email.toLowerCase());
        
        // Emails que foram enviados mas não retornados na resposta
        const emailsNaoEncontrados = emailsEnviados.filter(email => !emailsRecebidos.includes(email));
        
        if (emailsNaoEncontrados.length > 0) {
          console.log('Alguns emails não puderam ser adicionados:', emailsNaoEncontrados);
          
          // Indicamos que o time foi atualizado, mas com aviso sobre emails
          const mensagemSucesso = `Time "${formData.name}" atualizado com sucesso!`;
          const mensagemAviso = `No entanto, os seguintes emails não foram encontrados no sistema: ${emailsNaoEncontrados.join(', ')}. Apenas usuários já cadastrados podem ser adicionados ao time.`;
          
          setError(`${mensagemSucesso} ${mensagemAviso}`);
          setIsWarning(true);
          
          // Mantemos o usuário na página para que ele possa ver a mensagem
          setLoading(false);
          return;
        }
      }
      
      navigate('/teams');
    } catch (err: any) {
      console.error('Erro ao atualizar time:', err);
      // Mostra mensagem de erro mais detalhada, se disponível
      if (err.response?.data?.message) {
        setError(`Erro: ${err.response.data.message}`);
      } else if (err.response?.data?.error) {
        setError(`Erro: ${err.response.data.error}`);
      } else {
        setError('Erro ao atualizar time. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addPlayerEmail = () => {
    setFormData(prev => ({
      ...prev,
      playerEmails: [...prev.playerEmails, ''],
    }));
  };

  const removePlayerEmail = async (index: number) => {
    // Código existente mantido como está
    // ...
    // Armazenar o email que está sendo removido antes de atualizar o estado
    const emailToRemove = formData.playerEmails[index];
    
    // Atualizar o estado local para feedback imediato
    setFormData(prev => ({
      ...prev,
      playerEmails: prev.playerEmails.filter((_, i) => i !== index),
    }));
    
    // Se o email estiver vazio, não precisamos enviar para o servidor
    if (!emailToRemove || emailToRemove.trim() === '') {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Criar uma cópia dos emails atuais sem o removido
      const updatedEmails = formData.playerEmails.filter((_, i) => i !== index);
      
      // Filtrar emails vazios
      const filteredEmails = updatedEmails
        .filter(email => email && email.trim() !== '')
        .map(email => email.trim());
        console.log('Emails filtrados após remoção:', formData.name);
         const response = await axios.put(`http://localhost:3001/api/teams/${id}`,
        {
          name: formData.name,
          description: formData.description,
          idademinima: formData.idademinima,
          idademaxima: formData.idademaxima,
          maxparticipantes: formData.maxparticipantes,
          sexo: formData.sexo,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          playerEmails: filteredEmails
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }, 
        }
      );
      
      console.log('Resposta da API após remoção:', response.data);
      
      // Atualizar o estado do time com a resposta do servidor
      if (response.data) {
        setTeam(response.data);
        toast.success(`Jogador ${emailToRemove} removido com sucesso!`, {
          position: "top-right",
          duration: 3000
        });
      }
    } catch (err: any) {
      console.error('Erro ao remover jogador:', err);
      
      // Reverter a alteração local em caso de erro
      setFormData(prev => ({
        ...prev,
        playerEmails: [
          ...prev.playerEmails.slice(0, index),
          emailToRemove,
          ...prev.playerEmails.slice(index)
        ],
      }));
      
      // Mostra mensagem de erro
      toast.error('Erro ao remover jogador. Por favor, tente novamente.');
      
      if (err.response?.data?.message) {
        setError(`Erro: ${err.response.data.message}`);
      } else if (err.response?.data?.error) {
        setError(`Erro: ${err.response.data.error}`);
      } else {
        setError('Erro ao remover jogador. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerEmail = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      playerEmails: prev.playerEmails.map((email, i) => 
        i === index ? value : email
      ),
    }));
  };

  const handleDeleteTeam = async () => {
    // Código existente mantido como está
    // ...
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios({
        method: 'delete',
        url: `http://localhost:3001/api/teams/${id}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: { confirm: true }
      });

      navigate('/teams');
    } catch (err: any) {
      console.error('Erro ao deletar time:', err);
      if (err.response?.data?.message) {
        setError(`Erro: ${err.response.data.message}`);
      } else if (err.response?.data?.error) {
        setError(`Erro: ${err.response.data.error}`);
      } else {
        setError('Erro ao deletar time. Tente novamente.');
      }
      setShowDeleteConfirm(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando time...</p>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="error-container">
        <div className="error-content">
          <span role="img" aria-label="error" className="error-icon">❌</span>
          <h2>Erro</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/teams')}
            className="error-back-btn"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Time não encontrado. Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="edit-team-container">
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="soccer-ball-container"
      >
        <SportsSoccerIcon className="soccer-ball-icon" />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="back-btn"
        onClick={() => navigate('/teams')}
      >
        <ArrowBackIcon className="back-icon" />
        <span>Voltar</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="form-container"
      >
        <div className="form-header">
          <h1 className="form-title">Editar meu time</h1>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={isWarning ? "warning-message" : "error-message"}
          >
            <div className="error-content">
              {error}
            </div>
            {error.includes('não foram encontrados no sistema') && (
              <div className="error-actions">
                <p>Suas alterações foram salvas, mas nem todos os jogadores foram adicionados.</p>
                <button 
                  onClick={() => navigate('/teams')}
                  className="return-btn"
                >
                  Voltar
                </button>
              </div>
            )}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="edit-team-form">
          {/* Banner com upload */}
          <div className="preview-banner">
            <div className="logo-preview-container">
              {(formData.bannerPreview || team.banner) ? (
                <img 
                  src={formData.bannerPreview || `http://localhost:3001${team.banner}`} 
                  className="team-banner-img" 
                />
              ) : (
                <GroupIcon className="default-team-icon" />
              )}   
            </div>
          </div>      
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="form-group"
          >
            <label className="form-label">
              <GroupIcon className="input-icon" />
              Nome do Time
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome do time"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="form-group"
          >
            <label className="form-label">
              <DescriptionIcon className="input-icon" />
              Descrição
            </label>
            <textarea
              className="form-control"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva seu time"
              rows={3}
              required
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="form-group"
          >
            <label className="form-label">
              <CalendarTodayIcon className="input-icon" />
              Idade Mínima
            </label>
            <input
              className="form-control"
              value={formData.idademinima || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, idademinima: e.target.value ? parseInt(e.target.value, 10) : null }))}
              placeholder="Digite a idade mínima"
              required
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="form-group"
          >
            <label className="form-label">
              <HourglassTopIcon className="input-icon" />
              Idade Máxima
            </label>
            <input
              className="form-control"
              value={formData.idademaxima || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, idademaxima: e.target.value ? parseInt(e.target.value, 10) : null }))}
              placeholder="Digite a idade máxima"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="form-group"
          >
            <label className="form-label">
              <PeopleAltIcon className="input-icon" />
              Máximo de Participantes permitidos
            </label>
            <input
              className="form-control"
              value={formData.maxparticipantes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, maxparticipantes: e.target.value ? parseInt(e.target.value, 10) : null }))}
              placeholder="Digite o máximo de participantes"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="form-group"
          >
            <label className="form-label">
              <WcIcon className="input-icon" />
              Sexo do Time
            </label>
            <select
              className="form-control"
              value={formData.sexo || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, sexo: e.target.value }))}
              required
            >
              <option value="">Selecione o sexo do time</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="misto">Misto</option>
            </select>  
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="form-group"
          >
            <label className="form-label">
              <PaletteIcon className="input-icon" />
              Cor Primária
            </label>
            <input
              className="form-control color-input"
              type="color"
              value={formData.primaryColor || '#1a237e'}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value}))}
              required
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="form-group"
          >
            <label className="form-label">
              <PaletteIcon className="input-icon" />
              Cor Secundária
            </label>
            <input
              className="form-control color-input"
              type="color"
              value={formData.secondaryColor || '#0d47a1'}
              onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value}))}
              required
            />
          </motion.div>
           
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="form-group"
          >
            <label className="form-label">
              <GroupIcon className="input-icon" />
              Integrantes do Time ({formData.playerEmails.length}) / {formData.maxparticipantes}
            </label>
            <p className="player-email-help">
              Os emails abaixo correspondem aos jogadores do time. Você pode adicionar ou remover jogadores conforme necessário.
            </p>
            <div className="player-emails">
              {formData.playerEmails.map((email, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="player-email"
                >
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => updatePlayerEmail(index, e.target.value)}
                    placeholder={`Email do jogador #${index + 1}`}
                  />
                  <button
                    type="button"
                    className="remove-player-btn"
                    onClick={() => removePlayerEmail(index)}
                    aria-label="Remover jogador"
                    title="Remover jogador"
                  >
                    <RemoveIcon />
                  </button>
                </motion.div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="add-player-btn"
              onClick={addPlayerEmail}
              title="Adicionar novo jogador"
            >
              <AddIcon className="button-icon" />
              Adicionar Jogador
            </motion.button>
          </motion.div>

          {/* Seção de Exclusão do Time */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="form-group delete-section"
          >
            <label className="form-label delete-label">
              <WarningIcon className="warning-icon" />
              Área de Perigo
            </label>
            <div className="delete-card">
              <div className="delete-card-content">
                <h3>Deletar Time</h3>
                <p>Esta ação não pode ser desfeita. Todos os dados do time serão permanentemente excluídos.</p>
                <button 
                  type="button"
                  className="delete-team-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <DeleteIcon className="button-icon" />
                  Deletar Time
                </button>
              </div>
            </div>
          </motion.div>

          <div className="form-buttons">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {showDeleteConfirm && (
        <div className="delete-modal">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="delete-modal-content"
          >
            <div className="warning-icon-container">
              <WarningIcon className="large-warning-icon" />
            </div>
            <h2>Confirmar Deleção</h2>
            <p>Tem certeza que deseja deletar o time "<strong>{team?.name}</strong>"?</p>
            <p className="warning-text">Esta ação não pode ser desfeita!</p>
            
            <div className="delete-modal-actions">
              <button 
                className="confirm-delete-btn"
                onClick={handleDeleteTeam}
              >
                Sim, Deletar Time
              </button>
              <button 
                className="cancel-delete-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EditTeam;