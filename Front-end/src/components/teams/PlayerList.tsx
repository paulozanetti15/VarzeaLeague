import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WcIcon from '@mui/icons-material/Wc';
import type { Player } from '../../interfaces/team';

interface PlayerListProps {
  players: Player[];
  loading: boolean;
  expanded: boolean;
  primaryColor?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  loading,
  expanded,
  primaryColor = '#2196F3'
}) => {
  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          className="team-players-expanded"
          initial={{ opacity: 0, height: 0, overflow: "hidden" }}
          animate={{ opacity: 1, height: "auto", transition: { duration: 0.3 } }}
          exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
        >
          <h3 className="team-section-title">
            <SportsSoccerIcon style={{ marginRight: '8px', color: primaryColor }} />
            Jogadores do Time
          </h3>

          {loading ? (
            <div className="team-loading-players">
              <div className="loading-spinner-small"></div>
              <span>Carregando jogadores...</span>
            </div>
          ) : players && players.length > 0 ? (
            <div className="team-players-grid">
              {players.map((player, playerIndex) => (
                <motion.div
                  key={player.id || playerIndex}
                  className="team-player-item"
                  style={{
                    borderLeft: `4px solid ${primaryColor}`
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: Math.min(0.03 * playerIndex, 0.2),
                      duration: 0.2
                    }
                  }}
                >
                  <div className="player-name-position">
                    <div className="player-name-container">
                      <PersonIcon style={{
                        fontSize: '1.2rem',
                        marginRight: '6px',
                        color: '#ffffff',
                        flexShrink: 0
                      }} />
                      <span className="player-name" title={player.nome}>
                        {player.nome}
                      </span>
                    </div>
                    <span className="player-position" style={{ flexShrink: 0 }}>
                      {player.posicao}
                    </span>
                  </div>
                  <div className="player-details">
                    <span className="player-year">
                      <CalendarTodayIcon style={{
                        fontSize: '0.9rem',
                        marginRight: '4px',
                        flexShrink: 0
                      }} />
                      {player.ano}
                    </span>
                    <span className="player-gender">
                      <WcIcon style={{
                        fontSize: '0.9rem',
                        marginRight: '4px',
                        flexShrink: 0
                      }} />
                      {player.sexo}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="team-no-players">
              <SportsSoccerIcon style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '8px' }} />
              <p>Nenhum jogador cadastrado neste time</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerList;