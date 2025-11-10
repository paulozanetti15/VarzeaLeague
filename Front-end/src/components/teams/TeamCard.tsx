import React from 'react';
import { motion } from 'framer-motion';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { Team } from '../../interfaces/team';
import { getTeamBannerUrl } from '../../config/api';

interface TeamCardProps {
  team: Team;
  children?: React.ReactNode;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, children }) => {
  return (
    <div className="team-card team-detail-card">
      <div
        className="team-banner"
        style={{
          background: team.primaryColor && team.secondaryColor
            ? `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`
            : undefined
        }}
      >
        {team.banner ? (
          <img
            src={getTeamBannerUrl(team.banner) || ''}
            alt={team.name}
            className="team-banner-img"
          />
        ) : (
          <GroupIcon sx={{ fontSize: 40, color: '#fff' }} />
        )}
      </div>

      <div className="team-info">
        <h2 className="team-name">{team.name}</h2>

        <div className="team-info-badges">
          {(team.estado || team.cidade) && (
            <span className="team-location-badge">
              {team.estado && <>{team.estado}{team.cidade ? ' - ' : ''}</>}{team.cidade}
            </span>
          )}
          {(team.primaryColor || team.secondaryColor) && (
            <span className="team-colors-badge">
              {team.primaryColor && (
                <span
                  className="color-dot"
                  title="Cor Primária"
                  style={{ background: team.primaryColor }}
                />
              )}
              {team.secondaryColor && (
                <span
                  className="color-dot"
                  title="Cor Secundária"
                  style={{ background: team.secondaryColor }}
                />
              )}
            </span>
          )}
        </div>

        <p className="team-description">
          {team.description || "Sem descrição disponível"}
        </p>

        <div className="team-stats">
          <div className="stat">
            <GroupIcon sx={{ fontSize: 22, color: '#64b5f6' }} />
            <span className="stat-value">{team.players?.length || 0}</span>
            <span className="stat-label">Jogadores</span>
          </div>
          <div className="stat">
            <EmojiEventsIcon sx={{ fontSize: 22, color: '#FFD54F' }} />
            <span className="stat-value">{team.matchCount || 0}</span>
            <span className="stat-label">Partidas</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default TeamCard;