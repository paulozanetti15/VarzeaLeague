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
import './EditTeam.css';
import { toast } from 'react-hot-toast';

interface TeamFormData {
  name: string;
  description: string;
  playerEmails: string[];
}

interface Team {
  id: string;
  name: string;
  description: string;
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isWarning, setIsWarning] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    if (!id) {
      setError('ID do time não especificado. Redirecionando para a lista de times...');
      setTimeout(() => navigate('/teams'), 2000);
      return;
    }
    
    fetchTeam();
  }, [id, navigate]);

  const fetchTeam = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsWarning(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Filtra os emails vazios antes de enviar
      const filteredEmails = formData.playerEmails
        .filter(email => email && email.trim() !== '')
        .map(email => email.trim()); // Remove espaços em branco
      
      console.log('Emails dos jogadores antes de filtrar:', formData.playerEmails);
      console.log('Emails dos jogadores após filtrar:', filteredEmails);
      
      // Verifica se há alteração nos emails dos jogadores em relação ao time original
      if (team && team.players) {
        const emailsOriginais = team.players
          .filter(player => player && player.email)
          .map(player => player.email.trim());
        
        const emailsAdicionados = filteredEmails.filter(email => !emailsOriginais.includes(email));
        const emailsRemovidos = emailsOriginais.filter(email => !filteredEmails.includes(email));
        
        console.log('Emails originais dos jogadores:', emailsOriginais);
        console.log('Emails adicionados:', emailsAdicionados);
        console.log('Emails removidos:', emailsRemovidos);
      }
      
      // Verifica se os dados obrigatórios estão preenchidos
      if (!formData.name || !formData.description) {
        setError('Nome e descrição são obrigatórios.');
        setLoading(false);
        return;
      }

      // Dados no formato que o backend espera
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        playerEmails: filteredEmails
      };
      
      console.log('Enviando dados:', dataToSend);

      const response = await axios({
        method: 'put',
        url: `http://localhost:3001/api/teams/${id}`,
        data: dataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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
      
      // Dados no formato que o backend espera
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        playerEmails: filteredEmails
      };
      
      console.log('Enviando dados após remoção de jogador:', dataToSend);
      
      const response = await axios({
        method: 'put',
        url: `http://localhost:3001/api/teams/${id}`,
        data: dataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
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
      <div className="error-container" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        color: 'white',
        padding: '2rem'
      }}>
        <div style={{ 
          background: 'rgba(220, 53, 69, 0.2)', 
          padding: '2rem', 
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <span role="img" aria-label="error" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>❌</span>
          <h2>Erro</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/teams')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              color: 'white',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Voltar para Lista de Times
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
        <SportsSoccerIcon sx={{ fontSize: 40, color: '#2196F3' }} />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="back-btn"
        onClick={() => navigate('/teams')}
      >
        <ArrowBackIcon sx={{ fontSize: 24, color: '#fff' }} />
      </motion.button>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="form-container"
      >
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 className="form-title">Editar Time</h1>
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
                  Voltar para Lista de Times
                </button>
              </div>
            )}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="form-group"
          >
            <label className="form-label">
              <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
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
              <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
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
            transition={{ delay: 0.4 }}
            className="form-group"
          >
            <label className="form-label">
              <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Integrantes do Time ({formData.playerEmails.length})
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
              <AddIcon sx={{ mr: 1 }} />
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
              <WarningIcon sx={{ mr: 1, color: '#dc3545' }} />
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
                  <DeleteIcon sx={{ mr: 1 }} />
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
              className="submit-btn"
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
              <WarningIcon style={{ fontSize: 60, color: '#dc3545' }} />
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