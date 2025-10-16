import React from 'react';

interface StarRatingProps {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, size = 26 }) => {
  return (
    <div className="stars-wrapper" role="radiogroup" aria-label="Nota da partida">
      {[1, 2, 3, 4, 5].map(n => {
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            className={`star-btn ${active ? 'active' : ''}`}
            aria-checked={active}
            aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
            onClick={() => onChange(n)}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={active ? '#ffb400' : 'none'}
              stroke={active ? '#ffb400' : '#cccccc'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
