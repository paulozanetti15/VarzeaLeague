import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface TeamFormData {
  name: string;
  description: string;
  logo?: File;
}

const TeamForm: React.FC = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
  });
  const [previewImage, setPreviewImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const team = response.data;
      setFormData({
        name: team.name,
        description: team.description || '',
      });
      if (team.logo) {
        setPreviewImage(team.logo);
      }
    } catch (err) {
      setError('Erro ao carregar dados do time');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (teamId) {
        // Atualizar time existente
        await axios.put(`http://localhost:3001/api/teams/${teamId}`, {
          name: formData.name,
          description: formData.description
        }, { headers });

        if (formData.logo) {
          const formDataFile = new FormData();
          formDataFile.append('logo', formData.logo);
          await axios.post(
            `http://localhost:3001/api/teams/${teamId}/logo`,
            formDataFile,
            { headers }
          );
        }
      } else {
        // Criar novo time
        const response = await axios.post('http://localhost:3001/api/teams', {
          name: formData.name,
          description: formData.description
        }, { headers });

        if (formData.logo) {
          const formDataFile = new FormData();
          formDataFile.append('logo', formData.logo);
          await axios.post(
            `http://localhost:3001/api/teams/${response.data.id}/logo`,
            formDataFile,
            { headers }
          );
        }
      }

      navigate('/teams');
    } catch (err) {
      setError('Erro ao salvar time');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {teamId ? 'Editar Time' : 'Criar Time'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nome do Time
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Logo do Time
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-2"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-32 h-32 object-cover rounded"
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/teams')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamForm; 