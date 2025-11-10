import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChampionshipById } from '../../../services/championshipsServices';
import LeagueTable from './LeagueTable';
import KnockoutBracket from './KnockoutBracket';
import './ChampionshipClassification.css';

const ChampionshipClassification: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [championship, setChampionship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChampionship = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getChampionshipById(Number(id));
        setChampionship(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar campeonato');
      } finally {
        setLoading(false);
      }
    };

    fetchChampionship();
  }, [id]);

  if (loading) {
    return (
      <div className="classification-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando classificação...</p>
        </div>
      </div>
    );
  }

  if (error || !championship) {
    return (
      <div className="classification-container">
        <div className="error-container">
          <p>{error || 'Campeonato não encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="classification-container">
      <div className="classification-content">
        <motion.div
          className="classification-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="classification-title">Classificação</h1>
          <h2 className="championship-name">{championship.name}</h2>
        </motion.div>

        {championship.tipo === 'liga' ? (
          <LeagueTable championshipId={Number(id)} championshipName={championship.name} />
        ) : championship.tipo === 'mata-mata' ? (
          <KnockoutBracket championshipId={Number(id)} championshipName={championship.name} />
        ) : (
          <div className="no-type-message">
            <p>Tipo de campeonato não identificado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChampionshipClassification;

